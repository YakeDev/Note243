import { prisma } from "@/lib/prisma";

export async function canManageBusinessImages(
  user: { id: string; role?: string },
  businessId: string,
) {
  if (user.role === "ADMIN") return true;

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { ownerId: true },
  });

  return !!business?.ownerId && business.ownerId === user.id;
}
