import { z } from "zod";

export const updateDoctorProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  specialization: z.string().min(1).optional(),
  qualification: z.string().min(1).optional(),
  experience: z.string().min(1).optional(),
  bio: z.string().optional(),
  consultationFee: z.coerce.number().nonnegative().optional(),
});