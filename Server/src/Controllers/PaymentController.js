// Controllers/PaymentController.js
import Payment from "../Models/PaymentModel.js";
import Entry from "../Models/EntryModel.js";

// ✅ 1. Create & Link Payment
export const addPayment = async (req, res) => {
  try {
    const {
      entryId,             // 🆔 Related Entry document
      paymentProof,        // base64 or uploaded image URL
      paymentApp,          // from OCR (GPay, PhonePe, etc.)
      paymentAmount,       // from OCR extracted amount
      senderUpiId,         // from OCR sender ID
      paymentBy,           // user._id
    } = req.body;

    if (!entryId || !paymentProof || !paymentAmount || !paymentBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: entryId, paymentProof, amount, or paymentBy.",
      });
    }

    // ✅ Create Payment document
    const newPayment = await Payment.create({
      paymentProof,
      status: "Paid",
      metadata: {
        paymentApp,
        paymentAmount,
        senderUpiId,
      },
      paymentBy,
      entryId,
    });

    // ✅ Link Payment -> Entry
    await Entry.findByIdAndUpdate(
      entryId,
      { $set: { "events.$[].payment": newPayment._id } }, // links all events
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Payment added successfully and linked to entry.",
      payment: newPayment,
    });
  } catch (error) {
    console.error("❌ addPayment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2. Get all Payments
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("paymentBy", "fullName email")
      .populate("entryId", "_id")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    console.error("❌ getPayments Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 3. Get Payment by ID
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate("paymentBy", "fullName email")
      .populate("entryId", "_id events");

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error("❌ getPaymentById Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 4. Update Payment Status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Paid", "Pending", "Failed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status." });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedPayment) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    res.status(200).json({ success: true, message: "Payment status updated.", data: updatedPayment });
  } catch (error) {
    console.error("❌ updatePaymentStatus Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 5. Delete Payment (Optional)
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Payment.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Payment not found." });
    }

    // Optional cleanup: unlink payment in entries
    await Entry.updateMany(
      { "events.payment": id },
      { $unset: { "events.$[].payment": "" } }
    );

    res.status(200).json({ success: true, message: "Payment deleted successfully." });
  } catch (error) {
    console.error("❌ deletePayment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
