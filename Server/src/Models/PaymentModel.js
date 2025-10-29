// PaymentModel.js
import mongoose from "mongoose";

const PaymentModel = new mongoose.Schema(
  {
    category: { type: String,enum:["Under 09","Under 11","Under 13","Under 15","Under 17","Under 19"], required: true },
    type: {
      type: String,
      enum: ["singles", "doubles", "mixed doubles"],
      required: true,
    },
    paymentProof: { type: String },
    status: { type: String, enum: ["Paid", "Failed", "Pending"], default: "Paid" },
    metadata: {
      paymentApp: { type: String },
      paymentAmount: { type: Number },
      senderUpiId: { type: String },
    },
    paymentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    entryId: { type: mongoose.Schema.Types.ObjectId, ref: "Entry", required: true },

  },
  { timestamps: true }
);

export default mongoose.model("Payment", PaymentModel);
