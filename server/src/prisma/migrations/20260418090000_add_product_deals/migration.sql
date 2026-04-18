-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('DAILY', 'WEEKLY', 'CLEARANCE', 'CEREMONY');

-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "dealType" "DealType",
ADD COLUMN "isDealActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dealStartAt" TIMESTAMP(3),
ADD COLUMN "dealEndAt" TIMESTAMP(3);
