import express from "express";
import {
  addPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
} from "../Controllers/PaymentController.js";

const PaymentRoute = express.Router();

PaymentRoute.post("/add", addPayment);
PaymentRoute.get("/", getPayments);
PaymentRoute.get("/:id", getPaymentById);
PaymentRoute.put("/:id/status", updatePaymentStatus);
PaymentRoute.delete("/:id", deletePayment);

export default PaymentRoute;
