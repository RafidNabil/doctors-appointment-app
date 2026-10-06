import { z } from "zod";

export const createInvoiceSchema = z.object({
  appointmentId: z.string().uuid(),
  amount: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
});