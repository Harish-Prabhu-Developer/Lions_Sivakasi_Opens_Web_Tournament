import EntryModel from "../Models/EntryModel.js";
import PaymentModel from "../Models/PaymentModel.js";

/**
 * Create a new tournament entry for a player
 * @param {*} req
 * @param {*} res
 */

export const createEntry = async (req, res) => {
  try {
    const { playerId, events } = req.body;
    
    // Validate player and events constraints...
    // (max 4 events, max 3 singles/doubles, only 1 mixed doubles)
    let singlesDoublesCount = events.filter(e =>
      ["singles", "doubles"].includes(e.type)
    ).length;
    let mixedDoublesCount = events.filter(e =>
      e.type === "mixed doubles"
    ).length;

    if (events.length > 4) {
      return res.status(400).json({ success: false,msg: "Maximum 4 events allowed per player" });
    }
    if (singlesDoublesCount > 3) {
      return res.status(400).json({ success: false,msg: "Maximum 3 singles/doubles events allowed" });
    }
    if (mixedDoublesCount > 1) {
      return res.status(400).json({ success: false,msg: "Only 1 mixed doubles event allowed" });
    }
    const entry = await EntryModel.create({ player:playerId, events });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    console.log("Create Entry Error : ",err.message);
    
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
    if (!entries.length || !entries.some(e => e.events.length)) {
      return res.status(200).json({ player: req.user.id, events: [] });
    }

    // Flatten and collect only approved events for the user
    const approvedEvents = entries
      .map(e => e.events.filter(ev => ev.status === "approved"))
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
    const entries = await EntryModel.find().populate("player", "name TnBaId academyName place district").populate("events.payment");
    res.status(200).json({ success: true, data: entries });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  } 
}

/** * update an entry (Admin)
 * @param {*} req
 * @param {*} res
 */
export const updateEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const entry = await EntryModel.findByIdAndUpdate(entryId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }
    res.status(200).json({ success: true, data: entry });
  } catch (err) {
    console.log("Update Entry Error : ",err.message);
    
    res.status(500).json({ success: false, msg: err.message });
  }
}

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
    const event = entry.events.find(e => e._id.toString() === eventId);
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
}


