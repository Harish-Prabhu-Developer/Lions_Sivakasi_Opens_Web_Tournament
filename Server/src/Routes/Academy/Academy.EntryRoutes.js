// Routes/Academy/Academy.EntryRoutes.js
import express from "express";
import { protect } from "../../Middleware/authMiddleware.js";
import { authorize } from "../../Middleware/roleMiddleware.js";
import { addToAcademyEvents, getAcademyEntries, getAcademyEntryDetails, getAcademyPlayerEntries, getFilteredEventsForReport, getPaymentWithEvents, updateEventStatus } from "../../Controllers/Academy.EntryController.js";
const AcademyEntryRouter = express.Router();

AcademyEntryRouter.post("/add/:playerID",protect,authorize("academy","admin"),addToAcademyEvents);
AcademyEntryRouter.get("/:playerID",protect,authorize("academy","admin"),getAcademyPlayerEntries);


// Admin Entry Routes
AcademyEntryRouter.get("/admin/academy-entries",protect,authorize("admin"),getAcademyEntries);
AcademyEntryRouter.put("/:entryId/events/:eventId", protect, updateEventStatus);
AcademyEntryRouter.get("/payment-events/:paymentId", protect, getPaymentWithEvents);

AcademyEntryRouter.get("/details/:entryId", protect, getAcademyEntryDetails);



// Admin Reports of Academy Entries
AcademyEntryRouter.get("/admin/academy-export-report",protect,authorize("admin"),getFilteredEventsForReport);


export default AcademyEntryRouter;