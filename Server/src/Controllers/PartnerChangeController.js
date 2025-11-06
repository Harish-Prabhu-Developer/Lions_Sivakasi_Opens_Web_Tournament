// controllers/PartnerChangeController.js

import EntryModel from "../Models/EntryModel.js";
import PartnerChangeModel from "../Models/PartnerChangeModel.js";

// ===============================
// 📤 PLAYER REQUEST: Change Partner
// ===============================
export const requestPartnerChange = async (req, res) => {
  try {
    const playerId = req.user.id;
    const { form, To, Reason, EventID } = req.body;

    // 🧩 Validation
    if (!Reason)
      return res.status(400).json({ success: false, msg: "Reason is required." });

    if (!form || !To)
      return res.status(400).json({
        success: false,
        msg: "Old and new partner details are required.",
      });

    if (!EventID)
      return res.status(400).json({
        success: false,
        msg: "Event ID is required.",
      });

    // 🔍 Find the player’s entry document containing the event
    const playerEntry = await EntryModel.findOne({
      player: playerId,
      "events._id": EventID,
    });

    if (!playerEntry)
      return res.status(404).json({
        success: false,
        msg: "Event not found for this player.",
      });

    // ✅ Extract the full event subdocument
    const eventData = playerEntry.events.id(EventID);
    if (!eventData)
      return res.status(404).json({
        success: false,
        msg: "Event details not found in player entry.",
      });

    // ✅ Create Partner Change request using full embedded event data
    const newRequest = new PartnerChangeModel({
      form,
      To,
      Reason,
      Event: eventData.toObject(), // Pass entire event
      player: playerId,
    });

    await newRequest.save();

    return res.status(201).json({
      success: true,
      msg: "Partner change request submitted successfully.",
      data: newRequest,
    });
  } catch (error) {
    console.error("❌ Partner Change Request Error:", error);
    return res.status(500).json({
      success: false,
      msg: "Server error while submitting request.",
      error: error.message,
    });
  }
};
// ===============================
// 📋 ADMIN: Get All Requests
// ===============================
export const getAllPartnerChangeRequests = async (req, res) => {
  try {
    const requests = await PartnerChangeModel.find()
      .populate("player", "name email TnBaId phone academyName place district")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("❌ Fetch PartnerChange Requests Error:", error);
    res
      .status(500)
      .json({
        success: false,
        msg: "Failed to fetch partner change requests.",
      });
  }
};

// ===============================
// 📋 PLAYER: Get Own Requests
// ===============================
export const getMyPartnerChangeRequests = async (req, res) => {
  try {
    const playerId = req.user.id;
    const requests = await PartnerChangeModel.find({ player: playerId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    console.error("❌ Fetch Player PartnerChange Requests Error:", error);
    res
      .status(500)
      .json({ success: false, msg: "Failed to fetch your requests." });
  }
};

// ===============================
// 🔄 ADMIN: Update Partner Change (Approve / Reject)
// ===============================
// ===============================
// 🔄 ADMIN: Update Partner Change (Approve / Reject)
// ===============================
export const updatePartnerChangeStatus = async (req, res) => {
  try {
    const { id } = req.params; // PartnerChange Request ID
    const { status, AdminMsg } = req.body;
    const adminId = req.user.id;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or missing status value.",
      });
    }

    // Find Partner Change Request
    const request = await PartnerChangeModel.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        msg: "Partner change request not found.",
      });
    }

    const eventId = request.Event?._id;
    if (!eventId) {
      return res.status(400).json({
        success: false,
        msg: "Event ID missing in partner change request.",
      });
    }

    let updatedEntry = null;

    // ✅ APPROVE Flow — update the event partner using Event ID
    if (status === "approved") {
      updatedEntry = await EntryModel.findOneAndUpdate(
        { "events._id": eventId },
        { $set: { "events.$.partner": request.To } },
        { new: true }
      );

      if (!updatedEntry) {
        return res.status(404).json({
          success: false,
          msg: "No matching event found for the provided Event ID.",
        });
      }
    }

    // ❌ REJECT Flow — no event modification, only mark rejected
    request.status = status;
    request.ApprovedBy = adminId;
    if (AdminMsg) request.AdminMsg = AdminMsg;

    await request.save();

    return res.status(200).json({
      success: true,
      msg:
        status === "approved"
          ? "Partner change approved and updated successfully."
          : "Partner change request rejected.",
      data: { request, updatedEntry },
    });
  } catch (error) {
    console.error("❌ Update PartnerChange Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error while updating partner change status.",
      error: error.message,
    });
  }
};

