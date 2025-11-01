// Models/EntryModel.js
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

const EntrySchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  
    events: {
      type: [EventSchema],
      validate: {
        validator: function (events) {
          if (!events || events.length === 0) {
            return true;
          }

          const singlesDoublesCount = events.filter(e =>
            ["singles", "doubles"].includes(e.type)
          ).length;

          const mixedDoublesCount = events.filter(
            e => e.type === "mixed doubles"
          ).length;

          if (events.length > 4) {
            throw new Error("Maximum 4 events allowed per player");
          }
          if (singlesDoublesCount > 3) {
            throw new Error("Maximum 3 singles or doubles events allowed");
          }
          if (mixedDoublesCount > 1) {
            throw new Error("Only 1 mixed doubles event allowed");
          }

          return true;
        },
        message: props =>
          props.reason?.message || "Invalid event configuration",
      },
    },
  },
  { timestamps: true }
);

// ✅ Clean error handler — removes “Validation failed: events:” text
EntrySchema.post("save", function (error, doc, next) {
  if (error.name === "ValidationError" && error.errors.events) {
    const msg = error.errors.events.reason?.message || error.errors.events.message;
    return next({ success: false, msg });
  }
  next(error);
});

EntrySchema.post("validate", function (error, doc, next) {
  if (error.name === "ValidationError" && error.errors.events) {
    const msg = error.errors.events.reason?.message || error.errors.events.message;
    return next({ success: false, msg });
  }
  next(error);
});

export default mongoose.model("Entry", EntrySchema);
