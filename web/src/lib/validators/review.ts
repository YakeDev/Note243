import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Commentaire trop court"),
  businessId: z.string().uuid(),
  userId: z.string().uuid().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
