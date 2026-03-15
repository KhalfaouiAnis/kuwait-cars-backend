/*
  Warnings:

  - You are about to drop the column `imageEmbedding` on the `ads` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ads_imageEmbedding_idx";

-- AlterTable
ALTER TABLE "ads" DROP COLUMN "imageEmbedding",
ADD COLUMN     "image_embedding" vector(512);

-- CreateIndex
CREATE INDEX "ads_image_embedding_idx" ON "ads"("image_embedding");
