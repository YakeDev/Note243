import { z } from "zod";

const passwordRules =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // 8 chars, 1 upper, 1 lower, 1 digit

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nom trop court"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .regex(passwordRules, "8 caractères, 1 majuscule, 1 minuscule et 1 chiffre"),
    confirm: z.string(),
    accountType: z.enum(["USER", "OWNER"]),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const resetRequestSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .regex(passwordRules, "8 caractères, 1 majuscule, 1 minuscule et 1 chiffre"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm"],
  });
