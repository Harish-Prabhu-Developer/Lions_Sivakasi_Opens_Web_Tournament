// Routes/Academy/Academy.EntryRoutes.js
import express from "express";
import { protect } from "../../Middleware/authMiddleware.js";
import { authorize } from "../../Middleware/roleMiddleware.js";
import { addToAcademyEvents, getAcademyPlayerEntries } from "../../Controllers/Academy.EntryController.js";
const AcademyEntryRouter = express.Router();

AcademyEntryRouter.post("/add/:playerID",protect,authorize("academy","admin"),addToAcademyEvents);
AcademyEntryRouter.get("/:playerID",protect,authorize("academy","admin"),getAcademyPlayerEntries);


export default AcademyEntryRouter;