// Controllers/Academy.EntryController.js
import AcademyEntryModel from "../Models/Academy.EntryModel.js";
import AcademyPlayer from "../Models/AcademyPlayerModel.js";
import UserModel from "../Models/UserModel.js";
import AcademyPayment from "../Models/Academy.PaymentModel.js";
import AcademyPaymentProof from "../Models/Academy.PaymentProof.js";
import { sendPlayerEntryStatusEmail } from "../Services/EmailService.js";

/**
 * Add or update player's events (Add to Cart style)
 */
export const addToAcademyEvents = async (req, res) => {
  try {
    const academy = req.user.id;
    const { playerID } = req.params;
    const { events } = req.body;

    // Validate required fields
    if (!playerID) {
      return res.status(400).json({
        success: false,
        msg: "Player ID is required",
      });
    }

    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Events array is required and cannot be empty",
      });
    }

    // Check if player exists and belongs to the academy
    const player = await AcademyPlayer.findOne({
      _id: playerID,
      academyId: academy,
      isActive: true,
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        msg: "Player not found or does not belong to your academy",
      });
    }

    // Check for existing entry
    let existingEntry = await AcademyEntryModel.findOne({
      Academy: academy,
      player: playerID,
    });

    if (existingEntry) {
      existingEntry.events = events;
      await existingEntry.save();
      
      return res.status(200).json({
        success: true,
        msg: "Events updated successfully",
        data: existingEntry,
      });
    } else {
      const newEntry = new AcademyEntryModel({
        Academy: academy,
        player: playerID,
        events: events,
      });

      await newEntry.save();

      return res.status(201).json({
        success: false,
        msg: "Events added successfully",
        data: newEntry,
      });
    }
  } catch (err) {
    console.log("AddToEvents Error:", err.message);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        msg: err.message.replace(/^Validation failed: events:\s*/i, ""),
      });
    }

    res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * Get all entries for the logged-in academy's player
 */
export const getAcademyPlayerEntries = async (req, res) => {
  try {
    const academyId = req.user.id;
    const { playerID } = req.params;

    if (!playerID) {
      return res.status(400).json({
        success: false,
        msg: "Player ID is required",
      });
    }

    const player = await AcademyPlayer.findOne({
      _id: playerID,
      academyId: academyId,
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        msg: "Player not found or does not belong to your academy",
      });
    }

    // Fixed query - removed the $or condition that was incorrect
    const entries = await AcademyEntryModel.find({ 
      Academy: academyId, 
      player: playerID // Just use player ID directly
    })
    .populate("Academy", "name email academyName place district")
    .populate("player", "fullName tnbaId dob academy place district")
    .populate("events.ApproverdBy", "name email role")
    // ✅ Nested populate (events → payment → paymentProof)
    .populate({
      path: "events",
      populate: [
        {
          path: "payment",
          model: "AcademyPayment",
          populate: {
            path: "paymentProof",
            model: "AcademyPaymentProof"
          }
        }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();

    // Extract all events from entries
    const allEvents = entries.flatMap(entry => entry.events || []);
    
    // Calculate entryIDs safely
    const entryIDs = entries.length > 0 ? entries[0]._id : null;

    return res.status(200).json({
      success: true,
      msg: "Player entries fetched successfully",
      data: {
        player: {
          _id: player._id,
          fullName: player.fullName,
          tnbaId: player.tnbaId,
          dob: player.dob,
          academy: player.academy,
          place: player.place,
          district: player.district,
          age: player.age,
        },
        entries: entries,
        entryIDs: entryIDs, // Safe access
        events: allEvents,
        totalEntries: entries.length,
      },
    });
  } catch (err) {
    console.error("❌ getAcademyPlayerEntries Error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Something went wrong fetching player entries.",
    });
  }
};


/**
 * Get Academy Entries with Payment Status "Paid" - Events Wise
 */
export const getAcademyEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const category = req.query.category || "";
    const type = req.query.type || "";

    console.log("Fetching academy entries with filters:", {
      page,
      limit,
      search,
      status,
      category,
      type
    });

    // Build match filters for aggregation
    const matchFilters = {
      "paymentDetails.status": "Paid" // Only paid entries
    };

    // Add event filters if provided
    const eventMatchFilters = {};
    if (status) eventMatchFilters["events.status"] = status;
    if (category) eventMatchFilters["events.category"] = category;
    if (type) eventMatchFilters["events.type"] = type;

    // Aggregation pipeline to get events individually
    const pipeline = [
      // Unwind events to get each event as separate document
      { $unwind: "$events" },

      // Lookup payment details
      {
        $lookup: {
          from: "academypayments",
          localField: "events.payment",
          foreignField: "_id",
          as: "paymentDetails",
        },
      },
      {
        $addFields: {
          paymentDetails: { $arrayElemAt: ["$paymentDetails", 0] },
        },
      },

      // Apply payment status filter
      {
        $match: matchFilters
      },

      // Lookup player details
      {
        $lookup: {
          from: "academyplayers",
          localField: "player",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      { $unwind: "$playerDetails" },

      // Lookup academy details
      {
        $lookup: {
          from: "users",
          localField: "Academy",
          foreignField: "_id",
          as: "academyDetails",
        },
      },
      { $unwind: "$academyDetails" },

      // Lookup payment proof details
      {
        $lookup: {
          from: "academypaymentproofs",
          localField: "paymentDetails.paymentProof",
          foreignField: "_id",
          as: "paymentProofDetails",
        },
      },
      {
        $addFields: {
          paymentProofDetails: { $arrayElemAt: ["$paymentProofDetails", 0] },
        },
      },

      // Apply event filters
      {
        $match: eventMatchFilters
      },

      // Apply search filter
      {
        $match: search.trim() ? {
          $or: [
            { "playerDetails.fullName": { $regex: search, $options: "i" } },
            { "academyDetails.academyName": { $regex: search, $options: "i" } },
            { "playerDetails.tnbaId": { $regex: search, $options: "i" } },
            { "playerDetails.place": { $regex: search, $options: "i" } },
            { "playerDetails.district": { $regex: search, $options: "i" } }
          ]
        } : {}
      },

      // Project the required fields
      {
        $project: {
          _id: 0,
          id: "$_id", // Entry ID
          eventId: "$events._id",
          Academy: {
            _id: "$academyDetails._id",
            name: "$academyDetails.name",
            email: "$academyDetails.email",
            academyName: "$academyDetails.academyName",
            place: "$academyDetails.place",
            district: "$academyDetails.district"
          },
          player: {
            _id: "$playerDetails._id",
            fullName: "$playerDetails.fullName",
            tnbaId: "$playerDetails.tnbaId",
            dob: "$playerDetails.dob",
            academy: "$playerDetails.academy",
            place: "$playerDetails.place",
            district: "$playerDetails.district",
            isActive: "$playerDetails.isActive"
          },
          eventCategory: "$events.category",
          eventType: "$events.type",
          partner: "$events.partner",
          eventStatus: "$events.status",
          registrationDate: "$events.RegistrationDate",
          payment: {
            _id: "$paymentDetails._id",
            status: "$paymentDetails.status",
            paymentAmount: "$paymentDetails.paymentAmount",
            paymentProof: "$paymentProofDetails",
            paidEvents: "$paymentDetails.paidEvents"
          },
          createdAt: "$createdAt"
        }
      },

      // Sort by registration date (newest first)
      { $sort: { registrationDate: -1 } },

      // Pagination
      { $skip: skip },
      { $limit: limit }
    ];

    // Count pipeline for total documents
    const countPipeline = [
      { $unwind: "$events" },
      {
        $lookup: {
          from: "academypayments",
          localField: "events.payment",
          foreignField: "_id",
          as: "paymentDetails",
        },
      },
      {
        $addFields: {
          paymentDetails: { $arrayElemAt: ["$paymentDetails", 0] },
        },
      },
      { $match: matchFilters },
      {
        $lookup: {
          from: "academyplayers",
          localField: "player",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      { $unwind: "$playerDetails" },
      {
        $lookup: {
          from: "users",
          localField: "Academy",
          foreignField: "_id",
          as: "academyDetails",
        },
      },
      { $unwind: "$academyDetails" },
      { $match: eventMatchFilters },
      {
        $match: search.trim() ? {
          $or: [
            { "playerDetails.fullName": { $regex: search, $options: "i" } },
            { "academyDetails.academyName": { $regex: search, $options: "i" } },
            { "playerDetails.tnbaId": { $regex: search, $options: "i" } },
            { "playerDetails.place": { $regex: search, $options: "i" } },
            { "playerDetails.district": { $regex: search, $options: "i" } }
          ]
        } : {}
      },
      { $count: "total" }
    ];

    // Execute both pipelines
    const [eventEntries, totalCountResult] = await Promise.all([
      AcademyEntryModel.aggregate(pipeline),
      AcademyEntryModel.aggregate(countPipeline)
    ]);

    const total = totalCountResult[0]?.total || 0;

    console.log(`Found ${eventEntries.length} events out of ${total} total`);

    res.status(200).json({
      success: true,
      data: eventEntries,
      pagination: {
        total,
        limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Get Academy Entries Error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Update Event Status
 */
export const updateEventStatus = async (req, res) => {
  try {
    const { entryId, eventId } = req.params;
    const { status } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Valid status (pending, approved, rejected) is required"
      });
    }

    const entry = await AcademyEntryModel.findById(entryId);
    
    if (!entry) {
      return res.status(404).json({
        success: false,
        msg: "Entry not found"
      });
    }

    const event = entry.events.id(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found"
      });
    }

    event.status = status;
    event.ApproverdBy = req.user.id;
    
    await entry.save();

    res.status(200).json({
      success: true,
      msg: "Event status updated successfully",
      data: event
    });

  } catch (error) {
    console.error("Update Event Status Error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message
    });
  }
};


/**
 * Get Payment with Events Details
 */
export const getPaymentWithEvents = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        msg: "Payment ID is required"
      });
    }

    // Find the payment with populated data
    const payment = await AcademyPayment.findById(paymentId)
      .populate('paymentProof')
      .populate('player')
      .populate('Academy')
      .populate('PaidedEvent')
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        msg: "Payment not found"
      });
    }

    // Find the entry to get all events
    const entry = await AcademyEntryModel.findById(payment.PaidedEvent)
      .populate('player')
      .populate('Academy')
      .lean();

    if (!entry) {
      return res.status(404).json({
        success: false,
        msg: "Entry not found"
      });
    }

    // Get all paid events from the payment
    const paidEvents = payment.paidEvents || [];

    // Combine with entry events to get complete event details
    const paidEventsWithDetails = paidEvents.map(paidEvent => {
      const matchingEvent = entry.events.find(event => 
        event.category === paidEvent.category && 
        event.type === paidEvent.type
      );

      return {
        category: paidEvent.category,
        type: paidEvent.type,
        calculatedAmount: paidEvent.amount,
        status: matchingEvent?.status || 'pending',
        registrationDate: matchingEvent?.RegistrationDate,
        isCurrent: matchingEvent ? true : false
      };
    });

    // Calculate total amount
    const totalAmount = paidEvents.reduce((sum, event) => sum + event.amount, 0);

    res.status(200).json({
      success: true,
      data: {
        payment: {
          _id: payment._id,
          status: payment.status,
          paymentAmount: payment.paymentAmount,
          paymentProof: payment.paymentProof,
          paidEvents: paidEventsWithDetails
        },
        totalAmount,
        paidEvents: paidEventsWithDetails,
        entryDetails: {
          player: entry.player,
          Academy: entry.Academy,
          events: entry.events
        }
      }
    });

  } catch (error) {
    console.error("Get Payment With Events Error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Get Academy Entry Details by ID
 */
export const getAcademyEntryDetails = async (req, res) => {
  try {
    const { entryId } = req.params;

    if (!entryId) {
      return res.status(400).json({
        success: false,
        msg: "Entry ID is required"
      });
    }

    // Find the entry with all populated data
    const entry = await AcademyEntryModel.findById(entryId)
      .populate('Academy', 'name email phone academyName place district')
      .populate('player', 'fullName tnbaId dob gender academy place district isActive')
      .populate({
        path: 'events.payment',
        model: 'AcademyPayment',
        populate: {
          path: 'paymentProof',
          model: 'AcademyPaymentProof'
        }
      })
      .lean();

    if (!entry) {
      return res.status(404).json({
        success: false,
        msg: "Entry not found"
      });
    }

    // Find payment for this entry
    const payment = await AcademyPayment.findOne({ PaidedEvent: entryId })
      .populate('paymentProof')
      .lean();

    // Get main event for display (first event)
    const mainEvent = entry.events && entry.events.length > 0 ? entry.events[0] : {};

    // Transform data for frontend
    const transformedEntry = {
      id: entry._id,
      Academy: entry.Academy,
      player: entry.player,
      events: entry.events || [],
      eventCategory: mainEvent.category || "N/A",
      eventType: mainEvent.type || "N/A",
      partner: mainEvent.partner || null,
      eventStatus: mainEvent.status || "pending",
      registrationDate: mainEvent.RegistrationDate || entry.createdAt,
      payment: payment ? {
        _id: payment._id,
        status: payment.status,
        paymentAmount: payment.paymentAmount,
        paymentProof: payment.paymentProof,
        paidEvents: payment.paidEvents || [],
        createdAt: payment.createdAt
      } : null
    };

    res.status(200).json({
      success: true,
      data: transformedEntry
    });

  } catch (error) {
    console.error("Get Academy Entry Details Error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message
    });
  }
};







/**
 * Get filtered academy events for reports (Admin)
 * @param {*} req
 * @param {*} res
 */
export const getFilteredEventsForReport = async (req, res) => {
  try {
    const { category, type, status, academy, partner, player, startDate, endDate } = req.query;

    // Build match stage for aggregation
    const matchStage = { $match: {} };
    
    if (category) {
      matchStage.$match['events.category'] = category;
    }
    
    if (type) {
      matchStage.$match['events.type'] = type;
    }
    
    if (status) {
      matchStage.$match['events.status'] = status;
    }

    // Pipeline for aggregation
    const pipeline = [
      { $unwind: "$events" },
      
      // Apply event filters
      ...(Object.keys(matchStage.$match).length > 0 ? [matchStage] : []),
      
      // Lookup academy details (only role academy)
      {
        $lookup: {
          from: "users",
          localField: "Academy",
          foreignField: "_id",
          as: "academyDetails",
        },
      },
      { $unwind: "$academyDetails" },
      
      // Filter only academy role users
      {
        $match: {
          "academyDetails.role": "academy"
        }
      },
      
      // Apply academy filter after lookup
      ...(academy ? [{
        $match: {
          "academyDetails.academyName": academy
        }
      }] : []),
      
      // Lookup player details
      {
        $lookup: {
          from: "academyplayers",
          localField: "player",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      { $unwind: "$playerDetails" },
      
      // Apply player filter after lookup
      ...(player ? [{
        $match: {
          "playerDetails.fullName": player
        }
      }] : []),

      // Lookup payment details
      {
        $lookup: {
          from: "academypayments",
          localField: "events.payment",
          foreignField: "_id",
          as: "paymentDetails",
        },
      },
      {
        $addFields: {
          paymentDetails: { $arrayElemAt: ["$paymentDetails", 0] },
        },
      },

      // Filter only Paid payment records
      {
        $match: {
          "paymentDetails.status": "Paid"
        }
      },

      // Lookup payment proof details
      {
        $lookup: {
          from: "academypaymentproofs",
          localField: "paymentDetails.paymentProof",
          foreignField: "_id",
          as: "paymentProofDetails",
        },
      },
      {
        $addFields: {
          paymentProofDetails: { $arrayElemAt: ["$paymentProofDetails", 0] },
        },
      },

      // Date range filter
      ...(startDate || endDate ? [{
        $match: {
          "events.RegistrationDate": {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        }
      }] : []),

      // Shape the output
      {
        $project: {
          id: "$_id",
          eventId: "$events._id",
          registrationDate: "$events.RegistrationDate",
          eventStatus: "$events.status",
          eventCategory: "$events.category",
          eventType: "$events.type",
          partner: "$events.partner",
          Academy: {
            id: "$academyDetails._id",
            academyName: "$academyDetails.academyName",
            place: "$academyDetails.place",
            district: "$academyDetails.district",
            TnBaId: "$academyDetails.TnBaId"
          },
          player: {
            id: "$playerDetails._id",
            fullName: "$playerDetails.fullName",
            tnbaId: "$playerDetails.tnbaId",
            dob: "$playerDetails.dob",
            gender:"$playerDetails.gender",
            academy: "$playerDetails.academy",
            place: "$playerDetails.place",
            district: "$playerDetails.district"
          },
          payment: {
            status: "$paymentDetails.status",
            paymentAmount: "$paymentDetails.paymentAmount",
            paidEvents: "$paymentDetails.paidEvents"
          },
          paymentProof: {
            ActualAmount: "$paymentProofDetails.ActualAmount",
            paymentApp: "$paymentProofDetails.metadata.paymentApp",
            senderUpiId: "$paymentProofDetails.metadata.senderUpiId",
            receiverUpiId: "$paymentProofDetails.metadata.receiverUpiId"
          }
        },
      },

      // Sort by registration date
      { $sort: { registrationDate: -1 } },
    ];

    const events = await AcademyEntryModel.aggregate(pipeline);

    return res.status(200).json({
      success: true,
      data: events,
      total: events.length,
    });
  } catch (err) {
    console.error("❌ getFilteredEventsForReport Error:", err);
    return res.status(500).json({ success: false, msg: err.message });
  }
};