import express from "express";
import { protect } from "../Middleware/authMiddleware.js";
import { addToEventPayment } from "../Controllers/PaymentController.js";
const PaymentRoute = express.Router();

PaymentRoute.post("/add-payment",protect,addToEventPayment);
export default PaymentRoute;
