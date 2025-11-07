// Update PaymentController.js
import PaymentModel from "../Models/PaymentModel.js";
import EntryModel from "../Models/EntryModel.js";
import UserModel from "../Models/UserModel.js";
import mongoose from "mongoose";
import { sendPlayerEntryRegistrationEmail } from "../Services/EmailService.js";

export const addToEventPayment = async (req, res) => {
  try {
    const playerId = req.user.id;
    const { paymentProof, status, metadata } = req.body;
    let { entryId: eventSubIdList, ActualAmount } = req.body;

    // ✅ Step 1: Sanitize and validate event sub-document IDs
    if (Array.isArray(eventSubIdList)) {
      eventSubIdList = eventSubIdList
        .map(id => {
          if (mongoose.Types.ObjectId.isValid(id)) {
            return new mongoose.Types.ObjectId(id);
          }
          return null;
        })
        .filter(id => id !== null);
    } else {
      eventSubIdList = [];
    }
    
    if (eventSubIdList.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No valid event IDs were provided to link the payment."
      });
    }

    // ✅ Step 2: Find the parent Entry documents and player details
    const entriesToUpdate = await EntryModel.find({
      "events._id": { $in: eventSubIdList },
      player: playerId
    }).populate("player", "name email TnBaId academyName place district");

    if (entriesToUpdate.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No entries found for the current player matching the provided event IDs."
      });
    }

    // Get player data for email
    const playerData = entriesToUpdate[0].player;

    // ✅ Step 3: Extract event details and store in UserModel
    const eventsToStore = [];
    const paidEvents = [];

    entriesToUpdate.forEach(entry => {
      entry.events.forEach(event => {
        if (eventSubIdList.some(id => id.equals(event._id))) {
          // Create event object for UserModel storage
          const eventToStore = {
            category: event.category,
            type: event.type,
            status: "pending", // Set status as registered
            RegistrationDate: new Date(),
            partner: event.partner || null,
            payment: null, // Will be updated after payment creation
            originalEntryId: entry._id, // Reference to original entry
            originalEventId: event._id // Reference to original event
          };

          eventsToStore.push(eventToStore);
          paidEvents.push({
            category: event.category,
            type: event.type,
            partnerName: event.partner?.fullname || null
          });
        }
      });
    });

    const uniqueParentEntryIds = entriesToUpdate.map(entry => entry._id);

    // ✅ Step 4: Create a new Payment record
    const payment = await PaymentModel.create({
      paymentProof,
      entryId: uniqueParentEntryIds,
      status: status || "Paid",
      metadata,
      ActualAmount,
      paymentBy: playerId,
    });

    // ✅ Step 5: Store events in UserModel without conditions
    const updatedUser = await UserModel.findByIdAndUpdate(
      playerId,
      {
        $push: {
          entries: {
            $each: eventsToStore.map(event => ({
              ...event,
              payment: payment._id // Link payment to each event
            }))
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      // If user update fails, delete the payment and return error
      await PaymentModel.findByIdAndDelete(payment._id);
      return res.status(404).json({
        success: false,
        msg: "User not found. Payment rolled back."
      });
    }

    // ✅ Step 6: Update each Entry document with payment reference
    for (const entry of entriesToUpdate) {
      let entryWasModified = false;
      entry.events.forEach((event) => {
        const isPaidEvent = eventSubIdList.some(id => id.equals(event._id));
        if (isPaidEvent && !event.payment) {
          event.payment = payment._id;
          entryWasModified = true;
        }
      });

      if (entryWasModified) {
        await entry.save();
      }
    }

    // ✅ Step 7: Send email notification to player with base64 image
    try {
      const paymentDetails = {
        status: payment.status,
        amount: metadata?.paymentAmount || payment.ActualAmount || 'N/A',
        paymentApp: metadata?.paymentApp || 'UPI',
        senderUpiId: metadata?.senderUpiId || 'N/A'
      };

      // Pass the base64 string directly to the email service
      await sendPlayerEntryRegistrationEmail(
        {
          email: playerData.email,
          name: playerData.name
        },
        paidEvents, // Use the paidEvents array for email
        paymentDetails,
        paymentProof // Pass the base64 string directly
      );

      console.log(`✅ Payment confirmation email sent to ${playerData.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send payment confirmation email:', emailError);
      // Don't fail the entire request if email fails
    }

    // ✅ Step 8: Fetch updated user with entries for response
    const userWithEntries = await UserModel.findById(playerId)
      .select('name email TnBaId academyName place district entries');

    res.status(200).json({
      success: true,
      msg: "Payment added, events stored in user profile, and linked to all specified entry events successfully. Confirmation email sent.",
      data: {
        user: userWithEntries,
        payment: payment
      }
    });
  } catch (err) {
    console.error("❌ Error in addToEventPayment:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

// ✅ New controller to get user entries
export const getUserEntries = async (req, res) => {
  try {
    const playerId = req.user.id;
    
    const user = await UserModel.findById(playerId)
      .select('entries name email TnBaId academyName place district');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user,
        entries: user.entries
      }
    });
  } catch (err) {
    console.error("❌ Error in getUserEntries:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

// ✅ New controller to add entry directly to user (without payment)
export const addEntryToUser = async (req, res) => {
  try {
    const playerId = req.user.id;
    const { eventData } = req.body;

    const updatedUser = await UserModel.findByIdAndUpdate(
      playerId,
      {
        $push: {
          entries: eventData
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      msg: "Entry added to user profile successfully",
      data: updatedUser.entries
    });
  } catch (err) {
    console.error("❌ Error in addEntryToUser:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};