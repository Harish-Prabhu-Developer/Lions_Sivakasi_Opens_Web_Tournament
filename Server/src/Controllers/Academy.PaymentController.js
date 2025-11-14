// Controller/Academy.PaymentController.js
import AcademyPayment from "../Models/Academy.PaymentModel.js";
import AcademyPaymentProof from "../Models/Academy.PaymentProof.js";
import AcademyEntry from "../Models/Academy.EntryModel.js";
import AcademyPlayer from "../Models/AcademyPlayerModel.js";

/**
 * Add payment for player's event entry
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
      status = "Paid" 
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

    // Validate expertedData if provided
    if (expertedData) {
      if (expertedData.paymentAmount && expertedData.paymentAmount <= 0) {
        return res.status(400).json({
          success: false,
          msg: "Valid expected payment amount is required",
        });
      }
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
      },
      paymentBy: academyID,
    });

    const savedPaymentProof = await paymentProofDoc.save();

    // Create payment record for each event in the entry
    const paymentPromises = entry.events.map(async (event) => {
      const payment = new AcademyPayment({
        Academy: academyID,
        player: playerID,
        PaidedEvent: entryID,
        status: status,
        paymentProof: savedPaymentProof._id,
      });

      return await payment.save();
    });

    const payments = await Promise.all(paymentPromises);

    // Update entry events with payment references
    entry.events.forEach((event, index) => {
      event.payment = payments[index]._id;
    });

    await entry.save();

    // Populate the response data
    const populatedPayments = await AcademyPayment.find({
      _id: { $in: payments.map(p => p._id) }
    })
    .populate("Academy", "name email academyName place district")
    .populate("player", "fullName tnbaId dob academy place district")
    .populate("PaidedEvent")
    .populate({
      path: "paymentProof",
      select: "paymentProof ActualAmount expertedData metadata paymentBy"
    });

    return res.status(201).json({
      success: true,
      msg: "Payment added successfully for all events",
      data: {
        paymentProof: savedPaymentProof,
        payments: populatedPayments,
        totalEvents: payments.length,
        entry: entry
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