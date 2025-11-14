import express from "express";
import AcademyAuthRoute from "./Academy.authRoute.js";
import AcademyPlayerRouter from "./AcademyPlayerRoutes.js";
import AcademyEntryRouter from "./Academy.EntryRoutes.js";
import AcademyPaymentRouter from "./Academy.PaymentRoutes.js";

const AcademyRouter = express.Router();
AcademyRouter.use('/auth',AcademyAuthRoute);
AcademyRouter.use('/player',AcademyPlayerRouter);
AcademyRouter.use('/entry',AcademyEntryRouter);
AcademyRouter.use('/payment',AcademyPaymentRouter);
export default AcademyRouter;