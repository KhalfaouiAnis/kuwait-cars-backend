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
      ? [
          { emit: "event", level: "query" },
          { emit: "stdout", level: "error" },
        ]
      : ["error"],
});

prisma.$extends({
  query: {
    ad: {
      async findMany({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
    },
  },
});

prisma.$on("query" as any, (e: any) => {
  console.log("--- Database Query ---");
  console.log(`SQL: ${e.query}`);
  console.log(`Params: ${e.params}`); // <--- This shows the [100, 200] values
  console.log(`Duration: ${e.duration}ms`);
});
