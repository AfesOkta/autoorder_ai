/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'PENDING');

-- CreateTable
CREATE TABLE "whatsapp_devices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "deviceNumber" TEXT NOT NULL,
    "fonnteToken" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_devices_tenantId_deviceNumber_key" ON "whatsapp_devices"("tenantId", "deviceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "whatsapp_devices" ADD CONSTRAINT "whatsapp_devices_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
