import express from "express";
import EntryRoute from "./EntryRoute.js";
import AuthRoute from "./AuthRoute.js";
import UserRoute from "./UserRoute.js";
import PaymentRoute from "./PaymentRoutes.js";
import PartnerChangeRouter from "./PartnerChangeRoutes.js";
import DashboardRoute from "./DashboardRoute.js";

const router = express.Router();
router.use('/auth',AuthRoute);
router.use('/entry',EntryRoute);
router.use('/user',UserRoute);
router.use('/payment',PaymentRoute);
router.use('/partner',PartnerChangeRouter);
router.use('/admin', DashboardRoute); // Add this line
export default router;