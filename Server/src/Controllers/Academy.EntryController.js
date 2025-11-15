// Controllers/Academy.EntryController.js
import AcademyEntryModel from "../Models/Academy.EntryModel.js";
import AcademyPlayer from "../Models/AcademyPlayerModel.js";
import UserModel from "../Models/UserModel.js";

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
// Controllers/Academy.EntryController.js
/**
 * Get individual Event Entries for Admin Management with filtering and pagination
 * @param {*} req - Expects optional 'page', 'limit', 'category', 'type', 'paymentStatus', 'eventStatus' query params
 * @param {*} res
 */
export const getAcademyEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build match filters
    const matchFilters = {};
    
    // Filter by payment status if provided
    if (req.query.paymentStatus) {
      matchFilters["paymentDetails.status"] = req.query.paymentStatus;
    } else {
      // Default: show only paid entries
      matchFilters["paymentDetails.status"] = "Paid";
    }
    
    // Filter by event category if provided
    if (req.query.category) {
      matchFilters["events.category"] = req.query.category;
    }
    
    // Filter by event type if provided
    if (req.query.type) {
      matchFilters["events.type"] = req.query.type;
    }
    
    // Filter by event status if provided
    if (req.query.eventStatus) {
      matchFilters["events.status"] = req.query.eventStatus;
    }

    // 🔹 Flatten events from each Entry
    const pipeline = [
      { $unwind: "$events" },

      // 🔹 Lookup player details from AcademyPlayer
      {
        $lookup: {
          from: "academyplayers",
          localField: "player",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      { $unwind: "$playerDetails" },

      // 🔹 Lookup academy details from User
      {
        $lookup: {
          from: "users",
          localField: "Academy",
          foreignField: "_id",
          as: "academyDetails",
        },
      },
      { $unwind: "$academyDetails" },

      // 🔹 Lookup payment details from AcademyPayment
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

      // 🔹 Lookup payment proof details
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

      // 🔹 Apply filters
      {
        $match: matchFilters
      },

      // 🔹 Lookup approvedBy user (optional)
      {
        $lookup: {
          from: "users",
          localField: "events.ApproverdBy",
          foreignField: "_id",
          as: "approvedByUser",
        },
      },
      {
        $addFields: {
          approvedByUser: { $arrayElemAt: ["$approvedByUser", 0] },
        },
      },

      // 🔹 Shape the output
      {
        $project: {
          _id: 0,
          entryRefId: "$_id",
          eventId: "$events._id",
          registrationDate: "$events.RegistrationDate",
          eventStatus: "$events.status",
          eventCategory: "$events.category",
          eventType: "$events.type",
          isDoubles: {
            $or: [
              { $eq: ["$events.type", "doubles"] },
              { $eq: ["$events.type", "mixed doubles"] },
            ],
          },
          partner: "$events.partner",
          
          // Player details from AcademyPlayer
          player: {
            id: "$playerDetails._id",
            fullName: "$playerDetails.fullName",
            TnBaId: "$playerDetails.tnbaId",
            dob: "$playerDetails.dob",
            academy: "$playerDetails.academy",
            place: "$playerDetails.place",
            district: "$playerDetails.district",
            isActive: "$playerDetails.isActive",
            createdAt: "$playerDetails.createdAt",
            updatedAt: "$playerDetails.updatedAt",
          },

          // Academy details from User
          academy: {
            id: "$academyDetails._id",
            name: "$academyDetails.name",
            email: "$academyDetails.email",
            phone: "$academyDetails.phone",
            academyName: "$academyDetails.academyName",
            place: "$academyDetails.place",
            district: "$academyDetails.district",
          },

          // Payment details from AcademyPayment
          payment: {
            id: "$paymentDetails._id",
            status: "$paymentDetails.status",
            paymentAmount: "$paymentDetails.paymentAmount",
            paidEvents: "$paymentDetails.paidEvents",
            createdAt: "$paymentDetails.createdAt",
            updatedAt: "$paymentDetails.updatedAt",
          },

          // Payment proof details from AcademyPaymentProof
          paymentProof: {
            id: "$paymentProofDetails._id",
            ActualAmount: "$paymentProofDetails.ActualAmount",
            paymentProof: "$paymentProofDetails.paymentProof",
            expertedData: "$paymentProofDetails.expertedData",
            metadata: "$paymentProofDetails.metadata",
            paymentBy: "$paymentProofDetails.paymentBy",
          },

          // Approved by user details
          approvedBy: {
            _id: "$approvedByUser._id",
            name: "$approvedByUser.name",
            email: "$approvedByUser.email",
            phone: "$approvedByUser.phone",
          },
        },
      },

      // 🔹 Sort by registration date (newest first)
      { $sort: { registrationDate: -1 } },

      // 🔹 Pagination
      { $skip: skip },
      { $limit: limit },
    ];

    const eventEntries = await AcademyEntryModel.aggregate(pipeline);

    // 🔹 Total count for pagination (with the same filters)
    const totalCountPipeline = [
      { $unwind: "$events" },

      // Lookup payment details for filtering
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

      // Apply same filters
      {
        $match: matchFilters
      },

      { $count: "total" }
    ];

    const totalCount = await AcademyEntryModel.aggregate(totalCountPipeline);
    const total = totalCount[0]?.total || 0;

    return res.status(200).json({
      success: true,
      msg: "Entries fetched successfully",
      data: eventEntries,
      pagination: {
        total,
        limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ getAcademyEntries Error:", err);
    return res.status(500).json({ 
      success: false, 
      msg: err.message || "Something went wrong while fetching entries" 
    });
  }
};