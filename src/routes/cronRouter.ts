import { config } from "@config/environment.js";
import Logger from "@libs/logger.js";
import { prisma } from "database/index.js";
import { Router } from "express";

const router = Router();

router.post("/soft-delete-ads", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${config.do.cronSecret}`) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const result = await prisma.$executeRaw`
      UPDATE "ads"
      SET "deleted_at" = NOW()
      WHERE "deleted_at" IS NULL
      AND "created_at" + ("expires_in" * interval '1 day') < NOW()
    `;

    res.json({ success: true, updated: result });
  } catch (error) {
    Logger.error(error);
    res.status(500).json({ success: false, error: error });
  }
});

export default router;
