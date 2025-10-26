import express from "express";
import {
  createEntry,
  getAllEntries,
  getUserEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  approveEvent,
  rejectEvent,
  verifyPayment,
  updateEntryStatus,
} from "../Controllers/EntryController.js";
import { protect } from "../Middleware/authMiddleware.js";
import { authorize } from "../Middleware/roleMiddleware.js";

const EntryRoute = express.Router();

EntryRoute.post("/", protect, createEntry);
EntryRoute.get("/me", protect, getUserEntries);
EntryRoute.get("/:id", protect, getEntryById);
EntryRoute.put("/:id", protect, updateEntry);
EntryRoute.delete("/:id", protect, deleteEntry);

// Admin routes
EntryRoute.get("/", protect, authorize("admin", "superadmin"), getAllEntries);
EntryRoute.post("/approve-event", protect, authorize("admin", "superadmin"), approveEvent);
EntryRoute.post("/reject-event", protect, authorize("admin", "superadmin"), rejectEvent);
EntryRoute.post("/verify-payment", protect, authorize("admin", "superadmin"), verifyPayment);
EntryRoute.post("/status", protect, authorize("admin", "superadmin"), updateEntryStatus);

export default EntryRoute;
