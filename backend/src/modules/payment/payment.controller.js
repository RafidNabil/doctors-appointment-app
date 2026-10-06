import {
  createPayment as createPaymentService,
  getPaymentById as getPaymentByIdService,
  getMyPayments as getMyPaymentsService,
} from "./payment.service.js";

export const createPayment = async (req, res, next) => {
  try {
    const payment = await createPaymentService(
      req.user.userId,
      req.user.role,
      req.body
    );

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const payment = await getPaymentByIdService(
      req.user.userId,
      req.user.role,
      req.params.id
    );

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await getMyPaymentsService(
      req.user.userId,
      req.user.role
    );

    res.json({
      success: true,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};