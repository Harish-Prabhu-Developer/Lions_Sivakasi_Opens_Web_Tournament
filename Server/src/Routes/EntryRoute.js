import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { authorize } from "../Middleware/roleMiddleware.js";
import { approveRejectEvent, getEntries,addToEvents,updateEventItem} from "../Controllers/EntryController.js";

const EntryRoute = express.Router();

// Player routes
EntryRoute.post("/create", protect, addToEvents);
    
// Admin routes
EntryRoute.get("/me", protect, getEntries);
EntryRoute.put("/approve/:entryId/:eventId", protect, authorize("admin"), approveRejectEvent);
EntryRoute.put("/update/:eventId", protect, updateEventItem);
export default EntryRoute;
