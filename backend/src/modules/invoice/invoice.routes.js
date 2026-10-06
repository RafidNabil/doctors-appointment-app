import express from "express";

import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  createInvoice,
  deleteInvoice,
  getInvoiceById,
  getMyInvoices,
} from "./invoice.controller.js";

import {
  createInvoiceSchema,
} from "./invoice.validation.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  requireRole("ADMIN"),
  validate(createInvoiceSchema),
  createInvoice
);

router.get(
  "/",
  authenticate,
  requireRole("PATIENT", "DOCTOR", "ADMIN"),
  getMyInvoices
);

router.delete(
  "/:id",
  authenticate,
  requireRole("ADMIN"),
  deleteInvoice
);

router.get(
  "/:id",
  authenticate,
  requireRole("PATIENT", "DOCTOR", "ADMIN"),
  getInvoiceById
);

export default router;