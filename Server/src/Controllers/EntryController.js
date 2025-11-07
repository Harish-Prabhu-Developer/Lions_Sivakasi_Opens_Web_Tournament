// EntryController.js
import EntryModel, { EventSchema } from "../Models/EntryModel.js";
import PaymentModel from "../Models/PaymentModel.js";
import mongoose from "mongoose";
import UserModel from "../Models/UserModel.js";
import { sendPlayerEntryStatusEmail } from "../Services/EmailService.js";
/**
 * Add or update player's events (Add to Cart style)
 * @param {*} req
 * @param {*} res
 */
export const addToEvents = async (req, res) => {
  try {
    const { events } = req.body;
    const playerId=req.user.id
    if (!playerId || !Array.isArray(events) || !events.length) {
      return res.status(400).json({
        success: false,
        msg: "Player ID and events are required",
      });
    }

    // Find the existing entry
    let entry = await EntryModel.findOne({ player: playerId });

    // If no entry found, create a new one
    if (!entry) {
      if (events.length > 4) {
        return res.status(400).json({
          success: false,
          msg: "Maximum 4 events allowed per player",
        });
      }

      const newEntry = await EntryModel.create({ player: playerId, events });

      return res.status(201).json({
        success: true,
        msg: "Event Added Successfully",
        data: newEntry,
      });
    }

    // ✅ Clear existing events
    entry.events = [];

    // ✅ Push new events
    entry.events.push(...events);

    // ✅ Max 4 events validation
    if (entry.events.length > 4) {
      return res.status(400).json({
        success: false,
        msg: "Maximum 4 events allowed per player",
      });
    }

    await entry.save();

    return res.status(200).json({
      success: true,
      msg: "Event Added Successfully",
      data: entry,
    });
  } catch (err) {
    console.log("AddToEvents Error:", err);

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
 * Get all entries for the logged-in user record 
 * 
 */
export const getPlayerEntries = async (req, res) => {
  try {
    // 1️⃣ Find all entries for the logged-in player
    const entries = await EntryModel.find({ player: req.user.id })
      .populate("player", "name TnBaId academyName place district")
      .populate("events.payment")
      .populate("events.ApproverdBy")
      .lean(); // returns plain JS objects for easier manipulation

    // 2️⃣ Handle no entries or empty event arrays
    if (!entries.length || !entries.some(e => e.events && e.events.length)) {
      return res.status(200).json({
        success: true,
        _id: entries._id,
        player: req.user.id,
        playerDetails: null,
        events: [],
      });
    }
    
    // 3️⃣ Extract player details from first entry (they’re all same player)
    const playerDetails = entries[0].player;

    // 4️⃣ Combine all event arrays safely (with flatten)
    const allEvents = entries.flatMap(entry => entry.events || []);

    // 5️⃣ Send clean structured response
    res.status(200).json({
      success: true,
      _id:entries[0]._id,
      playerID: req.user.id,
      player:playerDetails,
      totalEvents: allEvents.length,
      events: allEvents,
    });

  } catch (err) {
    console.error("❌ getPlayerEntries Error:", err);
    res.status(500).json({
      success: false,
      msg: err.message || "Something went wrong fetching player entries.",
    });
  }
};


/** * Get all Event entries for Manage Event Entries Page (Admin)
 * @param {*} req
 * @param {*} res
 */
/**
 * Get all Users entries for Manage User Page with pagination  (Admin)
 * @param {*} req - Expects optional 'page' and 'limit' query params
 * @param {*} res
 */
export const getUserEntries = async (req, res) => {
  try {
    // --- Pagination: Get limit and page from query, calculate skip ---
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count (for pagination metadata)
    const totalEntries = await EntryModel.countDocuments();
    // -----------------------------------------------------------------

    const entries = await EntryModel.find()
      .skip(skip) // Apply skip for current page
      .limit(limit) // Apply limit for page size
      .populate("player", "name TnBaId academyName place district gender")
      .populate({
        path: "events.payment",
        // --- MODIFIED: Added 'paymentProof' to selected fields ---
        select: "status metadata paymentAmount paymentApp paymentProof",
      })
      .populate({
        path: "events.ApproverdBy",
        select: "name email",
      })
      .lean(); // Use lean for performance

    // Transform and flatten data for easier frontend consumption
    const formattedEntries = entries.map(entry => {
      const { player, events, createdAt, updatedAt, _id } = entry;
      
      // Aggregate event summaries
      const eventCategories = events.map(e => e.category).join(', ');
      const eventTypes = [...new Set(events.map(e => e.type))].join(', ');
      const eventStatuses = [...new Set(events.map(e => e.status))].join(', ');
      
      return {
        id: _id, // Primary entry ID
        entryDate: createdAt,
        // Player fields
        playerName: player?.name || 'N/A',
        playerTnBaId: player?.TnBaId || 'N/A',
        academy: player?.academyName || 'N/A',
        district: player?.district || 'N/A',
        playerGender: player?.gender || 'N/A', 
        // Event summaries
        eventCount: events.length,
        categories: eventCategories,
        types: eventTypes,
        statuses: eventStatuses,
        // Full nested events for expansion
        detailedEvents: events,
      };
    });

    // --- Pagination: Include metadata in the response ---
    res.status(200).json({ 
      success: true, 
      data: formattedEntries,
      pagination: {
        total: totalEntries,
        limit: limit,
        currentPage: page,
        totalPages: Math.ceil(totalEntries / limit),
      }
    });
    // ----------------------------------------------------

  } catch (err) {
    console.error("❌ getEntries Error:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * Update a specific event item in a player's entry (like updating a cart item)
 * @param {*} req
 * @param {*} res
 */
export const updateEventItem = async (req, res) => {
  try {
    const playerId = req.user.id || req.body.playerId; // supports both protected route & manual playerId
    const updatedEvent = req.body.events?.[0]; // handle the first event in array

    if (!updatedEvent || !updatedEvent.category || !updatedEvent.type) {
      return res.status(400).json({
        success: false,
        msg: "Category and type are required to update an event",
      });
    }

    // Find the player's entry
    const entry = await EntryModel.findOne({ player: playerId });
    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }

    // Find the event by category + type
    const event = entry.events.find(
      (ev) => ev.category === updatedEvent.category && ev.type === updatedEvent.type
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: "Event not found for given category and type",
      });
    }

    // ✅ Update fields
    if (updatedEvent.partner) {
      event.partner = {
        ...event.partner?.toObject?.() || {},
        ...updatedEvent.partner,
      };
      entry.markModified(`events.${entry.events.indexOf(event)}.partner`);
    }

    if (updatedEvent.status) event.status = updatedEvent.status;
    if (updatedEvent.payment) event.payment = updatedEvent.payment;
    if (updatedEvent.ApprovedBy) event.ApproverdBy = updatedEvent.ApprovedBy;

    // ✅ Validation
    if (entry.events.length > 4) {
      return res.status(400).json({
        success: false,
        msg: "Maximum 4 events allowed per player",
      });
    }

    await entry.save();

    res.status(200).json({
      success: true,
      msg: "Event item updated successfully",
      data: entry,
    });

  } catch (err) {
    console.log("Update Event Item Error:", err.message);

    // Validation error
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        msg: err.message.replace(/^Validation failed: events:\s*/i, ""),
      });
    }

    // Other errors
    res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * Approve or reject an entry event (Admin)
 * @param {*} req
 * @param {*} res
 */
export const approveRejectEvent = async (req, res) => {
  try {
    // --- 1️⃣ Validate and cast Admin ID ---
    const approverIdString = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(approverIdString)) {
      console.error("❌ Invalid Admin ID provided:", approverIdString);
      return res.status(401).json({ success: false, msg: "Invalid Admin ID format." });
    }
    const approverId = new mongoose.Types.ObjectId(approverIdString);

    // --- 2️⃣ Validate Entry and Event IDs ---
    const { entryId, eventId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
      return res.status(400).json({ success: false, msg: "Invalid Entry ID format." });
    }
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, msg: "Invalid Event ID format." });
    }

    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, msg: "Invalid status provided." });
    }

    // --- 3️⃣ Find the entry and populate related data ---
    const entry = await EntryModel.findById(entryId)
      .populate("player")
      .populate("events.payment")
      .populate("events.ApproverdBy");

    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }

    // --- 4️⃣ Find the target event ---
    const event = entry.events.find((e) => e._id.equals(eventId));
    if (!event) {
      return res.status(404).json({ success: false, msg: "Event not found" });
    }

    // --- 5️⃣ Update event status and approver ---
    event.ApproverdBy = approverId;
    event.status = status;
    await entry.save();

// --- 6️⃣ Prepare player data for email ---
const playerEmail = entry.player?.email;
const playerName = entry.player?.name; // ✅ FIXED (UserModel uses "name", not "fullname")
const partnerName = event.partner?.fullname || event.partner?.name || null;

if (playerEmail && playerName) {
  const playerData = {
    email: playerEmail,
    name: playerName,
    eventDetails: {
      category: event.category,
      type: event.type,
      registrationDate: new Date(event.RegistrationDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, ' '),
    },
    partnerName,
  };

  try {
    // --- 7️⃣ Send email notification ---
    sendPlayerEntryStatusEmail(playerData, status);
    console.log(`📧 Status email sent to ${playerEmail} (${status})`);
  } catch (emailError) {
    console.error("⚠️ Failed to send status email:", emailError.message);
  }
} else {
  console.warn("⚠️ Player email or name missing, skipping email notification.", {
    playerId: entry.player?._id,
    email: playerEmail,
    name: playerName,
  });
}

    // --- 8️⃣ Respond to client ---
    res.status(200).json({
      success: true,
      msg: `Event has been ${status}`,
      data: entry,
    });
  } catch (err) {
    console.error("❌ Error in approveRejectEvent:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * ✅ Add or update partner details for a specific player's event
 * Used in Step 2 Partner Form in EntryPage
 */
/**
 * ✅ Add or update partner details for a specific player's event
 * Used in Step 2 Partner Form in EntryPage
 */
export const addPartnerToEvent = async (req, res) => {
  try {
    const { category, type, partner } = req.body;

    if (!category || !type || !partner) {
      return res.status(400).json({
        success: false,
        msg: "Category, type, and partner details are required",
      });
    }

    const playerId = req.user.id; // ✅ Logged-in player's ID from token

    // 1️⃣ Find the player's entry
    const entry = await EntryModel.findOne({ player: playerId });
    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }

    // 2️⃣ Find the matching event
    const event = entry.events.find(
      (ev) =>
        ev.category.toLowerCase() === category.toLowerCase() &&
        ev.type.toLowerCase() === type.toLowerCase()
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        msg: `Event not found for ${category} - ${type}`,
      });
    }

    // 3️⃣ Update partner details
    event.partner = {
      ...event.partner?.toObject?.() || {},
      ...partner,
    };
    entry.markModified(`events.${entry.events.indexOf(event)}.partner`);

    // 4️⃣ Save entry
    await entry.save();

    res.status(200).json({
      success: true,
      msg: `${category} (${type}) partner details added successfully!`,
      data: entry,
    });
  } catch (err) {
    console.log("AddPartner Error:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};



/**
 * Get individual Event Entries for Admin Management (Recommended)
 * This uses the Aggregation Pipeline to flatten events, lookup related data, and paginate efficiently.
 * @param {*} req - Expects optional 'page', 'limit', 'status', 'category', 'type' query params
 * @param {*} res
 */
export const getEntries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 🔹 Flatten events from each Entry
    const pipeline = [
      { $unwind: "$events" },

      // 🔹 Lookup player details
      {
        $lookup: {
          from: "users",
          localField: "player",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      { $unwind: "$playerDetails" },

      // 🔹 Lookup payment details
      {
        $lookup: {
          from: "payments",
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

      // 🔹 Filter only entries with payment status "Paid"
      {
        $match: {
          "paymentDetails.status": "Paid"
        }
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
          player: {
            id: "$playerDetails._id",
            name: "$playerDetails.name",
            TnBaId: "$playerDetails.TnBaId",
            gender: "$playerDetails.gender",
            dob: "$playerDetails.dob",
            place: "$playerDetails.place",
            district: "$playerDetails.district",
            phone: "$playerDetails.phone",
            email: "$playerDetails.email",
            academyName: "$playerDetails.academyName",
          },
          payment: {
            id: "$paymentDetails._id",
            status: "$paymentDetails.status",
            ActualAmount: "$paymentDetails.ActualAmount",
            amount: "$paymentDetails.metadata.paymentAmount",
            app: "$paymentDetails.metadata.paymentApp",
            paymentsenderUPI: "$paymentDetails.metadata.senderUpiId",
            createdAt: "$paymentDetails.createdAt",
            paymentProof: "$paymentDetails.paymentProof",
          },
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

    const eventEntries = await EntryModel.aggregate(pipeline);

    // 🔹 Total count for pagination (with the same filter)
    const totalCountPipeline = [
      { $unwind: "$events" },
      {
        $lookup: {
          from: "payments",
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
      {
        $match: {
          "paymentDetails.status": "Paid"
        }
      },
      { $count: "total" }
    ];

    const totalCount = await EntryModel.aggregate(totalCountPipeline);
    const total = totalCount[0]?.total || 0;

    return res.status(200).json({
      success: true,
      data: eventEntries,
      pagination: {
        total,
        limit,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("❌ getEntries Error:", err);
    return res.status(500).json({ success: false, msg: err.message });
  }
};

// Add this to your EntryController.js

/**
 * Get filtered events for reports (Admin)
 * @param {*} req
 * @param {*} res
 */
export const getFilteredEventsForReport = async (req, res) => {
  try {
    const { category, type, status, gender, startDate, endDate } = req.query;

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
      
      // Lookup player details
      {
        $lookup: {
          from: "users",
          localField: "player",
          foreignField: "_id",
          as: "playerDetails",
        },
      },
      { $unwind: "$playerDetails" },
      
      // Apply gender filter after player lookup
      ...(gender ? [{
        $match: {
          "playerDetails.gender": gender
        }
      }] : []),
      
      // Date range filter
      ...(startDate || endDate ? [{
        $match: {
          "events.RegistrationDate": {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) })
          }
        }
      }] : []),

      // Lookup payment details
      {
        $lookup: {
          from: "payments",
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

      // Shape the output
      {
        $project: {
          eventId: "$events._id",
          registrationDate: "$events.RegistrationDate",
          eventStatus: "$events.status",
          eventCategory: "$events.category",
          eventType: "$events.type",
          partner: "$events.partner",
          player: {
            id: "$playerDetails._id",
            name: "$playerDetails.name",
            TnBaId: "$playerDetails.TnBaId",
            gender: "$playerDetails.gender",
            dob: "$playerDetails.dob",
            place: "$playerDetails.place",
            district: "$playerDetails.district",
            phone: "$playerDetails.phone",
            email: "$playerDetails.email",
            academyName: "$playerDetails.academyName",
          },
          payment: {
            status: "$paymentDetails.status",
            amount: "$paymentDetails.metadata.paymentAmount",
            app: "$paymentDetails.metadata.paymentApp",
          },
        },
      },

      // Sort by registration date
      { $sort: { registrationDate: -1 } },
    ];

    const events = await EntryModel.aggregate(pipeline);

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