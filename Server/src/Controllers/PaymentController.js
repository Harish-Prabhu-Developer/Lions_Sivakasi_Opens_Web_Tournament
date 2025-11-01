import PaymentModel from "../Models/PaymentModel.js";
import EntryModel from "../Models/EntryModel.js";
import mongoose from "mongoose"; // <-- ADDED: Needed for explicit ObjectId validation and casting

export const addToEventPayment = async (req, res) => {
  try {
    const playerId = req.user.id;
    const { paymentProof, status, metadata } = req.body;
    // Renaming input 'entryId' to 'eventSubIdList' internally to clarify its contents (event sub-document IDs)
    let { entryId: eventSubIdList } = req.body;

    // ✅ Step 1: Sanitize and validate event sub-document IDs
    if (Array.isArray(eventSubIdList)) {
      eventSubIdList = eventSubIdList
        .map(id => {
          // Check if the string is a valid ObjectId format
          if (mongoose.Types.ObjectId.isValid(id)) {
            return new mongoose.Types.ObjectId(id);
          }
          return null; // Filter out invalid IDs
        })
        .filter(id => id !== null); // Remove nulls
    } else {
      eventSubIdList = []; // Default to empty array if input isn't an array
    }
    
    // Check to prevent creating payment if no valid IDs were found
    if (eventSubIdList.length === 0) {
        return res.status(400).json({
            success: false,
            msg: "No valid event IDs were provided to link the payment."
        });
    }

    // ✅ Step 2: Find the parent Entry documents associated with these event sub-document IDs
    const entriesToUpdate = await EntryModel.find({
        // Find Entry documents that have an 'events' sub-document matching any of the provided IDs
        "events._id": { $in: eventSubIdList },
        player: playerId // Crucial: ensure we only update the current player's entries
    });

    if (entriesToUpdate.length === 0) {
        return res.status(404).json({
            success: false,
            msg: "No entries found for the current player matching the provided event IDs."
        });
    }

    // Extract unique top-level Entry IDs. This is what the Payment.entryId field should store.
    const uniqueParentEntryIds = entriesToUpdate.map(entry => entry._id);

    // ✅ Step 3: Create a new Payment record, linking to the PARENT Entry IDs
    const payment = await PaymentModel.create({
      paymentProof,
      entryId: uniqueParentEntryIds, // Use the unique PARENT Entry IDs
      status: status || "Paid",
      metadata,
      paymentBy: playerId,
    });

    // ✅ Step 4: Update each Entry document, but only the specific events paid for
    for (const entry of entriesToUpdate) {
        let entryWasModified = false;
        entry.events.forEach((event) => {
            // Check if this specific event sub-document ID is in the list of paid-for IDs
            const isPaidEvent = eventSubIdList.some(id => id.equals(event._id));

            // Only assign if the event was paid for AND no payment is already linked
            if (isPaidEvent && !event.payment) {
              event.payment = payment._id;
                entryWasModified = true;
            }
        });

        // Only save the document if any of its events were modified
        if (entryWasModified) {
          await entry.save();
        }
    }

    // ✅ Step 5: Fetch updated entries for response
    const entries = await EntryModel.find({ player: req.user.id })
      .populate("player", "name TnBaId academyName place district")
      .populate("events.payment");

    res.status(200).json({
      success: true,
      msg: "Payment added and linked to all specified entry events successfully.",
      data: entries,
      payment:payment
    });
  } catch (err) {
    console.error("❌ Error in addToEventPayment:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};
