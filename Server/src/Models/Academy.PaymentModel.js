// Models/Academy.PaymentModel.js
import mongoose from "mongoose";

const PaymentModel = new mongoose.Schema(
  {
    Academy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademyPlayer",
      required: true,
    },
    PaidedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademyEntry",
      required: true,
    },
    // ✅ NEW: Track which specific events this payment covers
    paidEvents: [{
      category: {
        type: String,
        enum: ["Under 09", "Under 11", "Under 13", "Under 15", "Under 17", "Under 19"],
        required: true
      },
      type: {
        type: String,
        enum: ["singles", "doubles", "mixed doubles"],
        required: true
      },
      amount: {
        type: Number,
        required: true
      }
    }],
    status: { 
      type: String, 
      enum: ["Paid", "Failed", "Pending"], 
      default: "Paid" 
    },
    paymentProof: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademyPaymentProof",
      required: true,
    },
    // ✅ NEW: Track total amount for this specific payment
    paymentAmount: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("AcademyPayment", PaymentModel);