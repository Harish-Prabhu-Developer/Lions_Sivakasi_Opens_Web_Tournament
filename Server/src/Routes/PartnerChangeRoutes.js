import express from "express";
import {protect} from "../Middleware/authMiddleware.js";
import {authorize} from "../Middleware/roleMiddleware.js"
import {  getAllPartnerChangeRequests, getMyPartnerChangeRequests, requestPartnerChange, updatePartnerChangeStatus } from "../Controllers/PartnerChangeController.js";
const PartnerChangeRouter = express.Router();

// 🔹 Player routes
PartnerChangeRouter.post("/request", protect, requestPartnerChange);
PartnerChangeRouter.get("/my-requests", protect, getMyPartnerChangeRequests);

// 🔹 Admin routes
PartnerChangeRouter.get("/all", protect, authorize("admin"), getAllPartnerChangeRequests);
PartnerChangeRouter.put("/:id/change", protect, authorize("admin"), updatePartnerChangeStatus);

export default PartnerChangeRouter;
