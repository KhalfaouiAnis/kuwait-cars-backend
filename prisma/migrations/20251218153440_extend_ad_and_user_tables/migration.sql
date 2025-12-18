/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `ads` table. All the data in the column will be lost.
  - The `mileage` column on the `ads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `under_warranty` column on the `ads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `type` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `media` table. All the data in the column will be lost.
  - Added the required column `original_url` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('THUMBNAIL', 'IMAGE', 'VIDEO');

-- AlterTable
ALTER TABLE "ads" DROP COLUMN "thumbnail",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "expires_in" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "mileage_unit" VARCHAR(2),
DROP COLUMN "mileage",
ADD COLUMN     "mileage" INTEGER,
DROP COLUMN "under_warranty",
ADD COLUMN     "under_warranty" BOOLEAN;

-- AlterTable
ALTER TABLE "media" DROP COLUMN "type",
DROP COLUMN "url",
ADD COLUMN     "media_type" "MediaType" NOT NULL DEFAULT 'THUMBNAIL',
ADD COLUMN     "original_url" TEXT NOT NULL,
ADD COLUMN     "transformed_url" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "apple_id" TEXT,
ADD COLUMN     "facebook_id" TEXT,
ADD COLUMN     "google_id" TEXT;
