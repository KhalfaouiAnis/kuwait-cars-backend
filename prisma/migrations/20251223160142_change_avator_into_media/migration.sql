/*
  Warnings:

  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `media` will be added. If there are existing duplicate values, this will fail.
  - Made the column `province` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_ad_id_fkey";

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "ad_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
ALTER COLUMN "province" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "media_user_id_key" ON "media"("user_id");

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "ads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
