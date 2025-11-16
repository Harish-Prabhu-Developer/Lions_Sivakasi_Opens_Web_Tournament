// Models/AcademyPlayerModel.js
import mongoose from "mongoose";

const PlayerSchema = new mongoose.Schema(
  {
    academyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Academy ID is required"]
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    tnbaId: {
      type: String,
      trim: true
    },
    dob: {
      type: String,
      required: [true, "Date of birth is required"],
    },
     gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is required"]
    },
    academy: {
      type: String,
      required: [true, "Academy name is required"],
      trim: true
    },
    place: {
      type: String,
      required: [true, "Place is required"],
      trim: true
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString()
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString()
    }
  },
  {
    timestamps: false
  }
);

// Update updatedAt before saving
PlayerSchema.pre("save", function (next) {
  this.updatedAt = new Date().toISOString();
  next();
});

// Virtual for age calculation
PlayerSchema.virtual("age").get(function () {
  if (!this.dob) return null;
  const birthYear = new Date(this.dob).getFullYear();
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
});

// Static method to find players by academy with search
PlayerSchema.statics.findByAcademy = function (academyId, searchTerm = "") {
  const query = { academyId, isActive: true };
  
  if (searchTerm.trim()) {
    const searchRegex = new RegExp(searchTerm, "i");
    query.$or = [
      { fullName: searchRegex },
      { tnbaId: searchRegex },
      { academy: searchRegex },
      { place: searchRegex },
      { district: searchRegex }
    ];
  }
  
  return this.find(query).sort({ fullName: 1 });
};

export default mongoose.model("AcademyPlayer", PlayerSchema);