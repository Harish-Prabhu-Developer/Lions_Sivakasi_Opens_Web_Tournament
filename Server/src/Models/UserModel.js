// Models/UserModel.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto-js";
import { EventSchema } from "./EntryModel.js";

const UserModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      unique: true,
      required: [true, "Phone number is required"],
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    dob: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
      select: false,
    },
    TnBaId:{
      type: String,
    },
    academyName: {
      type: String,
    },
    place: {
      type: String,
    },
    district: {
      type: String,
    },
     entries: {
      type: [EventSchema],
      default: []
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserModel.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserModel.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
UserModel.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  return token;
};


// Add entry to user
UserModel.methods.addEntry = function (eventData) {
  this.entries.push(eventData);
  return this.save();
};

// Get all entries for user
UserModel.methods.getEntries = function () {
  return this.entries;
};

// Update entry status
UserModel.methods.updateEntryStatus = function (entryId, status) {
  const entry = this.entries.id(entryId);
  if (entry) {
    entry.status = status;
    return this.save();
  }
  throw new Error("Entry not found");
};


// Exclude password from JSON responses
UserModel.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

export default mongoose.model("User", UserModel);
