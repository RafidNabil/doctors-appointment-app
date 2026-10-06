import express from "express";

import {
  getAvailableSlots,
  bookAppointment,
  getUpcomingAppointments,
  getAppointmentHistory,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  markNoShow,
  getAppointmentPatient,
} from "./appointment.controller.js";

import {
  authenticate,
  requireRole,
} from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  getAvailableSlotsSchema,
  bookAppointmentSchema,
  rescheduleAppointmentSchema,
} from "./appointment.validation.js";

const router = express.Router();

router.get(
  "/available-slots",
  authenticate,
  requireRole("PATIENT"),
  validate(getAvailableSlotsSchema, "query"),
  getAvailableSlots
);

router.post(
  "/",
  authenticate,
  requireRole("PATIENT"),
  validate(bookAppointmentSchema),
  bookAppointment
);

router.get(
  "/upcoming",
  authenticate,
  requireRole("PATIENT", "DOCTOR"),
  getUpcomingAppointments
);

router.get(
  "/history",
  authenticate,
  requireRole("PATIENT", "DOCTOR"),
  getAppointmentHistory
);

router.patch(
  "/:id/cancel",
  authenticate,
  requireRole("DOCTOR"),
  cancelAppointment
);

router.patch(
  "/:id/reschedule",
  authenticate,
  requireRole("DOCTOR"),
  validate(rescheduleAppointmentSchema),
  rescheduleAppointment
);

router.patch(
  "/:id/complete",
  authenticate,
  requireRole("DOCTOR"),
  completeAppointment
);

router.patch(
  "/:id/no-show",
  authenticate,
  requireRole("DOCTOR"),
  markNoShow
);

router.get(
  "/:id/patient",
  authenticate,
  requireRole("DOCTOR"),
  getAppointmentPatient
);

export default router;