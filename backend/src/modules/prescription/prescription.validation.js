import { z } from "zod";

export const createPrescriptionSchema = z.object({
  appointmentId: z.string().uuid(),
  items: z
    .array(
      z.object({
        medication: z.string().min(1),
        dosage: z.string().min(1),
        frequency: z.string().min(1),
        duration: z.string().min(1),
      })
    )
    .min(1),
});

export const updatePrescriptionSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        medication: z.string().min(1),
        dosage: z.string().min(1),
        frequency: z.string().min(1),
        duration: z.string().min(1),
      })
    )
    .min(1),
});