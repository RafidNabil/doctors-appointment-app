import { z } from "zod";

export const getAvailableSlotsSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().date(),
});

export const bookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  appointmentDate: z.string().date(),
});

export const rescheduleAppointmentSchema = z.object({
  appointmentDate: z.string().date(),
});