// EntryModel.js
import mongoose from "mongoose";

export const PlayerEntrySchema = new mongoose.Schema({
  fullname: { type: String },
  dob: { type: String },
  TnBaId: { type: String },
  academyName: { type: String },
  place: { type: String },
  district: { type: String },
});

export const EventSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "Under 09",
        "Under 11",
        "Under 13",
        "Under 15",
        "Under 17",
        "Under 19",
      ],
      required: true,
    },
    type: {
      type: String,
      enum: ["singles", "doubles", "mixed doubles"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    RegistrationDate: { type: Date, default: Date.now },
    partner: PlayerEntrySchema,
    ApproverdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

const EntryModel = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    events: [EventSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Entry", EntryModel);
