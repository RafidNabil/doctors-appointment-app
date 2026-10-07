import express from "express";

import {
  getMyProfile,
  updateMyProfile,
} from "./patient.controller.js";

import {
  authenticate,
  requireRole,
  requirePermission
} from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  updatePatientProfileSchema,
} from "./patient.validation.js";

const router = express.Router();

router.get(
  "/me/profile",
  authenticate,
  requirePermission("MANAGE_PATIENT_PROFILE"),
  getMyProfile
);

router.put(
  "/me/profile",
  authenticate,
  requirePermission("MANAGE_PATIENT_PROFILE"),
  validate(updatePatientProfileSchema),
  updateMyProfile
);

export default router;