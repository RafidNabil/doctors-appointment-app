import express from "express";

import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  createPayment,
  getPaymentById,
  getMyPayments,
} from "./payment.controller.js";

import {
  createPaymentSchema,
} from "./payment.validation.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  requireRole("DOCTOR", "ADMIN"),
  validate(createPaymentSchema),
  createPayment
);

router.get(
  "/",
  authenticate,
  requireRole("PATIENT", "DOCTOR", "ADMIN"),
  getMyPayments
);

router.get(
  "/:id",
  authenticate,
  requireRole("PATIENT", "DOCTOR", "ADMIN"),
  getPaymentById
);

export default router;