/*
  Warnings:

  - You are about to drop the column `thambnailUrl` on the `ads` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `cars` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `otps` table. All the data in the column will be lost.
  - Added the required column `thambnail_url` to the `ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `otps` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ads" DROP COLUMN "thambnailUrl",
ADD COLUMN     "thambnail_url" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "cars" DROP COLUMN "year",
ALTER COLUMN "mileage" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "created_at",
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;
