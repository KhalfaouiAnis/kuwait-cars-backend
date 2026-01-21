-- AlterTable
ALTER TABLE "ads" ADD COLUMN     "views" BIGINT NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "views" (
    "id" TEXT NOT NULL,
    "ad_id" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "views_ad_id_user_id_key" ON "views"("ad_id", "user_id");
