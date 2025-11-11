/*
  Warnings:

  - You are about to drop the column `thambnail_url` on the `ads` table. All the data in the column will be lost.
  - The `price` column on the `ads` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `thumbnail` to the `ads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mark` to the `cars` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ads" DROP CONSTRAINT "ads_car_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ads" DROP CONSTRAINT "ads_location_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ads" DROP CONSTRAINT "ads_user_id_fkey";

-- AlterTable
ALTER TABLE "ads" DROP COLUMN "thambnail_url",
ADD COLUMN     "thumbnail" TEXT NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
DROP COLUMN "price",
ADD COLUMN     "price" INTEGER,
ALTER COLUMN "car_id" DROP NOT NULL,
ALTER COLUMN "location_id" DROP NOT NULL,
ALTER COLUMN "year" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cars" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "mark" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Location";

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "block" TEXT NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_car_id_fkey" FOREIGN KEY ("car_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
