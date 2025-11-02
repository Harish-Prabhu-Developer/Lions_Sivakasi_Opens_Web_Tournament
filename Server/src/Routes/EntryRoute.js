import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { authorize } from "../Middleware/roleMiddleware.js";
import { approveRejectEvent, getEntries,addToEvents,updateEventItem, addPartnerToEvent, getPlayerEntries} from "../Controllers/EntryController.js";

const EntryRoute = express.Router();

// Player routes
EntryRoute.post("/create", protect, addToEvents);
EntryRoute.get("/me", protect, getPlayerEntries);
EntryRoute.put("/update/:eventId", protect, updateEventItem);
EntryRoute.put("/add-partner", protect, addPartnerToEvent);


// Admin routes
EntryRoute.put("/approve/:entryId/:eventId", protect, authorize("admin"), approveRejectEvent);
EntryRoute.get("/admin/entries",protect,authorize("admin"),getEntries);
export default EntryRoute;
