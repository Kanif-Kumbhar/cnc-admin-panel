-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'OPERATOR');

-- CreateEnum
CREATE TYPE "MachineStatus" AS ENUM ('ONLINE', 'OFFLINE', 'RUNNING', 'IDLE', 'ERROR', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "StopCategory" AS ENUM ('SAFETY', 'MECHANICAL', 'MATERIAL', 'QUALITY', 'SETUP', 'MAINTENANCE', 'OPERATOR', 'OTHER');

-- CreateEnum
CREATE TYPE "DetectionType" AS ENUM ('AUTOMATIC', 'MANUAL');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('MACHINE_START', 'MACHINE_STOP', 'JOB_START', 'JOB_END', 'TOOL_CHANGE', 'ALARM', 'CYCLE_COMPLETE', 'CONNECTION_LOST', 'CONNECTION_RESTORED', 'OPERATOR_LOGIN', 'OPERATOR_LOGOUT', 'SYSTEM_ERROR', 'MAINTENANCE_START', 'MAINTENANCE_END');

-- CreateEnum
CREATE TYPE "EventSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SettingDataType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('STOP_ALERT', 'TOOL_CHANGE_OVERRUN', 'MACHINE_ERROR', 'MAINTENANCE_DUE', 'JOB_COMPLETE', 'DAILY_REPORT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'TELEGRAM', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "phone" TEXT,
    "telegramId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "machines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "controller" TEXT NOT NULL,
    "ipAddress" TEXT,
    "opcPort" INTEGER DEFAULT 4840,
    "location" TEXT,
    "status" "MachineStatus" NOT NULL DEFAULT 'OFFLINE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "serialNumber" TEXT,
    "manufacturer" TEXT,
    "installDate" TIMESTAMP(3),
    "warrantyExpiry" TIMESTAMP(3),
    "lastMaintenance" TIMESTAMP(3),
    "totalRuntime" INTEGER NOT NULL DEFAULT 0,
    "totalCycles" INTEGER NOT NULL DEFAULT 0,
    "totalDowntime" INTEGER NOT NULL DEFAULT 0,
    "averageOEE" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "jobNumber" TEXT,
    "productSize" TEXT NOT NULL,
    "insertTime" INTEGER NOT NULL,
    "targetQuantity" INTEGER,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "totalSpindleTime" INTEGER,
    "cycleCount" INTEGER NOT NULL DEFAULT 0,
    "goodParts" INTEGER NOT NULL DEFAULT 0,
    "rejectedParts" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "actualCycleTime" DOUBLE PRECISION,
    "efficiency" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stop_reasons" (
    "id" TEXT NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "reasonText" TEXT NOT NULL,
    "category" "StopCategory" NOT NULL,
    "detectionType" "DetectionType" NOT NULL,
    "standardDuration" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "stop_reasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stops" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "reasonId" TEXT NOT NULL,
    "operatorId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "notes" TEXT,
    "isToolChange" BOOLEAN NOT NULL DEFAULT false,
    "actualToolChangeTime" INTEGER,
    "overrunFlag" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "severity" "EventSeverity" NOT NULL DEFAULT 'INFO',
    "payload" JSONB,
    "message" TEXT,
    "isAcknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_logs" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL,
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "duration" INTEGER,
    "performedBy" TEXT,
    "description" TEXT NOT NULL,
    "findings" TEXT,
    "cost" DOUBLE PRECISION,
    "partsReplaced" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" "SettingDataType" NOT NULL DEFAULT 'STRING',
    "description" TEXT,
    "category" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "pattern" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cache" (
    "id" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "report_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "errorReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE INDEX "users_telegramId_idx" ON "users"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "machines_name_key" ON "machines"("name");

-- CreateIndex
CREATE UNIQUE INDEX "machines_ipAddress_key" ON "machines"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "machines_serialNumber_key" ON "machines"("serialNumber");

-- CreateIndex
CREATE INDEX "machines_status_isActive_idx" ON "machines"("status", "isActive");

-- CreateIndex
CREATE INDEX "machines_location_idx" ON "machines"("location");

-- CreateIndex
CREATE INDEX "machines_ipAddress_idx" ON "machines"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_jobNumber_key" ON "jobs"("jobNumber");

-- CreateIndex
CREATE INDEX "jobs_machineId_isCompleted_idx" ON "jobs"("machineId", "isCompleted");

-- CreateIndex
CREATE INDEX "jobs_startTime_idx" ON "jobs"("startTime" DESC);

-- CreateIndex
CREATE INDEX "jobs_jobNumber_idx" ON "jobs"("jobNumber");

-- CreateIndex
CREATE UNIQUE INDEX "stop_reasons_reasonCode_key" ON "stop_reasons"("reasonCode");

-- CreateIndex
CREATE INDEX "stop_reasons_category_isActive_idx" ON "stop_reasons"("category", "isActive");

-- CreateIndex
CREATE INDEX "stop_reasons_sortOrder_idx" ON "stop_reasons"("sortOrder");

-- CreateIndex
CREATE INDEX "stops_machineId_startTime_idx" ON "stops"("machineId", "startTime" DESC);

-- CreateIndex
CREATE INDEX "stops_reasonId_idx" ON "stops"("reasonId");

-- CreateIndex
CREATE INDEX "stops_jobId_idx" ON "stops"("jobId");

-- CreateIndex
CREATE INDEX "stops_isResolved_startTime_idx" ON "stops"("isResolved", "startTime");

-- CreateIndex
CREATE INDEX "stops_startTime_idx" ON "stops"("startTime" DESC);

-- CreateIndex
CREATE INDEX "events_machineId_timestamp_idx" ON "events"("machineId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "events_eventType_severity_idx" ON "events"("eventType", "severity");

-- CreateIndex
CREATE INDEX "events_severity_isAcknowledged_idx" ON "events"("severity", "isAcknowledged");

-- CreateIndex
CREATE INDEX "events_timestamp_idx" ON "events"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "maintenance_logs_machineId_scheduledDate_idx" ON "maintenance_logs"("machineId", "scheduledDate");

-- CreateIndex
CREATE INDEX "maintenance_logs_status_idx" ON "maintenance_logs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX "settings_category_idx" ON "settings"("category");

-- CreateIndex
CREATE INDEX "settings_isPublic_idx" ON "settings"("isPublic");

-- CreateIndex
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "report_cache_reportType_isValid_idx" ON "report_cache"("reportType", "isValid");

-- CreateIndex
CREATE INDEX "report_cache_expiresAt_idx" ON "report_cache"("expiresAt");

-- CreateIndex
CREATE INDEX "notifications_status_createdAt_idx" ON "notifications"("status", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_reasonId_fkey" FOREIGN KEY ("reasonId") REFERENCES "stop_reasons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stops" ADD CONSTRAINT "stops_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_user_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_created_by_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
