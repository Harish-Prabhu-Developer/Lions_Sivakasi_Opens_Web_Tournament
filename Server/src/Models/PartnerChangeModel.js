import mongoose from "mongoose";
import { PlayerEntrySchema } from "./EntryModel";
// Player Form Data Update request
const PartnerChangeModel = new mongoose.Schema(
  {
    form: PlayerEntrySchema, //Old Partner Data(fullname, tnbaId, dob, academyName, place, district)
    To: PlayerEntrySchema, //New Partner Data(fullname, tnbaId, dob, academyName, place, district)
    Reason: {
      type: String,
      required: [true, "Reason is required"],
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ApprovredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PartnerChange", PartnerChangeModel);
