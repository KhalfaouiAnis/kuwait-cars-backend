-- CreateTable
CREATE TABLE "ad_drafts" (
    "id" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "user_id" TEXT NOT NULL,
    "ad_type" TEXT NOT NULL,
    "step_index" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ad_drafts_user_id_ad_type_key" ON "ad_drafts"("user_id", "ad_type");

-- AddForeignKey
ALTER TABLE "ad_drafts" ADD CONSTRAINT "ad_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
