import express from "express";

import {
  authenticate,
  requirePermission,
} from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  getDoctors,
  getDoctorById,
  updateDoctorStatus,
  getPatients,
  getPatientById,
  updatePatientStatus,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  getDoctorSchedules,
  createDoctorSchedule,
  updateDoctorSchedule,
  deleteDoctorSchedule,
  getOverviewReport,
  getAppointmentReport,
  getRevenueReport,
  getSettings,
  createSetting,
  updateSetting,
  deleteSetting,
  getBookingRules,
  createBookingRule,
  updateBookingRule,
  deleteBookingRule,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  assignPermissionToRole,
  removePermissionFromRole,
  getAuditLogs,
  getAuditLogById,
} from "./admin.controller.js";

import {
  updateUserStatusSchema,
  createScheduleSchema,
  updateScheduleSchema,
  updateAppointmentStatusSchema,
  createSettingSchema,
  updateSettingSchema,
  createBookingRuleSchema,
  updateBookingRuleSchema,
  createRoleSchema,
  updateRoleSchema,
  createPermissionSchema,
  updatePermissionSchema,
  assignPermissionSchema,
  auditLogQuerySchema,
} from "./admin.validation.js";

const router = express.Router();

/* =========================
   DOCTORS
========================= */

router.get(
  "/doctors",
  authenticate,
  requirePermission("MANAGE_DOCTORS"),
  getDoctors
);

router.get(
  "/doctors/:id",
  authenticate,
  requirePermission("MANAGE_DOCTORS"),
  getDoctorById
);

router.patch(
  "/doctors/:id/status",
  authenticate,
  requirePermission("MANAGE_DOCTORS"),
  validate(updateUserStatusSchema),
  updateDoctorStatus
);

/* =========================
   PATIENTS
========================= */

router.get(
  "/patients",
  authenticate,
  requirePermission("MANAGE_PATIENTS"),
  getPatients
);

router.get(
  "/patients/:id",
  authenticate,
  requirePermission("MANAGE_PATIENTS"),
  getPatientById
);

router.patch(
  "/patients/:id/status",
  authenticate,
  requirePermission("MANAGE_PATIENTS"),
  validate(updateUserStatusSchema),
  updatePatientStatus
);

/* =========================
   APPOINTMENTS
========================= */

router.get(
  "/appointments",
  authenticate,
  requirePermission("MANAGE_APPOINTMENTS"),
  getAppointments
);

router.get(
  "/appointments/:id",
  authenticate,
  requirePermission("MANAGE_APPOINTMENTS"),
  getAppointmentById
);

router.patch(
  "/appointments/:id/status",
  authenticate,
  requirePermission("MANAGE_APPOINTMENTS"),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatus
);

/* =========================
   SCHEDULES
========================= */

router.get(
  "/doctors/:doctorId/schedules",
  authenticate,
  requirePermission("MANAGE_SCHEDULES"),
  getDoctorSchedules
);

router.post(
  "/doctors/:doctorId/schedules",
  authenticate,
  requirePermission("MANAGE_SCHEDULES"),
  validate(createScheduleSchema),
  createDoctorSchedule
);

router.put(
  "/schedules/:id",
  authenticate,
  requirePermission("MANAGE_SCHEDULES"),
  validate(updateScheduleSchema),
  updateDoctorSchedule
);

router.delete(
  "/schedules/:id",
  authenticate,
  requirePermission("MANAGE_SCHEDULES"),
  deleteDoctorSchedule
);

/* =========================
   REPORTS
========================= */

router.get(
  "/reports/overview",
  authenticate,
  requirePermission("VIEW_REPORTS"),
  getOverviewReport
);

router.get(
  "/reports/appointments",
  authenticate,
  requirePermission("VIEW_REPORTS"),
  getAppointmentReport
);

router.get(
  "/reports/revenue",
  authenticate,
  requirePermission("VIEW_REPORTS"),
  getRevenueReport
);

/* =========================
   CLINIC SETTINGS
========================= */

router.get(
  "/settings",
  authenticate,
  requirePermission("MANAGE_CLINIC_SETTINGS"),
  getSettings
);

router.post(
  "/settings",
  authenticate,
  requirePermission("MANAGE_CLINIC_SETTINGS"),
  validate(createSettingSchema),
  createSetting
);

router.put(
  "/settings/:id",
  authenticate,
  requirePermission("MANAGE_CLINIC_SETTINGS"),
  validate(updateSettingSchema),
  updateSetting
);

router.delete(
  "/settings/:id",
  authenticate,
  requirePermission("MANAGE_CLINIC_SETTINGS"),
  deleteSetting
);

/* =========================
   BOOKING RULES
========================= */

router.get(
  "/booking-rules",
  authenticate,
  requirePermission("MANAGE_BOOKING_RULES"),
  getBookingRules
);

router.post(
  "/booking-rules",
  authenticate,
  requirePermission("MANAGE_BOOKING_RULES"),
  validate(createBookingRuleSchema),
  createBookingRule
);

router.put(
  "/booking-rules/:id",
  authenticate,
  requirePermission("MANAGE_BOOKING_RULES"),
  validate(updateBookingRuleSchema),
  updateBookingRule
);

router.delete(
  "/booking-rules/:id",
  authenticate,
  requirePermission("MANAGE_BOOKING_RULES"),
  deleteBookingRule
);

/* =========================
   ROLES
========================= */

router.get(
  "/roles",
  authenticate,
  requirePermission("MANAGE_ROLES"),
  getRoles
);

router.post(
  "/roles",
  authenticate,
  requirePermission("MANAGE_ROLES"),
  validate(createRoleSchema),
  createRole
);

router.put(
  "/roles/:id",
  authenticate,
  requirePermission("MANAGE_ROLES"),
  validate(updateRoleSchema),
  updateRole
);

router.delete(
  "/roles/:id",
  authenticate,
  requirePermission("MANAGE_ROLES"),
  deleteRole
);

/* =========================
   PERMISSIONS
========================= */

router.get(
  "/permissions",
  authenticate,
  requirePermission("MANAGE_PERMISSIONS"),
  getPermissions
);

router.post(
  "/permissions",
  authenticate,
  requirePermission("MANAGE_PERMISSIONS"),
  validate(createPermissionSchema),
  createPermission
);

router.put(
  "/permissions/:id",
  authenticate,
  requirePermission("MANAGE_PERMISSIONS"),
  validate(updatePermissionSchema),
  updatePermission
);

router.delete(
  "/permissions/:id",
  authenticate,
  requirePermission("MANAGE_PERMISSIONS"),
  deletePermission
);

router.post(
  "/roles/:roleId/permissions",
  authenticate,
  requirePermission("MANAGE_PERMISSIONS"),
  validate(assignPermissionSchema),
  assignPermissionToRole
);

router.delete(
  "/roles/:roleId/permissions/:permissionId",
  authenticate,
  requirePermission("MANAGE_PERMISSIONS"),
  removePermissionFromRole
);

/* =========================
   AUDIT LOGS
========================= */

router.get(
  "/audit-logs",
  authenticate,
  requirePermission("VIEW_AUDIT_LOGS"),
  validate(auditLogQuerySchema, "query"),
  getAuditLogs
);

router.get(
  "/audit-logs/:id",
  authenticate,
  requirePermission("VIEW_AUDIT_LOGS"),
  getAuditLogById
);

export default router;