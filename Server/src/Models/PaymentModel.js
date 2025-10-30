// PaymentModel.js
import mongoose from "mongoose";

const PaymentModel = new mongoose.Schema(
  {
    paymentProof: { type: String },
    status: { type: String, enum: ["Paid", "Failed", "Pending"], default: "Paid" },
    metadata: {
      paymentApp: { type: String },
      paymentAmount: { type: Number },
      senderUpiId: { type: String },
    },
    paymentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    entryId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entry" }],

  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentModel);
