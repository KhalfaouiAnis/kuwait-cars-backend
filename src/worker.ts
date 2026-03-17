import { Worker } from "bullmq";
import IORedis from "ioredis";
import VectorService from "@services/vector.service.js";
import { EMBEDDING_QUEUE_NAME } from "./queue/client.js";
import { config } from "@config/environment.js";
import { prisma } from "database/index.js";

const connection = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
});

console.log("🛠️ Worker Listening for Jobs...");

const worker = new Worker(
  EMBEDDING_QUEUE_NAME,
  async (job) => {
    console.log(`[Job ${job.id}] Processing Ad: ${job.data.adId}`);

    try {
      const { adId, imageUrl } = job.data;
      const start = Date.now();

      const vector = await VectorService.generateEmbedding(imageUrl);
      const vectorStr = `[${vector.join(",")}]`;

      await prisma.$executeRaw`
        UPDATE "ads"
        SET "image_embedding" = ${vectorStr}::vector
        WHERE id = ${adId}
    `;

      console.log(`✅ [Job ${job.id}] Completed in ${Date.now() - start}ms`);
    } catch (error) {
      console.error(`❌ [Job ${job.id}] Failed:`, error);
      throw error;
    }
  },
  {
    connection: connection as any,
    concurrency: 1,
  },
);

process.on("SIGTERM", async () => {
  await worker.close();
});
