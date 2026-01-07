import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { config } from "./src/config/environment.js";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: config.database.schema || "postgresql://placeholder:5432/db",
  },
});
