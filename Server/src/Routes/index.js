import express from "express";
import EntryRoute from "./EntryRoute.js";
import AuthRoute from "./AuthRoute.js";
import UserRoute from "./UserRoute.js";
import PaymentRoute from "./PaymentRoutes.js";
import PartnerChangeRouter from "./PartnerChangeRoutes.js";

const router = express.Router();
router.use('/auth',AuthRoute);
router.use('/entry',EntryRoute);
router.use('/user',UserRoute);
router.use('/payment',PaymentRoute);
router.use('/partner',PartnerChangeRouter);
export default router;