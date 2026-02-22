import { UserRole, UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole | null;
      status?: UserStatus | null;
    };
  }

  interface User {
    role: UserRole;
    status?: UserStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    status?: UserStatus | null;
  }
}
