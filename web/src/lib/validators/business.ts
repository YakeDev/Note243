import { z } from "zod";

export const businessSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  description: z.string().max(500).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  website: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  categoryId: z.string().uuid("Catégorie invalide"),
  ownerId: z.string().uuid().optional(),
});

export type BusinessInput = z.infer<typeof businessSchema>;
