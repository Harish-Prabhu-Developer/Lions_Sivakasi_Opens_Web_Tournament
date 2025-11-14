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

    // ✅ Fixed population - removed problematic payment population temporarily
    const entries = await AcademyEntryModel.find({ 
      Academy: academyId, 
      player: playerID 
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
        entryIDs: entries[0]._id,
        events: entries.flatMap(entry => entry.events || []),
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