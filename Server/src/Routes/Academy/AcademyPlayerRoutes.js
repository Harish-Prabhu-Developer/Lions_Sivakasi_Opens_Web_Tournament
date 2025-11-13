// Routes/AcademyPlayerRoutes.js
import express from "express";

import {protect} from "../../Middleware/authMiddleware.js";
import {authorize} from "../../Middleware/roleMiddleware.js";
import { createPlayer, deletePlayer, getPlayer, getPlayers, getPlayerStats, updatePlayer } from "../../Controllers/AcademyPlayerController.js";
const AcademyPlayerRouter = express.Router();

// All routes are protected and require academy role

AcademyPlayerRouter.post("/create",protect,authorize("academy","superadmin","admin"),createPlayer);
AcademyPlayerRouter.get("/",protect,authorize("academy","superadmin","admin"),getPlayers);
AcademyPlayerRouter.get("/stats",protect,authorize("academy","superadmin","admin"),getPlayerStats);
AcademyPlayerRouter.put("/:id",protect,authorize("academy","superadmin","admin"),updatePlayer);
AcademyPlayerRouter.get("/:id",protect,authorize("academy","superadmin","admin"),getPlayer);
AcademyPlayerRouter.delete("/:id",protect,authorize("academy","superadmin","admin"),deletePlayer);
export default AcademyPlayerRouter;