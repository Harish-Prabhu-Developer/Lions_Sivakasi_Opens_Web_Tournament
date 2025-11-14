// Routes/Academy/Academy.PaymentRoutes.js
import express from "express";
import { protect } from "../../Middleware/authMiddleware.js";
import { authorize } from "../../Middleware/roleMiddleware.js";
import { addToAcademyEventPayment, getAcademyEntryPayments } from "../../Controllers/Academy.PaymentController.js";


const AcademyPaymentRouter = express.Router();

AcademyPaymentRouter.post("/add-payment/:playerID/:entryID", protect,authorize("academy","admin"),addToAcademyEventPayment);
AcademyPaymentRouter.get("/:playerID/:entryID",protect,authorize("academy","admin"),getAcademyEntryPayments);

export default AcademyPaymentRouter;