-- CreateEnum
CREATE TYPE "NotifiStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'READ');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "expo_push_token" TEXT,
ADD COLUMN     "unread_count" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "status" "NotifiStatus" NOT NULL DEFAULT 'QUEUED',
    "ticket_id" TEXT,
    "receipt_id" TEXT,
    "delivery_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_ticket_id_key" ON "Notification"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_receipt_id_key" ON "Notification"("receipt_id");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
