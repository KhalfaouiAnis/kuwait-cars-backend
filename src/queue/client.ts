import { config } from "@config/environment.js";
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(config.redis.url, {
  maxRetriesPerRequest: null,
});

export const EMBEDDING_QUEUE_NAME = "embedding-generation";

export const embeddingQueue = new Queue(EMBEDDING_QUEUE_NAME, {
  connection: connection as any,
});
