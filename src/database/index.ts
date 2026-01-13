import { config } from "@config/environment.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: config.database.schema,
});

const instance = new PrismaClient({
  adapter,
  log:
    config.env === "development"
      ? [
          { emit: "event", level: "query" },
          { emit: "stdout", level: "error" },
        ]
      : ["error"],
});

export const prisma = instance.$extends({
  query: {
    ad: {
      // async $allOperations({ operation, args, query }) {
      //   if ("where" in args) {
      //     args.where = { ...args.where, deleted_at: null };
      //   }
      //   return query(args);
      // },
      async findMany({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
    },
  },
});

instance.$on("query" as any, (e: any) => {
  console.log("--- Database Query ---");
  console.log(`SQL: ${e.query}`);
  console.log(`Params: ${e.params}`);
  console.log(`Duration: ${e.duration}ms`);
});
