import express from 'express';
import { protect } from '../Middleware/authMiddleware.js';
import { bulkDeleteUsers, deleteUser, PlayerFormChange } from '../Controllers/UserController.js';
import { authorize } from '../Middleware/roleMiddleware.js';

const UserRoute =express.Router();

UserRoute.put("/updatePlayer",protect,PlayerFormChange);

// Admin Routes
UserRoute.delete("/admin/delete/:userId",protect,authorize("admin"),deleteUser);
// BODY: userIds:[]
UserRoute.put("/admin/delete-multiple-users",protect,authorize("admin"),bulkDeleteUsers);
export default UserRoute;