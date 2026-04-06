-- AlterTable
ALTER TABLE "ads" ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "expiry_notified" BOOLEAN;
