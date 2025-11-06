import mongoose from "mongoose";
import { EventSchema, PlayerEntrySchema } from "./EntryModel.js";
// Player Form Data Update request
const PartnerChangeModel = new mongoose.Schema(
  {

    form: PlayerEntrySchema, //Old Partner Data(fullname, tnbaId, dob, academyName, place, district)
    To: PlayerEntrySchema, //New Partner Data(fullname, tnbaId, dob, academyName, place, district)
    Event: {
      type: EventSchema,
      required: [true, "Event details are required for partner change"],
    },
    Reason: {
      type: String,
      required: [true, "Reason is required"],
    },
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    AdminMsg: { type: String },
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
