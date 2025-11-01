// EntryController.js
import EntryModel from "../Models/EntryModel.js";
import PaymentModel from "../Models/PaymentModel.js";
import mongoose from "mongoose";
/**
 * Add or update player's events (Add to Cart style)
 * @param {*} req
 * @param {*} res
 */
export const addToEvents = async (req, res) => {
  try {
    const { playerId, events } = req.body;

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
 * Get all entries for the logged-in user
 * Only approved events will be returned in 'approvedEntries'
 */
export const getPlayerEntries = async (req, res) => {
  try {
    const entries = await EntryModel.find({ player: req.user.id })
      .populate("player", "name TnBaId academyName place district")
      .populate("events.payment").populate("events.ApproverdBy");

    // If no entries or all events arrays empty, send empty response.
    if (!entries.length || !entries.some((e) => e.events.length)) {
      return res.status(200).json({ player: req.user.id, events: [] });
    }

    // Flatten and collect only approved events for the user
    const approvedEvents = entries
      .map((e) => e.events.filter((ev) => ev.status === "approved"))
      .flat();

    if (!approvedEvents.length) {
      return res.status(200).json({ player: req.user.id, events: [] });
    }

    res.status(200).json({
      success: true,
      player: req.user.id,
      events: approvedEvents,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

/** * Get all entries (Admin)
 * @param {*} req
 * @param {*} res
 */
export const getEntries = async (req, res) => {
  try {
    const entries = await EntryModel.find()
      .populate("player", "name TnBaId academyName place district")
      .populate("events.payment");
    res.status(200).json({ success: true,data: entries[0] });
  } catch (err) {
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

/** * approve or reject an entry event (Admin)
 * @param {*} req
 * @param {*} res
 */
export const approveRejectEvent = async (req, res) => {
  try {
    // --- FIX START: Validate and cast IDs ---

    // 1. Validate and cast Admin ID (Approver)
    const approverIdString = req.user.id;
    if (!mongoose.Types.ObjectId.isValid(approverIdString)) {
        console.error("❌ Invalid Admin ID provided by request context:", approverIdString);
        return res.status(401).json({ success: false, msg: "Authentication failed: Invalid Admin ID format." });
    }
    const approverId = new mongoose.Types.ObjectId(approverIdString);
    
    // 2. Validate Entry ID from params
    const { entryId, eventId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(entryId)) {
        console.error("❌ Invalid Entry ID format in request params:", entryId);
        return res.status(400).json({ success: false, msg: "Invalid Entry ID format provided." });
    }
    // --- FIX END ---

    const { status } = req.body;
    
    // Use the validated entryId string
    const entry = await EntryModel.findById(entryId).populate("events.payment").populate("events.ApproverdBy").populate("player");
    
    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }
    
    // 3. Find event using Mongoose's .equals() for robust comparison
    const event = entry.events.find((e) => e._id.equals(eventId));
    
    if (!event) {
      return res.status(404).json({ success: false, msg: "Event not found" });
    }

    // 4. Update fields using the casted Admin ID
    event.ApproverdBy = approverId;
    event.status = status;
    
    await entry.save();
    
    res.status(200).json({ success: true, data: entry });
    
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
