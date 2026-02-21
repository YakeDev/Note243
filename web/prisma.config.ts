import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";

// Ensure env vars are loaded when Prisma reads this config (CLI does not auto-load .env here).
dotenv.config({ path: "./.env" });

const databaseUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const shadowDatabaseUrl = process.env.DIRECT_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required (set it in .env)");
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
    shadowDatabaseUrl,
  },
});
