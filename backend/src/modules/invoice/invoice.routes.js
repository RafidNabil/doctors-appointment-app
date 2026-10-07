import express from "express";

import {
  authenticate,
  requireRole,
  requirePermission
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
  requirePermission("MANAGE_INVOICES"),
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
  requirePermission("MANAGE_INVOICES"),
  deleteInvoice
);

router.get(
  "/:id",
  authenticate,
  requireRole("PATIENT", "DOCTOR", "ADMIN"),
  getInvoiceById
);

export default router;