/*
  Warnings:

  - A unique constraint covering the columns `[user_id,edit_ad_id]` on the table `ad_drafts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ad_drafts_user_id_idx";

-- AlterTable
ALTER TABLE "ad_drafts" ADD COLUMN     "edit_ad_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ad_drafts_user_id_edit_ad_id_key" ON "ad_drafts"("user_id", "edit_ad_id");
