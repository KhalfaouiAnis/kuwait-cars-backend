import { config } from "@config/environment.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: config.database.schema,
});

export const prisma = new PrismaClient({
  adapter,
  log:
    config.env === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
}).$extends({
  query: {
    ad: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
    },
  },
});
