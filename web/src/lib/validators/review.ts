import { z } from "zod";

export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Commentaire trop court"),
  businessId: z.string().uuid(),
});

export const reviewUpdateSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(10, "Commentaire trop court").optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "Aucun changement",
    path: ["comment"],
  });

export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof reviewUpdateSchema>;
