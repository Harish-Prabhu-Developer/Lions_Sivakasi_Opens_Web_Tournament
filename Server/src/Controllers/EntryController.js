import EntryModel from "../Models/EntryModel.js";
import PaymentModel from "../Models/PaymentModel.js";

/**
 * Add events to player's entry (Add to Cart style)
 * @param {*} req
 * @param {*} res
 */
export const addToEvents = async (req, res) => {
  try {
    const { playerId, events } = req.body;

    if (!playerId || !Array.isArray(events) || !events.length) {
      return res
        .status(400)
        .json({ success: false, msg: "Player ID and events are required" });
    }

    // Find existing entry for player
    let entry = await EntryModel.findOne({ player: playerId });

    if (entry) {
      // Filter out duplicate events (same category & type)
      const existingEvents = entry.events.map((ev) =>
        `${ev.category}-${ev.type}`.toLowerCase()
      );

      const newEvents = events.filter(
        (ev) =>
          !existingEvents.includes(`${ev.category}-${ev.type}`.toLowerCase())
      );

      if (newEvents.length === 0) {
        return res.status(400).json({
          success: false,
          msg: "All selected events already exist in the entry",
        });
      }

      // Combine old + new events
      const updatedEvents = [...entry.events, ...newEvents];

      // Max 4 events check
      if (updatedEvents.length > 4) {
        return res.status(400).json({
          success: false,
          msg: "Maximum 4 events allowed per player",
        });
      }

      entry.events = updatedEvents;
      await entry.save();

      return res.status(200).json({
        success: true,
        msg: "Events added to existing entry successfully",
        data: entry,
      });
    } else {
      // No entry exists — create new one
      if (events.length > 4) {
        return res.status(400).json({
          success: false,
          msg: "Maximum 4 events allowed per player",
        });
      }

      const newEntry = await EntryModel.create({ player: playerId, events });

      return res.status(201).json({
        success: true,
        msg: "New entry created successfully",
        data: newEntry,
      });
    }
  } catch (err) {
    console.log("Create Entry Error:", err);

    // Ensure all validation-style errors return 400
    if (err.success === false || err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        msg:
          err.msg || err.message.replace(/^Validation failed: events:\s*/i, ""),
      });
    }

    // Other server errors
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
      .populate("events.payment");

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
    res.status(200).json({ success: true, data: entries });
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
    if (updatedEvent.ApprovedBy) event.ApprovedBy = updatedEvent.ApprovedBy;

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
    const { entryId, eventId } = req.params;
    const { status } = req.body;
    const entry = await EntryModel.findById(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }
    const event = entry.events.find((e) => e._id.toString() === eventId);
    if (!event) {
      return res.status(404).json({ success: false, msg: "Event not found" });
    }
    event.ApproverdBy = req.user.id;
    event.status = status;
    await entry.save();
    res.status(200).json({ success: true, data: entry });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
