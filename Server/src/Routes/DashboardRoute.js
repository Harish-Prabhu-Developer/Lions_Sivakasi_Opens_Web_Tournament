// Routes/DashboardRoute.js
import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { authorize } from "../Middleware/roleMiddleware.js";
import { getDashboardStats } from "../Controllers/DashboardController.js";

const DashboardRoute = express.Router();

DashboardRoute.get("/dashboard", protect, authorize("admin", "superadmin"), getDashboardStats);

export default DashboardRoute;