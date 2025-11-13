import express from 'express';
import { academyForgotPassword, academyLogin,  academyLogout,  academyRegister } from '../../Controllers/Academy.authController.js';
import {protect} from "../../Middleware/authMiddleware.js";
const AcademyAuthRoute = express.Router();

AcademyAuthRoute.post('/register',academyRegister);
AcademyAuthRoute.post('/login',academyLogin);

// Logout Protected
AcademyAuthRoute.post('/logout',protect,academyLogout);

// ForgetPassword
AcademyAuthRoute.post('/forgot-password',academyForgotPassword);

export default AcademyAuthRoute;