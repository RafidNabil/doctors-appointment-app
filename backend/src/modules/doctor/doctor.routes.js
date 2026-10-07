import express from "express";

import {
  getDoctors,
  getDoctorById,
  getMyProfile,
  updateMyProfile,
} from "./doctor.controller.js";

import {
  authenticate,
  requireRole,
  requirePermission
} from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  updateDoctorProfileSchema,
} from "./doctor.validation.js";

const router = express.Router();

router.get(
  "/me/profile",
  authenticate,
  requirePermission("MANAGE_DOCTOR_PROFILE"),
  getMyProfile
);

router.put(
  "/me/profile",
  authenticate,
  requirePermission("MANAGE_DOCTOR_PROFILE"),
  validate(updateDoctorProfileSchema),
  updateMyProfile
);

router.get("/", getDoctors);

router.get("/:id", getDoctorById);

export default router;