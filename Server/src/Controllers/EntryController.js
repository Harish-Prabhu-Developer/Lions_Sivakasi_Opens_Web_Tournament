import EntryModel from "../Models/EntryModel.js";
import UserModel from "../Models/UserModel.js";

const reqPlayerFields = [
  "Full Name",
  "TNBA ID",
  "Date of Birth",
  "Academy Name",
  "Place",
  "District",
];

// Validate selected events count and mixed doubles count
const validateSelectedEvents = (selectedEvents) => {
  if (!Array.isArray(selectedEvents)) {
    return "Selected events must be an array";
  }

  if (selectedEvents.length === 0) {
    return "At least one event must be selected";
  }

  if (selectedEvents.length > 4) {
    return "Maximum 4 events can be selected";
  }

  const mixedDoublesCount = selectedEvents.filter(
    (ev) => ev.type.toLowerCase() === "mixed doubles"
  ).length;

  if (mixedDoublesCount > 1) {
    return "Only one Mixed Doubles event is allowed";
  }

  return null; // no errors
};

// Validate player or partner details
const validatePersonFields = (person, role, category, type) => {
  if (!person) {
    return `${role} details required for category '${category}' (${type})`;
  }
  for (const field of reqPlayerFields) {
    if (!person[field]) {
      return `${role} field '${field}' is required for category '${category}' (${type})`;
    }
  }
  return null;
};

// Ownership check helper
const checkOwnership = (resourceUserId, currentUserId) => {
  return resourceUserId.toString() === currentUserId.toString();
};



// ============ CREATE ENTRY ============
export const createEntry = async (req, res) => {
  try {
    const { selectedEvents, player, partnersDetails, paymentInfo, metadata } = req.body;

    // Check types count and duplicates
    if (!Array.isArray(selectedEvents)) {
      return res.status(400).json({ success: false, msg: "Selected events must be an array" });
    }

    if (selectedEvents.length === 0) {
      return res.status(400).json({ success: false, msg: "At least one event must be selected" });
    }

    if (selectedEvents.length > 4) {
      return res.status(400).json({ success: false, msg: "Maximum 4 events can be selected" });
    }

    // Count mixed doubles and singles/doubles
    let mixedDoublesCount = 0;
    let singlesDoublesCount = 0;
    const eventSet = new Set();

    for (const ev of selectedEvents) {
      const key = `${ev.category.toLowerCase()}-${ev.type.toLowerCase()}`;
      if (eventSet.has(key)) {
        return res.status(400).json({ success: false, msg: `Duplicate event detected: category '${ev.category}', type '${ev.type}'` });
      }
      eventSet.add(key);

      if (ev.type.toLowerCase() === "mixed doubles") {
        mixedDoublesCount++;
        if (mixedDoublesCount > 1) {
          return res.status(400).json({ success: false, msg: "Only one Mixed Doubles event is allowed" });
        }
      } else if (ev.type.toLowerCase() === "singles" || ev.type.toLowerCase() === "doubles") {
        singlesDoublesCount++;
        if (singlesDoublesCount > 3) {
          return res.status(400).json({ success: false, msg: "Maximum 3 Singles or Doubles events are allowed" });
        }
      } else {
        return res.status(400).json({ success: false, msg: `Invalid event type '${ev.type}'` });
      }
    }

    // Validate player
    const playerErr = validatePersonFields(player, "Player", "all", "N/A");
    if (playerErr) {
      return res.status(400).json({ success: false, msg: playerErr });
    }

    // Convert partnersDetails array to map keyed by category-type for validation
    const buildPartnersMap = (partnersDetails) => {
      const map = {};
      if (!Array.isArray(partnersDetails)) return map;
      partnersDetails.forEach((item) => {
        const key = `${item.category}-${item.type.toLowerCase()}`;
        map[key] = item.partner;
      });
      return map;
    };
    const partners = buildPartnersMap(partnersDetails);

    // Validate partners for doubles/mixed doubles
    for (const ev of selectedEvents) {
      if (["doubles", "mixed doubles"].includes(ev.type.toLowerCase())) {
        const mapKey = `${ev.category}-${ev.type.toLowerCase()}`;
        const partner = partners[mapKey];
        const partnerErr = validatePersonFields(partner, "Partner", ev.category, ev.type);
        if (partnerErr) {
          return res.status(400).json({ success: false, msg: partnerErr });
        }
      }
    }

    // Validate payment info presence
    if (!paymentInfo || !paymentInfo.screenshot) {
      return res.status(400).json({ success: false, msg: "Payment screenshot is required" });
    }

    const user = await UserModel.findById(req.user.id);
     if (!user) {
      return res.status(401).json({
        success: false,
        msg: "User not found",
      });
    }
    // Create entry
    const entry = await EntryModel.create({
      user: req.user.id,
      selectedEvents,
      player,
      partners,
      paymentInfo,
      metadata,
      status: "pending",
    });
    user.entries.push(entry._id);
    await user.save();

    res.status(201).json({
      success: true,
      msg: "Entry submitted successfully",
      data: entry,
    });
  } catch (error) {
    console.error("Create Entry Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error submitting entry",
    });
  }
};

// ============ GET ALL ENTRIES ============
// For Admin
export const getAllEntries = async (req, res) => {
  try {
    const entries = await EntryModel.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Get All Entries Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error fetching entries",
    });
  }
};

// ============= GET USER ENTRIES (Current User) =============
// ============ GET USER ENTRIES ============
export const getUserEntries = async (req, res) => {
  try {
    const entries = await EntryModel.find({ user: req.user.id })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries,
    });
  } catch (error) {
    console.error("Get User Entries Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error fetching user entries",
    });
  }
};

// ============ GET ENTRY BY ID ============
export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await EntryModel.findById(id)
      .populate("user", "name email phone")
      .populate("verifiedBy", "name email");

    if (!entry) {
      return res.status(404).json({
        success: false,
        msg: "Entry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Get Entry Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error fetching entry",
    });
  }
};

// ============= UPDATE ENTRY (User can edit before approval) =============
// ============ UPDATE ENTRY ============
export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedEvents, player, partners, paymentInfo, metadata } = req.body;

    const entry = await EntryModel.findById(id);
    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }

    if (!checkOwnership(entry.user, req.user.id)) {
      return res.status(403).json({ success: false, msg: "Unauthorized to update this entry" });
    }

    if (["approved", "rejected"].includes(entry.status)) {
      return res.status(400).json({ success: false, msg: "Cannot update approved or rejected entries" });
    }

    if (selectedEvents) {
      const validationError = validateSelectedEvents(selectedEvents);
      if (validationError) {
        return res.status(400).json({ success: false, msg: validationError });
      }
    }

    if (player) {
      const errMsg = validatePersonFields(player, "Player", "all", "N/A");
      if (errMsg) return res.status(400).json({ success: false, msg: errMsg });
    }

    if (partners && selectedEvents) {
      for (const ev of selectedEvents) {
        if (["doubles", "mixed doubles"].includes(ev.type.toLowerCase())) {
          const partner = partners[ev.category];
          const errMsg = validatePersonFields(partner, "Partner", ev.category, ev.type);
          if (errMsg) return res.status(400).json({ success: false, msg: errMsg });
        }
      }
    }

    if (selectedEvents) entry.selectedEvents = selectedEvents;
    if (player) entry.player = player;
    if (partners) entry.partners = partners;
    if (paymentInfo) entry.paymentInfo = paymentInfo;
    if (metadata) entry.metadata = metadata;

    await entry.save();

    res.status(200).json({
      success: true,
      msg: "Entry updated successfully",
      data: entry,
    });
  } catch (error) {
    console.error("Update Entry Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error updating entry",
    });
  }
};

// ============= DELETE ENTRY (User or Admin) =============

// ============ DELETE ENTRY ============
export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await EntryModel.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        msg: "Entry not found",
      });
    }

    // Authorization check: owner or admin only
    if (entry.user.toString() !== req.user.id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        msg: "Unauthorized to delete this entry",
      });
    }

    // Remove entry id from user's entries array
    await UserModel.findByIdAndUpdate(entry.user, {
      $pull: { entries: entry._id }
    });

    // Delete the entry
    await entry.deleteOne();

    res.status(200).json({
      success: true,
      msg: "Entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete Entry Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error deleting entry",
    });
  }
};


// ============ APPROVE ENTRY EVENT ============
export const approveEvent = async (req, res) => {
  try {
    const { entryId, eventIndex } = req.body;
    const entry = await EntryModel.findById(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }

    entry.selectedEvents[eventIndex].verificationStatus = {
      status: "approved",
      verifiedAt: new Date(),
      verifiedBy: req.user.id,
    };

    const allApproved = entry.selectedEvents.every(
      (ev) => ev.verificationStatus.status === "approved"
    );
    if (allApproved) {
      entry.status = "approved";
      entry.verifiedAt = new Date();
      entry.verifiedBy = req.user.id;
    }

    await entry.save();

    res.status(200).json({ success: true, msg: "Event approved successfully", data: entry });
  } catch (error) {
    console.error("Approve Event Error:", error);
    res.status(500).json({ success: false, msg: error.message || "Error approving event" });
  }
};


// ============= ADMIN: REJECT ENTRY EVENT =============
// ============ REJECT ENTRY EVENT ============
export const rejectEvent = async (req, res) => {
  try {
    const { entryId, eventIndex, reason } = req.body;
    const entry = await EntryModel.findById(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, msg: "Entry not found" });
    }

    entry.selectedEvents[eventIndex].verificationStatus = {
      status: "rejected",
      verifiedAt: new Date(),
      verifiedBy: req.user.id,
      reason,
    };

    entry.status = "rejected";
    entry.rejectionReason = reason;

    await entry.save();

    res.status(200).json({ success: true, msg: "Event rejected successfully", data: entry });
  } catch (error) {
    console.error("Reject Event Error:", error);
    res.status(500).json({ success: false, msg: error.message || "Error rejecting event" });
  }
};


// ============= ADMIN: VERIFY PAYMENT =============
// ============ VERIFY PAYMENT ============
export const verifyPayment = async (req, res) => {
  try {
    const { entryId, isVerified } = req.body;

    const entry = await EntryModel.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        msg: "Entry not found",
      });
    }

    entry.paymentInfo.isVerified = isVerified;
    await entry.save();

    res.status(200).json({
      success: true,
      msg: isVerified
        ? "Payment verified successfully"
        : "Payment marked as unverified",
      data: entry,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error verifying payment",
    });
  }
};
// ============= ADMIN: CHANGE ENTRY STATUS (Bulk Approve/Reject) =============
// ============ UPDATE ENTRY STATUS ============
export const updateEntryStatus = async (req, res) => {
  try {
    const { entryId, status, reason } = req.body;

    const entry = await EntryModel.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        msg: "Entry not found",
      });
    }

    entry.status = status;
    entry.verifiedAt = new Date();
    entry.verifiedBy = req.user.id;

    if (status === "rejected") {
      entry.rejectionReason = reason;
    }

    await entry.save();

    res.status(200).json({
      success: true,
      msg: `Entry ${status} successfully`,
      data: entry,
    });
  } catch (error) {
    console.error("Update Entry Status Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error updating entry status",
    });
  }
};