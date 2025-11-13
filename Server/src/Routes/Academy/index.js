import express from "express";
import AcademyAuthRoute from "./Academy.authRoute.js";
import AcademyPlayerRouter from "./AcademyPlayerRoutes.js";

const AcademyRouter = express.Router();
AcademyRouter.use('/auth',AcademyAuthRoute);
AcademyRouter.use('/player',AcademyPlayerRouter);
export default AcademyRouter;