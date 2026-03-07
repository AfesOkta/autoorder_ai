/*
  Warnings:

  - A unique constraint covering the columns `[superadminKey]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SUPERADMIN';
ALTER TYPE "UserRole" ADD VALUE 'TENANT';

-- DropIndex
DROP INDEX "users_tenantId_email_key";

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "subscriptionId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "superadminKey" TEXT,
ALTER COLUMN "tenantId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "features" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_name_key" ON "subscriptions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_superadminKey_key" ON "users"("superadminKey");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
