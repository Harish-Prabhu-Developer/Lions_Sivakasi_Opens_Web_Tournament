import express from "express";
import EntryRoute from "./EntryRoute.js";
import AuthRoute from "./AuthRoute.js";

const router = express.Router();
router.use('/auth',AuthRoute);
router.use('/entry',EntryRoute);
export default router;