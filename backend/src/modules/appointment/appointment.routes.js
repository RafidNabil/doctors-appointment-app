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
  requirePermission
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
  requirePermission("VIEW_DOCTOR_SCHEDULES"),
  validate(getAvailableSlotsSchema, "query"),
  getAvailableSlots
);

router.post(
  "/",
  authenticate,
  requirePermission("BOOK_APPOINTMENTS"),
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
  requirePermission("MANAGE_DOCTOR_APPOINTMENTS"),
  cancelAppointment
);

router.patch(
  "/:id/reschedule",
  authenticate,
  requirePermission("MANAGE_DOCTOR_APPOINTMENTS"),
  validate(rescheduleAppointmentSchema),
  rescheduleAppointment
);

router.patch(
  "/:id/complete",
  authenticate,
  requirePermission("MANAGE_DOCTOR_APPOINTMENTS"),
  completeAppointment
);

router.patch(
  "/:id/no-show",
  authenticate,
  requirePermission("MANAGE_DOCTOR_APPOINTMENTS"),
  markNoShow
);

router.get(
  "/:id/patient",
  authenticate,
  requirePermission("VIEW_PATIENT_INFORMATION"),
  getAppointmentPatient
);

export default router;