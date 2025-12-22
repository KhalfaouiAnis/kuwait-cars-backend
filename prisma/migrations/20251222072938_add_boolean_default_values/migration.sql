-- AlterTable
ALTER TABLE "ads" ALTER COLUMN "contact_whatsapp" SET DEFAULT false,
ALTER COLUMN "receive_calls" SET DEFAULT false,
ALTER COLUMN "xcar_calls" SET DEFAULT false,
ALTER COLUMN "xcar_chat" SET DEFAULT false;

-- AlterTable
ALTER TABLE "otps" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "delivery_status" TEXT,
ADD COLUMN     "wamid" TEXT;
