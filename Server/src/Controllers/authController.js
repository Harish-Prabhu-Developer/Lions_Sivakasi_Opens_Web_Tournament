import crypto from "crypto";
import UserModel from "../Models/UserModel.js";
import generateToken from "../Config/jwthelper.js";
import {
  sendForgetPasswordEmail,
  sendWelcomeEmail,
} from "../Services/EmailService.js";

// ================= REGISTER USER =================
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dob, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        msg: "Name, email, password, and phone are required.",
      });
    }

    // Check duplicates
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "phone";
      return res.status(400).json({
        success: false,
        msg: `User with this ${conflictField} already exists.`,
      });
    }

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password,
      phone,
      gender,
      dob,
      role,
    });

// 🔹 Define base payload for token
    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      role: user.role,
    };
    // 🔹 Generate JWT token
    const token = generateToken(tokenPayload);

    await sendWelcomeEmail(user.email, user.name);
    res.status(201).json({
      success: true,
      msg: "Registration successful.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          dob: user.dob,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error while registering.",
    });
  }
};

// ================= LOGIN USER =================
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        msg: "Please provide both identifier and password.",
      });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const isPhone = /^[0-9]{10}$/.test(identifier);

    if (!isEmail && !isPhone) {
      return res.status(400).json({
        success: false,
        msg: "Please provide a valid email or 10-digit phone number.",
      });
    }

    const query = isEmail ? { email: identifier } : { phone: identifier };
    const user = await UserModel.findOne(query).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found. Please register first.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        msg: "Your account has been deactivated. Contact support.",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        msg: "Incorrect password. Please try again.",
      });
    }

    user.lastLogin = new Date();
    await user.save();

// 🔹 Define base payload for token
    const tokenPayload = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      dob: user.dob,
      role: user.role,
    };

    const token = generateToken(tokenPayload);

    res.status(200).json({
      success: true,
      msg: "Login successful.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          dob: user.dob,
          role: user.role,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
          TNBAID :user.TnBaId||null,
          academy : user.academyName||null,
          place : user.place||null,
          district : user.district||null
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Internal server error while logging in.",
    });
  }
};

// ============= FORGOT PASSWORD =============
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        msg: "Email is required",
      });
    }

    // 2️⃣ Check if user exists
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "No user found with this email address",
      });
    }

    // 3️⃣ Generate a new random 8-character alphanumeric password
    const newPassword = Math.random().toString(36).slice(-8).toUpperCase();

    // 4️⃣ Hash password (pre-save hook will handle it if implemented)
    user.password = newPassword; // assuming hashing in your UserModel pre-save middleware
    await user.save();

    // 5️⃣ Send new password via email
    try {
      await sendForgetPasswordEmail(user.email, user.name, newPassword);
      console.log(`New password sent to ${user.email}: ${newPassword}`);
    } catch (err) {
      console.error("Email sending failed:", err);
      return res.status(500).json({
        success: false,
        msg: "Failed to send reset email. Please try again later.",
      });
    }

    // 6️⃣ Respond success
    res.status(200).json({
      success: true,
      msg: "A new password has been generated and sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};
// ============= VERIFY OTP =============
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        msg: "Email and OTP are required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await UserModel.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired OTP",
      });
    }

    res.status(200).json({
      success: true,
      msg: "OTP verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error verifying OTP",
    });
  }
};

// ============= RESET PASSWORD =============
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(otp).digest("hex");

    const user = await UserModel.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired OTP",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      msg: "Password reset successfully",
      data: { token },
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error resetting password",
    });
  }
};

// ============= CHANGE PASSWORD (Protected) =============
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        msg: "Old password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        msg: "New password must be at least 6 characters",
      });
    }

    const user = await UserModel.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        msg: "Old password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error changing password",
    });
  }
};

// ============= GET CURRENT USER (Protected) =============
export const getCurrentUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id).populate({
      path: "entries",
      options: { sort: { createdAt: -1 }, limit: 10 },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error fetching user",
    });
  }
};

// ============= LOGOUT (Client-side) =============
export const logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, msg: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      success: false,
      msg: error.message || "Error logging out",
    });
  }
};
