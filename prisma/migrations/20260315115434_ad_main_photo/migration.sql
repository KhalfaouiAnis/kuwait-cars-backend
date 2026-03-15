/*
  Warnings:

  - Added the required column `main_photo` to the `ads` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ads" ADD COLUMN     "main_photo" TEXT NOT NULL;

-- RenameIndex
ALTER INDEX "ads_embedding_idx" RENAME TO "ads_imageEmbedding_idx";
