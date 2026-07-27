-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "refreshTokenHashes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challans" (
    "id" TEXT NOT NULL,
    "challanNumber" TEXT NOT NULL,
    "challanSequence" INTEGER NOT NULL,
    "truckNumber" TEXT NOT NULL,
    "placeOfDelivery" TEXT NOT NULL,
    "driverName" TEXT,
    "challanDate" TIMESTAMP(3) NOT NULL,
    "challanTime" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedReason" TEXT,
    "deletedBy" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT,
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "lastPrintedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challan_counters" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'challan_sequence',
    "sequence" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "challan_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'app_settings',
    "companyName" TEXT NOT NULL DEFAULT 'Ash Transportation',
    "companyAddress" TEXT NOT NULL DEFAULT '',
    "companyPhone" TEXT NOT NULL DEFAULT '',
    "copiesPerPrint" INTEGER NOT NULL DEFAULT 4,
    "printerType" TEXT NOT NULL DEFAULT 'ESCPOS',
    "printerName" TEXT NOT NULL DEFAULT '',
    "printerWidthMm" INTEGER NOT NULL DEFAULT 80,
    "printerCalibration" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "performedBy" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "reason" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "challans_challanNumber_key" ON "challans"("challanNumber");

-- CreateIndex
CREATE INDEX "challans_truckNumber_idx" ON "challans"("truckNumber");

-- CreateIndex
CREATE INDEX "challans_placeOfDelivery_idx" ON "challans"("placeOfDelivery");

-- CreateIndex
CREATE INDEX "challans_challanDate_idx" ON "challans"("challanDate");

-- CreateIndex
CREATE INDEX "challans_isDeleted_idx" ON "challans"("isDeleted");

-- CreateIndex
CREATE INDEX "challans_createdAt_idx" ON "challans"("createdAt");

-- CreateIndex
CREATE INDEX "challans_updatedAt_idx" ON "challans"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "challan_counters_key_key" ON "challan_counters"("key");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_performedBy_idx" ON "audit_logs"("performedBy");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "challans" ADD CONSTRAINT "challans_deletedBy_fkey" FOREIGN KEY ("deletedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challans" ADD CONSTRAINT "challans_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challans" ADD CONSTRAINT "challans_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_performedBy_fkey" FOREIGN KEY ("performedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
