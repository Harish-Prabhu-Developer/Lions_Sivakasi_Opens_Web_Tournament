import express from "express";
import {
  register,
  login,
  forgotPassword,
  verifyOTP,
  resetPassword,
  changePassword,
  getCurrentUser,
  logout,
} from "../Controllers/authController.js";
import { protect } from "../Middleware/authMiddleware.js"; // Optional if using JWT

const AuthRoute = express.Router();

// Auth routes
AuthRoute.post("/register", register);
AuthRoute.post("/login", login);
AuthRoute.post("/forgot-password", forgotPassword);
AuthRoute.post("/verify-otp", verifyOTP);
AuthRoute.post("/reset-password", resetPassword);

// Protected routes
AuthRoute.post("/change-password", protect, changePassword);
AuthRoute.get("/me", protect, getCurrentUser);

// Logout
AuthRoute.post("/logout", logout);

export default AuthRoute;
