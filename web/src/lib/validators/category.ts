import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  slug: z.string().min(2, "Slug requis"),
  description: z.string().max(500).optional().or(z.literal("").transform(() => undefined)),
  icon: z.string().max(50).optional().or(z.literal("").transform(() => undefined)),
  parentId: z.string().uuid().optional().or(z.literal("").transform(() => undefined)),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
