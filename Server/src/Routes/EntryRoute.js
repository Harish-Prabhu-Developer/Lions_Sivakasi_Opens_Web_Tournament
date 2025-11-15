import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { authorize } from "../Middleware/roleMiddleware.js";
import { approveRejectEvent, getEntries,addToEvents,updateEventItem, addPartnerToEvent, getPlayerEntries, getUserEntries, getFilteredEventsForReport, getPaymentWithEvents} from "../Controllers/EntryController.js";

const EntryRoute = express.Router();

// Player routes
EntryRoute.post("/create", protect, addToEvents);
EntryRoute.get("/me", protect, getPlayerEntries);
EntryRoute.put("/update/:eventId", protect, updateEventItem);
EntryRoute.put("/add-partner", protect, addPartnerToEvent);


// Admin routes
EntryRoute.put("/approve/:entryId/:eventId", protect, authorize("admin"), approveRejectEvent);
// Admin routes Manage User Page (Admin)
EntryRoute.get("/admin/user-entries",protect,authorize("admin"),getUserEntries);

// Admin routes Manage Event Entries Page (Admin)
EntryRoute.get("/admin/entries", protect, authorize("admin"), getEntries);
// In your routes file
EntryRoute.get("/payment-events/:paymentId", getPaymentWithEvents);
// Admin Report 
EntryRoute.get("/export-report",protect,authorize("admin"),getFilteredEventsForReport)
export default EntryRoute;
