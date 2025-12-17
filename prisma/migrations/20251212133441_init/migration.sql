-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'ANONYMOUS');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "email" TEXT,
    "province" JSONB,
    "area" JSONB,
    "location" JSONB,
    "password" TEXT,
    "avatar" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ad_id" TEXT NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ads" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ad_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "plan" JSONB NOT NULL,
    "status" "AdStatus" DEFAULT 'ACTIVE',
    "thumbnail" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "ad_category" TEXT,
    "price" INTEGER,
    "province" JSONB,
    "area" JSONB,
    "location" JSONB,
    "year" INTEGER,
    "exterior_color" TEXT,
    "mileage" TEXT,
    "fuel_type" TEXT,
    "cylinders" TEXT,
    "transmission" TEXT,
    "under_warranty" TEXT,
    "roof" TEXT,
    "second_additional_number" TEXT,
    "additional_number" TEXT,
    "hide_license_plate" BOOLEAN,
    "contact_whatsapp" BOOLEAN,
    "receive_calls" BOOLEAN,
    "xcar_calls" BOOLEAN,
    "xcar_chat" BOOLEAN,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserFavoritedAds" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserFavoritedAds_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_UserFlaggededAds" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserFlaggededAds_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "_UserFavoritedAds_B_index" ON "_UserFavoritedAds"("B");

-- CreateIndex
CREATE INDEX "_UserFlaggededAds_B_index" ON "_UserFlaggededAds"("B");

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "ads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ads" ADD CONSTRAINT "ads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavoritedAds" ADD CONSTRAINT "_UserFavoritedAds_A_fkey" FOREIGN KEY ("A") REFERENCES "ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFavoritedAds" ADD CONSTRAINT "_UserFavoritedAds_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFlaggededAds" ADD CONSTRAINT "_UserFlaggededAds_A_fkey" FOREIGN KEY ("A") REFERENCES "ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserFlaggededAds" ADD CONSTRAINT "_UserFlaggededAds_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
