// PaymentController.js
import PaymentModel from "../Models/PaymentModel";

/**
 * Create a new payment for a tournament entry
 * @param {*} req
 * @param {*} res
 */
export const addPayment = async (req, res) => {
  try {
    const payment =  await PaymentModel.create(req.body);
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

