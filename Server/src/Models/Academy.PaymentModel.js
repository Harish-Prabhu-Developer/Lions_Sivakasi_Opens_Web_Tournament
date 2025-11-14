// Models/Academy.PaymentModel.js
import mongoose from "mongoose";

const PaymentModel = new mongoose.Schema(
  {
    Academy: {type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,},
    player: {type: mongoose.Schema.Types.ObjectId,ref: "AcademyPlayer",required: true,},
    PaidedEvent: {type: mongoose.Schema.Types.ObjectId,ref: "AcademyEntry",required: true,},
    status: { type: String, enum: ["Paid", "Failed", "Pending"], default: "Paid" },
    paymentProof:{type: mongoose.Schema.Types.ObjectId,ref: "AcademyPaymentProof",required: true,},
  },
  { timestamps: true }
);

export default mongoose.model("AcademyPayment", PaymentModel);