import { z } from "zod";

export const updatePatientProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),

  dateOfBirth: z
    .string()
    .date()
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .optional(),

  gender: z.string().optional(),
});