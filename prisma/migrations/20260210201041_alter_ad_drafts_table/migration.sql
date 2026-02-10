-- DropIndex
DROP INDEX "ad_drafts_user_id_ad_type_key";

-- CreateIndex
CREATE INDEX "ad_drafts_user_id_idx" ON "ad_drafts"("user_id");
