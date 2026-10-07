import express from "express";
import { authenticate, requireRole, requirePermission } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  createPrescription,
  getPrescriptionById,
  getMyPrescriptions,
  updatePrescription
} from "./prescription.controller.js";

import { createPrescriptionSchema, updatePrescriptionSchema } from "./prescription.validation.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  requirePermission("MANAGE_PRESCRIPTIONS"),
  validate(createPrescriptionSchema),
  createPrescription
);

router.get(
  "/",
  authenticate,
  requireRole("PATIENT", "DOCTOR"),
  getMyPrescriptions
);

router.get(
  "/:id",
  authenticate,
  requireRole("PATIENT", "DOCTOR"),
  getPrescriptionById
);

router.put(
  "/:id",
  authenticate,
  requirePermission("MANAGE_PRESCRIPTIONS"),
  validate(updatePrescriptionSchema),
  updatePrescription
);

export default router;