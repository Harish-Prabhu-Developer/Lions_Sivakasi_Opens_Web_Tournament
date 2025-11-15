// Controller/AcademyPlayerController.js
import AcademyPlayer from "../Models/AcademyPlayerModel.js";
import AcademyEntryModel from "../Models/Academy.EntryModel.js";
// ================= CREATE PLAYER =================
export const createPlayer = async (req, res) => {
  try {
    const { fullName, tnbaId, dob, academy, place, district } = req.body;
    const academyId = req.user.id;

    // Validate required fields
    if (!fullName || !dob || !academy || !place || !district) {
      return res.status(400).json({
        success: false,
        msg: "Full name, date of birth, academy, place, and district are required.",
      });
    }

    // Check for duplicate player in same academy
    const existingPlayer = await AcademyPlayer.findOne({
      academyId,
      fullName: { $regex: new RegExp(`^${fullName}$`, "i") },
      dob
    });

    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        msg: "Player with same name and date of birth already exists in your academy.",
      });
    }

    // Create new player
    const player = await AcademyPlayer.create({
      academyId,
      fullName,
      tnbaId: tnbaId || "",
      dob,
      academy,
      place,
      district
    });

    res.status(201).json({
      success: true,
      msg: "Player added successfully.",
      data: {
        player: {
          id: player._id,
          fullName: player.fullName,
          tnbaId: player.tnbaId,
          dob: player.dob,
          academy: player.academy,
          place: player.place,
          district: player.district,
          createdAt: player.createdAt,
          updatedAt: player.updatedAt
        }
      }
    });
  } catch (error) {
    console.error("Create Player Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error while creating player.",
    });
  }
};
// ================= GET ALL PLAYERS FOR ACADEMY =================
export const getPlayers = async (req, res) => {
  try {
    const academyId = req.user.id;
    const { search } = req.query;

    const players = await AcademyPlayer.findByAcademy(academyId, search);

    // Get entries and payment stats for all players
    const playersWithStats = await Promise.all(
      players.map(async (player) => {
        // Get all entries for this player
        const entries = await AcademyEntryModel.find({
          Academy: academyId,
          player: player._id
        })
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
        .lean();

        // Calculate event counts and payment status
        let totalEvents = 0;
        let paidEvents = 0;
        let pendingEvents = 0;
        let totalEntries = entries.length;

        const eventCounts = {
          singles: 0,
          doubles: 0,
          mixedDoubles: 0,
          total: 0
        };

        entries.forEach(entry => {
          if (entry.events && Array.isArray(entry.events)) {
            entry.events.forEach(event => {
              totalEvents++;
              
              // Count event types
              switch (event.type) {
                case 'singles':
                  eventCounts.singles++;
                  break;
                case 'doubles':
                  eventCounts.doubles++;
                  break;
                case 'mixed doubles':
                  eventCounts.mixedDoubles++;
                  break;
              }

              // Count payment status
              if (event.payment?.status === 'Paid') {
                paidEvents++;
              } else {
                pendingEvents++;
              }
            });
          }
        });

        eventCounts.total = totalEvents;

        return {
          id: player._id,
          fullName: player.fullName,
          tnbaId: player.tnbaId,
          dob: player.dob,
          academy: player.academy,
          place: player.place,
          district: player.district,
          createdAt: player.createdAt,
          updatedAt: player.updatedAt,
          // Add states
          states: {
            entries: {
              total: totalEntries,
              events: {
                total: totalEvents,
                paid: paidEvents,
                pending: pendingEvents,
                counts: eventCounts
              }
            },
            payment: {
              totalPaid: paidEvents,
              totalPending: pendingEvents,
              paymentStatus: paidEvents > 0 ? (pendingEvents > 0 ? 'partial' : 'paid') : 'unpaid'
            }
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      msg: "Players retrieved successfully.",
      data: {
        players: playersWithStats
      }
    });
  } catch (error) {
    console.error("Get Players Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error while fetching players.",
    });
  }
};
// ================= GET SINGLE PLAYER =================
export const getPlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const academyId = req.user.id;

    const player = await AcademyPlayer.findOne({
      _id: id,
      academyId,
      isActive: true
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        msg: "Player not found.",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Player retrieved successfully.",
      data: {
        player: {
          id: player._id,
          fullName: player.fullName,
          tnbaId: player.tnbaId,
          dob: player.dob,
          academy: player.academy,
          place: player.place,
          district: player.district,
          createdAt: player.createdAt,
          updatedAt: player.updatedAt
        }
      }
    });
  } catch (error) {
    console.error("Get Player Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error while fetching player.",
    });
  }
};
// ================= UPDATE PLAYER =================
export const updatePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const academyId = req.user.id;
    
    // Check if req.body exists and has the required fields
    if (!req.body) {
      return res.status(400).json({
        success: false,
        msg: "Request body is required.",
      });
    }

    const { fullName, tnbaId, dob, academy, place, district } = req.body;

    // Validate required fields
    if (!fullName || !dob || !academy || !place || !district) {
      return res.status(400).json({
        success: false,
        msg: "All fields (fullName, dob, academy, place, district) are required.",
      });
    }

    const player = await AcademyPlayer.findOne({
      _id: id,
      academyId,
      isActive: true
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        msg: "Player not found.",
      });
    }

    // Check for duplicate (excluding current player)
    const existingPlayer = await AcademyPlayer.findOne({
      academyId,
      fullName: { $regex: new RegExp(`^${fullName}$`, "i") },
      dob,
      _id: { $ne: id }
    });

    if (existingPlayer) {
      return res.status(400).json({
        success: false,
        msg: "Another player with same name and date of birth already exists.",
      });
    }

    // Update player
    player.fullName = fullName;
    player.tnbaId = tnbaId || "";
    player.dob = dob;
    player.academy = academy;
    player.place = place;
    player.district = district;

    await player.save();

    res.status(200).json({
      success: true,
      msg: "Player updated successfully.",
      data: {
        player: {
          id: player._id,
          fullName: player.fullName,
          tnbaId: player.tnbaId,
          dob: player.dob,
          academy: player.academy,
          place: player.place,
          district: player.district,
          createdAt: player.createdAt,
          updatedAt: player.updatedAt
        }
      }
    });
  } catch (error) {
    console.error("Update Player Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error while updating player.",
    });
  }
};

// ================= DELETE PLAYER =================
export const deletePlayer = async (req, res) => {
  try {
    const { id } = req.params;
    const academyId = req.user.id;

    const player = await AcademyPlayer.findOne({
      _id: id,
      academyId,
      isActive: true
    });

    if (!player) {
      return res.status(404).json({
        success: false,
        msg: "Player not found.",
      });
    }

    // Soft delete by setting isActive to false
    player.isActive = false;
    await player.save();

    res.status(200).json({
      success: true,
      msg: "Player deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Player Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error while deleting player.",
    });
  }
};

// ================= GET PLAYER STATS =================
export const getPlayerStats = async (req, res) => {
  try {
    const academyId = req.user.id;

    const totalPlayers = await AcademyPlayer.countDocuments({ 
      academyId, 
      isActive: true 
    });

    const stats = {
      totalPlayers,
      playersWithTNBAId: await AcademyPlayer.countDocuments({
        academyId,
        isActive: true,
        tnbaId: { $ne: "" }
      })
    };

    res.status(200).json({
      success: true,
      msg: "Stats retrieved successfully.",
      data: { stats }
    });
  } catch (error) {
    console.error("Get Stats Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error while fetching stats.",
    });
  }
};