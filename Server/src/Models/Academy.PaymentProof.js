// Models/Academy.PaymentProof.js
import mongoose from "mongoose";

const PaymentProofModel =new mongoose.Schema({
  paymentProof: { type: String },
  ActualAmount:{type:Number},
  expertedData:{
    paymentAmount: { type: Number },
    receiverUpiId: { type: String },
  },
  metadata: {
    paymentApp: { type: String },
    paymentAmount: { type: Number },
    senderUpiId: { type: String },
    receiverUpiId: { type: String },
  },
  paymentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
});


export default mongoose.model("AcademyPaymentProof", PaymentProofModel);



