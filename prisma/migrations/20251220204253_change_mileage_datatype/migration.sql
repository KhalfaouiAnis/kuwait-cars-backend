/*
  Warnings:

  - You are about to alter the column `mileage` on the `ads` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "ads" ALTER COLUMN "mileage" SET DATA TYPE DECIMAL(10,2);
