// controllers/PartnerChangeController.js

import EntryModel from "../Models/EntryModel.js";
import PartnerChangeModel from "../Models/PartnerChangeModel.js";

// ===============================
// 📤 PLAYER REQUEST: Change Partner
// ===============================
export const requestPartnerChange = async (req, res) => {
  try {
    const playerId = req.user.id;
    const { form, To, Reason } = req.body;

    if (!Reason) {
      return res
        .status(400)
        .json({ success: false, msg: "Reason is required." });
    }

    if (!form || !To) {
      return res
        .status(400)
        .json({
          success: false,
          msg: "Old and new partner details are required.",
        });
    }

    const newRequest = new PartnerChangeModel({
      form,
      To,
      Reason,
      player: playerId,
    });

    await newRequest.save();
    res.status(201).json({
      success: true,
      msg: "Partner change request submitted successfully.",
      data: newRequest,
    });
  } catch (error) {
    console.error("❌ Partner Change Request Error:", error);
    res
      .status(500)
      .json({ success: false, msg: "Server error while submitting request." });
  }
};

// ===============================
// 📋 ADMIN: Get All Requests
// ===============================
export const getAllPartnerChangeRequests = async (req, res) => {
  try {
    const requests = await PartnerChangeModel.find()
      .populate("player", "name email TnBaId")
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
    const { id } = req.params;
    const { status, AdminMsg } = req.body;
    const adminId = req.user.id;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or missing status value.",
      });
    }

    const request = await PartnerChangeModel.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        msg: "Partner change request not found.",
      });
    }

    let updatedEntry = null;

    // ✅ Approve Flow
    if (status === "approved") {
      updatedEntry = await EntryModel.findOneAndUpdate(
        { "events.partner.TnBaId": request.form.TnBaId },
        { $set: { "events.$.partner": request.To } },
        { new: true }
      );

      if (!updatedEntry) {
        return res.status(404).json({
          success: false,
          msg: "No matching event found for the old partner.",
        });
      }
    } else {
      updatedEntry = await EntryModel.findOneAndUpdate(
        { "events.partner.TnBaId": request.To.TnBaId },
        { $set: { "events.$.partner": request.form } },
        { new: true }
      );
    }

    // ✅ Common Update
    request.status = status;
    request.ApprovredBy = adminId;
    if (AdminMsg) request.AdminMsg = AdminMsg;
    await request.save();

    return res.status(200).json({
      success: true,
      msg:
        status === "approved"
          ? "Partner change approved successfully."
          : "Partner change rejected successfully.",
      data: { request, updatedEntry },
    });
  } catch (error) {
    console.error("❌ Update PartnerChange Error:", error);
    res.status(500).json({
      success: false,
      msg: "Server error while updating partner change status.",
    });
  }
};
