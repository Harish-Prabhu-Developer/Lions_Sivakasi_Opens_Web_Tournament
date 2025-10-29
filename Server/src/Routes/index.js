import express from "express";
import EntryRoute from "./EntryRoute.js";
import AuthRoute from "./AuthRoute.js";
import UserRoute from "./UserRoute.js";

const router = express.Router();
router.use('/auth',AuthRoute);
router.use('/entry',EntryRoute);
router.use('/user',UserRoute);
export default router;