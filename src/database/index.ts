import { config } from "@config/environment.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: config.database.schema,
});

export const prisma = new PrismaClient({ adapter });
