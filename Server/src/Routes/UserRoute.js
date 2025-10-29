import express from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import { PlayerFormChange } from '../Controllers/UserController.js';

const UserRoute =express.Router();

UserRoute.put("/updatePlayer",protect,PlayerFormChange)
export default UserRoute;