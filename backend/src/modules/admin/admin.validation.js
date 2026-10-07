import { z } from "zod";

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const createScheduleSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid start time"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid end time"),
});

export const updateScheduleSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6).optional(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid start time")
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid end time")
    .optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum([
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ]),
});

export const createSettingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export const updateSettingSchema = z.object({
  value: z.string(),
});

export const createBookingRuleSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});

export const updateBookingRuleSchema = z.object({
  value: z.string(),
});

export const createRoleSchema = z.object({
  name: z.string().min(1),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1),
});

export const createPermissionSchema = z.object({
  name: z.string().min(1),
});

export const updatePermissionSchema = z.object({
  name: z.string().min(1),
});

export const assignPermissionSchema = z.object({
  permissionId: z.string().uuid(),
});

export const auditLogQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
});