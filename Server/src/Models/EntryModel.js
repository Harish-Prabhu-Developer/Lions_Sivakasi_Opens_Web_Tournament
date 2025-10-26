// Models/EntryModel.js
import mongoose from "mongoose";

const eventVerificationSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  reason: String,
});

const selectedEventSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["singles", "doubles", "mixed doubles"],
  },
  verificationStatus: {
    type: eventVerificationSchema,
    default: () => ({ status: "pending" }),
  },
});

const playerDetailsSchema = new mongoose.Schema({
  "Full Name": { type: String, required: true },
  "TNBA ID": { type: String, required: true },
  "Date of Birth": { type: Date, required: true },
  "Academy Name": { type: String, required: true },
  Place: { type: String, required: true },
  District: { type: String, required: true },
});

const paymentInfoSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  screenshot: {
    type: String, // URL or base64
    required: true,
  },
  extractedData: {
    app: String,
    amount: Number,
    senderUPI: String,
    receiverUPI: String,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

const EntryModel = new mongoose.Schema(
  {
   entryId: {
  type: String,
  unique: true,
  index: true,
},
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    selectedEvents: {
      type: [selectedEventSchema],
      required: true,
      validate: {
        validator: function (events) {
          return events.length > 0;
        },
        message: "At least one event must be selected",
      },
    },
    player: {
      type: playerDetailsSchema,
      required: true,
    },
    partners: {
      type: Map,
      of: playerDetailsSchema,
    },
    paymentInfo: {
      type: paymentInfoSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "submitted", "pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: String,
    notes: String,
    metadata: {
      ipAddress: String,
      userAgent: String,
      deviceInfo: String,
    },
  },
  {
    timestamps: true,
  }
);


// Pre-save hook to generate unique entryId
EntryModel.pre("save", async function (next) {
  if (!this.entryId) {
    const generateEntryId = () => {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      return `ENTRY_${timestamp}_${random}`;
    };

    let newId = generateEntryId();
    // Check for uniqueness
    let exists = await this.constructor.findOne({ entryId: newId });
    // Regenerate if exists
    while (exists) {
      newId = generateEntryId();
      exists = await this.constructor.findOne({ entryId: newId });
    }
    this.entryId = newId;
  }
  next();
});
// Index for faster queries
EntryModel.index({ user: 1, status: 1 });
EntryModel.index({ entryId: 1 });
EntryModel.index({ submittedAt: -1 });

export default mongoose.model("Entry", EntryModel);

