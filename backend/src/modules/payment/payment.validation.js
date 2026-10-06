import { z } from "zod";

export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.coerce.number().positive(),
});