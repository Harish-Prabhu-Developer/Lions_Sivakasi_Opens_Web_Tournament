// Controllers/UserController.js
import UserModel from "../Models/UserModel.js";
import EntryModel from "../Models/EntryModel.js";
import PaymentModel from "../Models/PaymentModel.js";
import PartnerChangeModel from "../Models/PartnerChangeModel.js";
import mongoose from "mongoose";
import generateToken from "../Config/jwthelper.js";

// PlayerForm Data (name, dob, Tnbaid, academyName, place, district) update
export const PlayerFormChange = async (req, res) => {
  try {
    const { name, dob, TnBaId, academyName, place, district } = req.body;

    // 🔹 Check if TnBaId is already used by another user
    if (TnBaId) {
      const existingUser = await UserModel.findOne({
        TnBaId,
        _id: { $ne: req.user.id }, // exclude current user
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `TnBaId '${TnBaId}' is already registered to another user.`,
        });
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      {
        name,
        dob,
        TnBaId,
        academyName,
        place,
        district,
      },
      { new: true } // return updated document
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate token for local storage update
    // 🔹 Define base payload for token
    const tokenPayload = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      dob: updatedUser.dob,
      role: updatedUser.role,
    };

    // 🔹 Generate JWT token
    const token = generateToken(tokenPayload);
    res.status(200).json({
      success: true,
      message: "Player form updated successfully",
      data: {
        user: {
          name: updatedUser.name,
          dob: updatedUser.dob,
          TnBaId: updatedUser.TnBaId || null,
          academyName: updatedUser.academyName || null,
          place: updatedUser.place || null,
          district: updatedUser.district || null,
        },
      },
      token,
    });
  } catch (error) {
    console.error("Error updating player form:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating player form",
      error: error.message,
    });
  }
};






/**
 * Delete User Permanently with Cascade Deletion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid user ID format"
      });
    }

    // 1. Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    console.log(`Starting cascade deletion for user: ${user.name} (${userId})`);

    const deletionResults = {
      user: 0,
      entries: 0,
      payments: 0,
      partnerChangeRequests: 0,
      entriesAsPartner: 0,
      partnerChangeAsTo: 0
    };

    // 2. Find all entries where this user is the player
    const userEntries = await EntryModel.find({ player: userId });
    const entryIds = userEntries.map(entry => entry._id);

    console.log(`Found ${userEntries.length} entries for user`);

    // 3. Delete all payments associated with these entries
    const paymentDeleteResult = await PaymentModel.deleteMany({
      entryId: { $in: entryIds }
    });
    deletionResults.payments = paymentDeleteResult.deletedCount;
    console.log(`Deleted ${paymentDeleteResult.deletedCount} payments`);

    // 4. Delete all partner change requests by this user
    const partnerChangeDeleteResult = await PartnerChangeModel.deleteMany({
      player: userId
    });
    deletionResults.partnerChangeRequests = partnerChangeDeleteResult.deletedCount;
    console.log(`Deleted ${partnerChangeDeleteResult.deletedCount} partner change requests`);

    // 5. Handle partner references in other users' entries
    // Find all entries where this user is referenced as a partner
    const entriesWithUserAsPartner = await EntryModel.find({
      "events.partner.TnBaId": user.TnBaId
    });

    console.log(`Found ${entriesWithUserAsPartner.length} entries where user is referenced as partner`);

    // Remove user as partner from other entries
    for (const entry of entriesWithUserAsPartner) {
      let updated = false;
      for (const event of entry.events) {
        if (event.partner && event.partner.TnBaId === user.TnBaId) {
          // Remove partner data
          event.partner = undefined;
          updated = true;
        }
      }
      if (updated) {
        await entry.save();
        deletionResults.entriesAsPartner++;
      }
    }
    console.log('Removed user as partner from other entries');

    // 6. Handle partner change requests where user is the "To" partner
    const partnerChangeAsTo = await PartnerChangeModel.find({
      "To.TnBaId": user.TnBaId
    });

    console.log(`Found ${partnerChangeAsTo.length} partner change requests where user is the new partner`);

    // Delete partner change requests where user is the "To" partner
    const partnerChangeToDeleteResult = await PartnerChangeModel.deleteMany({
      "To.TnBaId": user.TnBaId
    });
    deletionResults.partnerChangeAsTo = partnerChangeToDeleteResult.deletedCount;
    console.log('Deleted partner change requests where user is the new partner');

    // 7. Delete all entries where user is the player
    const entryDeleteResult = await EntryModel.deleteMany({
      player: userId
    });
    deletionResults.entries = entryDeleteResult.deletedCount;
    console.log(`Deleted ${entryDeleteResult.deletedCount} entries`);

    // 8. Handle admin references
    // Update entries where user is referenced as ApproverdBy
    const entriesUpdated = await EntryModel.updateMany(
      { "events.ApproverdBy": userId },
      { $set: { "events.$[].ApproverdBy": null } }
    );
    console.log(`Updated ${entriesUpdated.modifiedCount} entries where user was approver`);

    // Update partner change requests where user is ApprovredBy
    const partnerChangesUpdated = await PartnerChangeModel.updateMany(
      { ApprovredBy: userId },
      { $set: { ApprovredBy: null } }
    );
    console.log(`Updated ${partnerChangesUpdated.modifiedCount} partner change requests where user was approver`);

    // Update payments where user is paymentBy
    const paymentsUpdated = await PaymentModel.updateMany(
      { paymentBy: userId },
      { $set: { paymentBy: null } }
    );
    console.log(`Updated ${paymentsUpdated.modifiedCount} payments where user was paymentBy`);

    // 9. Finally delete the user
    const userDeleteResult = await UserModel.findByIdAndDelete(userId);
    deletionResults.user = userDeleteResult ? 1 : 0;
    console.log('User deleted successfully');

    res.status(200).json({
      success: true,
      msg: "User and all associated data deleted successfully",
      deletedData: deletionResults,
      summary: {
        totalRecordsDeleted: Object.values(deletionResults).reduce((a, b) => a + b, 0),
        user: deletionResults.user,
        associatedRecords: deletionResults.entries + deletionResults.payments + deletionResults.partnerChangeRequests + deletionResults.entriesAsPartner + deletionResults.partnerChangeAsTo
      }
    });

  } catch (error) {
    console.error("Error deleting user:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to delete user",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Get user deletion preview (shows what will be deleted)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserDeletionPreview = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid user ID format"
      });
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    // Get counts of associated data
    const entriesCount = await EntryModel.countDocuments({ player: userId });
    const paymentsCount = await PaymentModel.countDocuments({ 
      $or: [
        { paymentBy: userId },
        { entryId: { $in: await EntryModel.find({ player: userId }).distinct('_id') } }
      ]
    });
    const partnerChangeRequestsCount = await PartnerChangeModel.countDocuments({ player: userId });
    const entriesAsPartnerCount = await EntryModel.countDocuments({
      "events.partner.TnBaId": user.TnBaId
    });
    const partnerChangeAsToCount = await PartnerChangeModel.countDocuments({
      "To.TnBaId": user.TnBaId
    });

    // Count admin references
    const entriesAsApproverCount = await EntryModel.countDocuments({
      "events.ApproverdBy": userId
    });
    const partnerChangesAsApproverCount = await PartnerChangeModel.countDocuments({
      ApprovredBy: userId
    });
    const paymentsAsPayerCount = await PaymentModel.countDocuments({
      paymentBy: userId
    });

    res.status(200).json({
      success: true,
      msg: "Deletion preview retrieved successfully",
      user: {
        name: user.name,
        email: user.email,
        TnBaId: user.TnBaId,
        role: user.role,
        createdAt: user.createdAt
      },
      dataToBeDeleted: {
        user: 1,
        entries: entriesCount,
        payments: paymentsCount,
        partnerChangeRequests: partnerChangeRequestsCount,
        entriesAsPartner: entriesAsPartnerCount,
        partnerChangeAsTo: partnerChangeAsToCount,
        totalRecords: 1 + entriesCount + paymentsCount + partnerChangeRequestsCount + partnerChangeAsToCount
      },
      referencesToBeUpdated: {
        entriesAsApprover: entriesAsApproverCount,
        partnerChangesAsApprover: partnerChangesAsApproverCount,
        paymentsAsPayer: paymentsAsPayerCount
      },
      warnings: {
        entriesAsPartner: entriesAsPartnerCount > 0 ? 
          `User is referenced as partner in ${entriesAsPartnerCount} entries (partner data will be removed)` : 
          null,
        partnerChangeAsTo: partnerChangeAsToCount > 0 ?
          `User is referenced in ${partnerChangeAsToCount} partner change requests as new partner (requests will be deleted)` :
          null,
        adminReferences: (entriesAsApproverCount > 0 || partnerChangesAsApproverCount > 0 || paymentsAsPayerCount > 0) ?
          `User has ${entriesAsApproverCount + partnerChangesAsApproverCount + paymentsAsPayerCount} admin references that will be set to null` :
          null
      }
    });

  } catch (error) {
    console.error("Error getting deletion preview:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get deletion preview",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Bulk delete users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "User IDs array is required"
      });
    }

    // Validate all user IDs
    const invalidIds = userIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        msg: "Invalid user ID(s) found",
        invalidIds
      });
    }

    console.log(`Starting bulk deletion for ${userIds.length} users`);

    const results = {
      totalUsers: userIds.length,
      deletedUsers: 0,
      deletedEntries: 0,
      deletedPayments: 0,
      deletedPartnerChanges: 0,
      updatedPartnerReferences: 0,
      errors: []
    };

    for (const userId of userIds) {
      try {
        // Get user to access TnBaId
        const user = await UserModel.findById(userId);
        if (!user) {
          results.errors.push(`User ${userId} not found`);
          continue;
        }

        // Find and delete user entries
        const userEntries = await EntryModel.find({ player: userId });
        const entryIds = userEntries.map(entry => entry._id);

        // Delete payments associated with these entries
        const paymentResult = await PaymentModel.deleteMany({
          entryId: { $in: entryIds }
        });
        results.deletedPayments += paymentResult.deletedCount;

        // Delete partner change requests by user
        const partnerChangeResult = await PartnerChangeModel.deleteMany({
          player: userId
        });
        results.deletedPartnerChanges += partnerChangeResult.deletedCount;

        // Remove user as partner from other entries
        const entriesWithPartner = await EntryModel.find({
          "events.partner.TnBaId": user.TnBaId
        });
        
        for (const entry of entriesWithPartner) {
          let updated = false;
          for (const event of entry.events) {
            if (event.partner && event.partner.TnBaId === user.TnBaId) {
              event.partner = undefined;
              updated = true;
            }
          }
          if (updated) {
            await entry.save();
            results.updatedPartnerReferences++;
          }
        }

        // Delete partner change requests where user is the "To" partner
        await PartnerChangeModel.deleteMany({
          "To.TnBaId": user.TnBaId
        });

        // Delete user entries
        const entryResult = await EntryModel.deleteMany({
          player: userId
        });
        results.deletedEntries += entryResult.deletedCount;

        // Update admin references to null
        await EntryModel.updateMany(
          { "events.ApproverdBy": userId },
          { $set: { "events.$[].ApproverdBy": null } }
        );

        await PartnerChangeModel.updateMany(
          { ApprovredBy: userId },
          { $set: { ApprovredBy: null } }
        );

        await PaymentModel.updateMany(
          { paymentBy: userId },
          { $set: { paymentBy: null } }
        );

        // Finally delete the user
        await UserModel.findByIdAndDelete(userId);
        results.deletedUsers++;

        console.log(`Successfully deleted user: ${user.name}`);

      } catch (error) {
        results.errors.push(`Failed to delete user ${userId}: ${error.message}`);
        console.error(`Error deleting user ${userId}:`, error);
      }
    }

    res.status(200).json({
      success: true,
      msg: "Bulk deletion completed",
      results
    });

  } catch (error) {
    console.error("Error in bulk deletion:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to perform bulk deletion",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

/**
 * Soft delete user (set isActive to false instead of permanent deletion)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const softDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid user ID format"
      });
    }

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { 
        isActive: false,
        email: `deleted_${Date.now()}_${user.email}`, // De-identify email
        phone: `deleted_${Date.now()}_${user.phone}` // De-identify phone
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      msg: "User soft deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("Error in soft delete:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to soft delete user",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};