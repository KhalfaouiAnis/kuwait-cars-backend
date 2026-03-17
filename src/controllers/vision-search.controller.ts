import { Request, Response } from "express";
import VectorService from "../services/vector.service.js";
import { prisma } from "database/index.js";
import { Ad } from "generated/prisma/client.js";

type Similarities = Ad & {
  similarity: number;
};

export const searchByImage = async (
  req: Request & { file?: any },
  res: Response,
) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });
    const queryVector = await VectorService.generateEmbedding(req.file.buffer);
    const vectorStr = `[${queryVector.join(",")}]`;
    const results: Similarities[] = await prisma.$queryRaw`
      SELECT 
        id, 
        title, 
        "main_photo",
        1 - ("image_embedding" <=> ${vectorStr}::vector) as similarity
      FROM "ads"
      WHERE "image_embedding" IS NOT NULL
      ORDER BY "image_embedding" <=> ${vectorStr}::vector ASC
      LIMIT 4;
    `;

    res.json({ data: results.filter((ad) => ad.similarity > 0.95) });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Visual search failed" });
  }
};
