// Controller/Academy.PaymentController.js
import AcademyPayment from "../Models/Academy.PaymentModel.js";
import AcademyPaymentProof from "../Models/Academy.PaymentProof.js";
import AcademyEntry from "../Models/Academy.EntryModel.js";
import AcademyPlayer from "../Models/AcademyPlayerModel.js";
import { sendAdminNotification } from "../Services/EmailService.js";

/**
 * Add payment for specific player events
 * @param {*} req
 * @param {*} res
 */
export const addToAcademyEventPayment = async (req, res) => {
  try {
    const academyID = req.user.id;
    const { playerID, entryID } = req.params;
    const { 
      paymentProof, 
      ActualAmount, 
      expertedData, 
      metadata, 
      status = "Paid",
      paidEvents = [] // ✅ NEW: Receive which events are being paid for
    } = req.body;

    // Validate required fields
    if (!playerID || !entryID) {
      return res.status(400).json({
        success: false,
        msg: "Player ID and Entry ID are required",
      });
    }

    if (!paymentProof) {
      return res.status(400).json({
        success: false,
        msg: "Payment proof is required",
      });
    }

    if (!ActualAmount || ActualAmount <= 0) {
      return res.status(400).json({
        success: false,
        msg: "Valid actual amount is required",
      });
    }

    // ✅ NEW: Validate paidEvents array
    if (!paidEvents || !Array.isArray(paidEvents) || paidEvents.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Paid events array is required",
      });
    }

    // Check if player exists and belongs to the academy
    const player = await AcademyPlayer.findOne({
      _id: playerID,
      academyId: academyID,
      isActive: true,
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        msg: "Player not found or does not belong to your academy",
      });
    }

    // Check if entry exists and belongs to the academy
    const entry = await AcademyEntry.findOne({
      _id: entryID,
      Academy: academyID,
      player: playerID,
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        msg: "Entry not found or does not belong to your academy",
      });
    }

    // Check if events exist in the entry
    if (!entry.events || entry.events.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No events found in this entry",
      });
    }

    // ✅ NEW: Validate that paidEvents actually exist in the entry
    const validPaidEvents = [];
    let calculatedTotal = 0;

    for (const paidEvent of paidEvents) {
      const existingEvent = entry.events.find(event => 
        event.category === paidEvent.category && 
        event.type === paidEvent.type
      );

      if (!existingEvent) {
        return res.status(400).json({
          success: false,
          msg: `Event ${paidEvent.category} ${paidEvent.type} not found in entry`,
        });
      }

      // Check if event is already paid
      if (existingEvent.payment) {
        return res.status(400).json({
          success: false,
          msg: `Event ${paidEvent.category} ${paidEvent.type} is already paid`,
        });
      }

      // Calculate event fee
      const eventFee = paidEvent.type === "singles" ? 900 : 1300;
      calculatedTotal += eventFee;

      validPaidEvents.push({
        category: paidEvent.category,
        type: paidEvent.type,
        amount: eventFee
      });
    }

    // ✅ NEW: Validate payment amount matches calculated total
    if (Math.abs(ActualAmount - calculatedTotal) > 1) {
      return res.status(400).json({
        success: false,
        msg: `Payment amount ₹${ActualAmount} does not match events total ₹${calculatedTotal}`,
      });
    }

    // Create payment proof with new fields
    const paymentProofDoc = new AcademyPaymentProof({
      paymentProof: paymentProof,
      ActualAmount: ActualAmount,
      expertedData: {
        paymentAmount: expertedData?.paymentAmount || ActualAmount,
        receiverUpiId: expertedData?.receiverUpiId || "",
      },
      metadata: {
        paymentApp: metadata?.paymentApp || "",
        paymentAmount: metadata?.paymentAmount || ActualAmount,
        senderUpiId: metadata?.senderUpiId || "",
        receiverUpiId: metadata?.receiverUpiId || expertedData?.receiverUpiId || "",
        paidEventsCount: validPaidEvents.length,
        eventsDetails: validPaidEvents.map(event => `${event.category} ${event.type}`)
      },
      paymentBy: academyID,
    });

    const savedPaymentProof = await paymentProofDoc.save();

    // ✅ UPDATED: Create a single payment record for this batch of events
    const payment = new AcademyPayment({
      Academy: academyID,
      player: playerID,
      PaidedEvent: entryID,
      paidEvents: validPaidEvents,
      paymentAmount: ActualAmount,
      status: status,
      paymentProof: savedPaymentProof._id,
    });

    const savedPayment = await payment.save();

    // ✅ UPDATED: Update only the specific events that were paid for
    entry.events.forEach(event => {
      const isPaidEvent = validPaidEvents.some(paidEvent => 
        paidEvent.category === event.category && 
        paidEvent.type === event.type
      );
      
      if (isPaidEvent) {
        event.payment = savedPayment._id;
      }
    });

    await entry.save();

    // Populate the response data
    const populatedPayment = await AcademyPayment.findById(savedPayment._id)
      .populate("Academy", "name email academyName place district")
      .populate("player", "fullName tnbaId dob academy place district")
      .populate("PaidedEvent")
      .populate({
        path: "paymentProof",
        select: "paymentProof ActualAmount expertedData metadata paymentBy"
      });

 // ✅ FIXED: Prepare payment data with proper payment proof structure
    const notificationData = {
      ...populatedPayment.toObject(),
      paidEvents: validPaidEvents,
      // Ensure payment proof is properly structured
      paymentProof: {
        paymentProof: savedPaymentProof.paymentProof, // This is the image URL
        ActualAmount: savedPaymentProof.ActualAmount,
        expertedData: savedPaymentProof.expertedData,
        metadata: savedPaymentProof.metadata
      },
      metadata: {
        ...populatedPayment.paymentProof?.metadata,
        ocrVerified: metadata?.ocrVerified || false
      }
    };

    console.log('📧 Sending admin notification with data:', {
      hasPaymentProof: !!savedPaymentProof.paymentProof,
      paymentProofUrl: savedPaymentProof.paymentProof ? 'Available' : 'Not Available',
      player: player.fullName,
      amount: ActualAmount
    });

    // ✅ Send admin notification (non-blocking)
    sendAdminNotification(
      notificationData,
      req.user, // academy data
      player,   // player data
      entry     // entry data
    ).catch(error => {
      console.error('❌ Admin notification failed (non-critical):', error);
    });

    return res.status(201).json({
      success: true,
      msg: `Payment added successfully for ${validPaidEvents.length} event(s)`,
      data: {
        paymentProof: savedPaymentProof,
        payment: populatedPayment,
        paidEvents: validPaidEvents,
        totalPaid: ActualAmount,
        remainingEvents: entry.events.filter(event => !event.payment).length
      },
    });

  } catch (err) {
    console.error("❌ addToEventPayment Error:", err);
    
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        msg: err.message,
      });
    }

    res.status(500).json({
      success: false,
      msg: err.message || "Something went wrong while processing payment",
    });
  }
};

/**
 * Get payment details for a specific entry
 * @param {*} req
 * @param {*} res
 */
export const getAcademyEntryPayments = async (req, res) => {
  try {
    const academyID = req.user.id;
    const { playerID, entryID } = req.params;

    if (!playerID || !entryID) {
      return res.status(400).json({
        success: false,
        msg: "Player ID and Entry ID are required",
      });
    }

    // Verify player belongs to academy
    const player = await AcademyPlayer.findOne({
      _id: playerID,
      academyId: academyID,
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        msg: "Player not found or does not belong to your academy",
      });
    }

    // Get all payments for this entry
    const payments = await AcademyPayment.find({
      Academy: academyID,
      player: playerID,
      PaidedEvent: entryID,
    })
    .populate("Academy", "name email academyName place district")
    .populate("player", "fullName tnbaId dob academy place district")
    .populate("PaidedEvent")
    .populate({
      path: "paymentProof",
      select: "paymentProof ActualAmount expertedData metadata paymentBy",
      populate: {
        path: "paymentBy",
        select: "name email academyName"
      }
    })
    .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      msg: "Payments fetched successfully",
      data: {
        player: {
          _id: player._id,
          fullName: player.fullName,
          tnbaId: player.tnbaId,
        },
        payments: payments,
        totalPayments: payments.length,
      },
    });

  } catch (err) {
    console.error("❌ getEntryPayments Error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Something went wrong while fetching payments",
    });
  }
};

/**
 * Update payment status
 * @param {*} req
 * @param {*} res
 */
export const updatePaymentStatus = async (req, res) => {
  try {
    const academyID = req.user.id;
    const { paymentID } = req.params;
    const { status } = req.body;

    if (!paymentID) {
      return res.status(400).json({
        success: false,
        msg: "Payment ID is required",
      });
    }

    if (!["Paid", "Failed", "Pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid status. Must be one of: Paid, Failed, Pending",
      });
    }

    const payment = await AcademyPayment.findOne({
      _id: paymentID,
      Academy: academyID,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        msg: "Payment not found or does not belong to your academy",
      });
    }

    payment.status = status;
    await payment.save();

    const populatedPayment = await AcademyPayment.findById(paymentID)
      .populate("Academy", "name email academyName place district")
      .populate("player", "fullName tnbaId dob academy place district")
      .populate("PaidedEvent")
      .populate({
        path: "paymentProof",
        select: "paymentProof ActualAmount expertedData metadata paymentBy",
        populate: {
          path: "paymentBy",
          select: "name email academyName"
        }
      });

    return res.status(200).json({
      success: true,
      msg: "Payment status updated successfully",
      data: populatedPayment,
    });

  } catch (err) {
    console.error("❌ updatePaymentStatus Error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Something went wrong while updating payment status",
    });
  }
};

/**
 * Verify payment amount matches expected amount
 * @param {*} req
 * @param {*} res
 */
export const verifyPaymentAmount = async (req, res) => {
  try {
    const { paymentID } = req.params;

    if (!paymentID) {
      return res.status(400).json({
        success: false,
        msg: "Payment ID is required",
      });
    }

    const payment = await AcademyPayment.findById(paymentID)
      .populate({
        path: "paymentProof",
        select: "ActualAmount expertedData"
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        msg: "Payment not found",
      });
    }

    const { paymentProof } = payment;
    const actualAmount = paymentProof.ActualAmount;
    const expectedAmount = paymentProof.expertedData.paymentAmount;

    const amountMatches = actualAmount === expectedAmount;
    const amountDifference = actualAmount - expectedAmount;

    return res.status(200).json({
      success: true,
      msg: amountMatches ? "Payment amount matches expected amount" : "Payment amount does not match expected amount",
      data: {
        actualAmount,
        expectedAmount,
        amountMatches,
        amountDifference,
        verificationStatus: amountMatches ? "verified" : "mismatch"
      },
    });

  } catch (err) {
    console.error("❌ verifyPaymentAmount Error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Something went wrong while verifying payment amount",
    });
  }
};