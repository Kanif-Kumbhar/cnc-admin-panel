import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Starting database seed...\n");

    console.log("📝 Creating users...");

    const users = [
        {
            email: "admin@cnc.com",
            name: "Admin User",
            password: await bcrypt.hash("admin123", 10),
            role: "ADMIN" as const,
            phone: "+91 9876543210",
            isActive: true,
        },
        {
            email: "supervisor@cnc.com",
            name: "Supervisor John",
            password: await bcrypt.hash("supervisor123", 10),
            role: "SUPERVISOR" as const,
            phone: "+91 9876543211",
            isActive: true,
        },
        {
            email: "operator@cnc.com",
            name: "Operator Mike",
            password: await bcrypt.hash("operator123", 10),
            role: "OPERATOR" as const,
            phone: "+91 9876543212",
            isActive: true,
        },
        {
            email: "operator2@cnc.com",
            name: "Operator Sarah",
            password: await bcrypt.hash("operator123", 10),
            role: "OPERATOR" as const,
            phone: "+91 9876543213",
            isActive: true,
        },
    ];

    const createdUsers = [];
    for (const userData of users) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: {},
            create: userData,
        });
        createdUsers.push(user);
    }

    console.log(`✅ Created ${createdUsers.length} users`);

    console.log("\n🏭 Creating machines...");

    const machinesData = [
        {
            name: "CNC-001",
            model: "MTAB COMPACT MILL",
            controller: "Siemens 828D",
            ipAddress: "192.168.10.10",
            opcPort: 4840,
            location: "Shop Floor A - Section 1",
            status: "RUNNING" as const,
            serialNumber: "MTAB-2024-001",
            manufacturer: "MTAB Engineering",
            installDate: new Date("2024-01-15"),
            warrantyExpiry: new Date("2027-01-15"),
            lastMaintenance: new Date("2025-11-15"),
            totalRuntime: 8640000,
            totalCycles: 45230,
            totalDowntime: 432000,
            averageOEE: 85.5,
        },
        {
            name: "CNC-002",
            model: "MTAB COMPACT MILL",
            controller: "Siemens 828D",
            ipAddress: "192.168.10.11",
            opcPort: 4840,
            location: "Shop Floor A - Section 1",
            status: "IDLE" as const,
            serialNumber: "MTAB-2024-002",
            manufacturer: "MTAB Engineering",
            installDate: new Date("2024-01-15"),
            warrantyExpiry: new Date("2027-01-15"),
            lastMaintenance: new Date("2025-11-20"),
            totalRuntime: 8200000,
            totalCycles: 42100,
            totalDowntime: 520000,
            averageOEE: 82.3,
        },
        {
            name: "CNC-003",
            model: "MTAB COMPACT MILL",
            controller: "Siemens 828D",
            ipAddress: "192.168.10.12",
            opcPort: 4840,
            location: "Shop Floor B - Section 2",
            status: "MAINTENANCE" as const,
            serialNumber: "MTAB-2024-003",
            manufacturer: "MTAB Engineering",
            installDate: new Date("2024-02-10"),
            warrantyExpiry: new Date("2027-02-10"),
            lastMaintenance: new Date("2025-12-05"),
            totalRuntime: 7800000,
            totalCycles: 39500,
            totalDowntime: 680000,
            averageOEE: 78.9,
        },
        {
            name: "CNC-004",
            model: "MTAB COMPACT MILL",
            controller: "Siemens 828D",
            ipAddress: "192.168.10.13",
            opcPort: 4840,
            location: "Shop Floor B - Section 2",
            status: "ONLINE" as const,
            serialNumber: "MTAB-2024-004",
            manufacturer: "MTAB Engineering",
            installDate: new Date("2024-03-01"),
            warrantyExpiry: new Date("2027-03-01"),
            lastMaintenance: new Date("2025-11-10"),
            totalRuntime: 7200000,
            totalCycles: 38000,
            totalDowntime: 450000,
            averageOEE: 84.1,
        },
    ];

    const machines = [];
    for (const machineData of machinesData) {
        const machine = await prisma.machine.upsert({
            where: { name: machineData.name },
            update: {},
            create: machineData,
        });
        machines.push(machine);
    }

    console.log(`✅ Created ${machines.length} machines`);

    console.log("\n⚠️  Creating stop reasons...");

    const stopReasonsData = [
        { code: "R01", text: "Tool Change", category: "SETUP" as const, type: "AUTOMATIC" as const, duration: 180, icon: "tool", color: "#3b82f6" },
        { code: "R02", text: "Material Loading", category: "MATERIAL" as const, type: "MANUAL" as const, duration: null, icon: "package", color: "#f59e0b" },
        { code: "R03", text: "Material Shortage", category: "MATERIAL" as const, type: "MANUAL" as const, duration: null, icon: "alert-triangle", color: "#f59e0b" },
        { code: "R04", text: "Machine Breakdown", category: "MECHANICAL" as const, type: "AUTOMATIC" as const, duration: null, icon: "alert-circle", color: "#ef4444" },
        { code: "R05", text: "Coolant Issue", category: "MECHANICAL" as const, type: "MANUAL" as const, duration: null, icon: "droplet", color: "#ef4444" },
        { code: "R06", text: "Quality Check", category: "QUALITY" as const, type: "MANUAL" as const, duration: 300, icon: "check-circle", color: "#8b5cf6" },
        { code: "R07", text: "Rework Required", category: "QUALITY" as const, type: "MANUAL" as const, duration: null, icon: "refresh-cw", color: "#8b5cf6" },
        { code: "R08", text: "Emergency Stop", category: "SAFETY" as const, type: "AUTOMATIC" as const, duration: null, icon: "shield-alert", color: "#dc2626" },
        { code: "R09", text: "Safety Gate Open", category: "SAFETY" as const, type: "AUTOMATIC" as const, duration: null, icon: "shield-off", color: "#dc2626" },
        { code: "R10", text: "Planned Maintenance", category: "MAINTENANCE" as const, type: "MANUAL" as const, duration: null, icon: "wrench", color: "#ec4899" },
        { code: "R11", text: "Operator Break", category: "OPERATOR" as const, type: "MANUAL" as const, duration: 900, icon: "coffee", color: "#10b981" },
        { code: "R12", text: "Operator Training", category: "OPERATOR" as const, type: "MANUAL" as const, duration: null, icon: "book-open", color: "#10b981" },
        { code: "R13", text: "Job Setup", category: "SETUP" as const, type: "MANUAL" as const, duration: 600, icon: "settings", color: "#3b82f6" },
        { code: "R14", text: "Program Upload", category: "SETUP" as const, type: "MANUAL" as const, duration: 180, icon: "upload", color: "#3b82f6" },
        { code: "R15", text: "Power Failure", category: "OTHER" as const, type: "AUTOMATIC" as const, duration: null, icon: "zap-off", color: "#6b7280" },
        { code: "R16", text: "Miscellaneous", category: "OTHER" as const, type: "MANUAL" as const, duration: null, icon: "more-horizontal", color: "#6b7280" },
    ];

    const stopReasons = [];
    for (const [index, reason] of stopReasonsData.entries()) {
        const stopReason = await prisma.stopReason.upsert({
            where: { reasonCode: reason.code },
            update: {},
            create: {
                reasonCode: reason.code,
                reasonText: reason.text,
                category: reason.category,
                detectionType: reason.type,
                standardDuration: reason.duration,
                sortOrder: index + 1,
                icon: reason.icon,
                color: reason.color,
                description: `Standard stop reason for ${reason.text.toLowerCase()}`,
            },
        });
        stopReasons.push(stopReason);
    }

    console.log(`✅ Created ${stopReasons.length} stop reasons`);

    console.log("\n⚙️  Creating system settings...");

    const settings = [
        // GENERAL
        { key: "companyName", value: "MTAB Engineering Pvt Ltd", dataType: "STRING" as const, category: "GENERAL", description: "Company name displayed across the application", isPublic: true },
        { key: "timezone", value: "Asia/Kolkata", dataType: "STRING" as const, category: "GENERAL", description: "Default timezone for the system", isPublic: true },
        { key: "dateFormat", value: "DD/MM/YYYY", dataType: "STRING" as const, category: "GENERAL", description: "Date display format", isPublic: true },
        { key: "timeFormat", value: "24h", dataType: "STRING" as const, category: "GENERAL", description: "Time display format (12h or 24h)", isPublic: true },
        { key: "language", value: "en", dataType: "STRING" as const, category: "GENERAL", description: "System language", isPublic: true },
        
        // ALERTS
        { key: "alertDowntimeThreshold", value: "300", dataType: "NUMBER" as const, category: "ALERTS", description: "Alert when stop duration exceeds (seconds)", minValue: 60, maxValue: 7200 },
        { key: "alertCriticalDowntime", value: "900", dataType: "NUMBER" as const, category: "ALERTS", description: "Critical alert threshold (seconds)", minValue: 300, maxValue: 14400 },
        { key: "alertToolChangeOverrun", value: "180", dataType: "NUMBER" as const, category: "ALERTS", description: "Alert when tool change exceeds standard time (seconds)", minValue: 30, maxValue: 1800 },
        { key: "enableEmailAlerts", value: "true", dataType: "BOOLEAN" as const, category: "ALERTS", description: "Send email notifications" },
        { key: "enableTelegramAlerts", value: "false", dataType: "BOOLEAN" as const, category: "ALERTS", description: "Send Telegram notifications" },
        
        // DEFAULTS
        { key: "defaultReportPeriod", value: "7", dataType: "NUMBER" as const, category: "DEFAULTS", description: "Default report period in days", minValue: 1, maxValue: 365 },
        { key: "autoRefreshInterval", value: "30", dataType: "NUMBER" as const, category: "DEFAULTS", description: "Dashboard auto-refresh interval (seconds)", minValue: 10, maxValue: 300 },
        { key: "defaultPageSize", value: "50", dataType: "NUMBER" as const, category: "DEFAULTS", description: "Default pagination size", minValue: 10, maxValue: 200 },
        { key: "exportFormat", value: "xlsx", dataType: "STRING" as const, category: "DEFAULTS", description: "Default export format (csv or xlsx)" },
        
        // NETWORK
        { key: "opc_default_ip", value: "192.168.10.10", dataType: "STRING" as const, category: "NETWORK", description: "Default OPC UA IP Address", isPublic: false },
        { key: "opc_default_port", value: "4840", dataType: "NUMBER" as const, category: "NETWORK", description: "Default OPC UA Port", isPublic: false },
        { key: "polling_interval", value: "5000", dataType: "NUMBER" as const, category: "NETWORK", description: "Machine status polling interval (ms)", isPublic: false, minValue: 1000, maxValue: 30000 },
        
        // PRODUCTION
        { key: "tool_change_standard_time", value: "180", dataType: "NUMBER" as const, category: "PRODUCTION", description: "Standard tool change time (seconds)", isPublic: true, minValue: 60, maxValue: 600 },
        { key: "insert_time_8inch", value: "120", dataType: "NUMBER" as const, category: "PRODUCTION", description: 'Default insert time for 8" product (seconds)', isPublic: true, minValue: 30, maxValue: 300 },
        { key: "insert_time_10inch", value: "150", dataType: "NUMBER" as const, category: "PRODUCTION", description: 'Default insert time for 10" product (seconds)', isPublic: true, minValue: 30, maxValue: 300 },
        
        // SYSTEM
        { key: "app_version", value: "1.0.0", dataType: "STRING" as const, category: "SYSTEM", description: "Application version", isPublic: true },
        { key: "maintenanceMode", value: "false", dataType: "BOOLEAN" as const, category: "SYSTEM", description: "Enable maintenance mode" },
        { key: "dataRetentionDays", value: "365", dataType: "NUMBER" as const, category: "SYSTEM", description: "Days to retain historical data", minValue: 30, maxValue: 3650 },
        { key: "sessionTimeout", value: "3600", dataType: "NUMBER" as const, category: "SYSTEM", description: "User session timeout (seconds)", minValue: 900, maxValue: 86400 },
    ];

    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }

    console.log(`✅ Created ${settings.length} system settings`);

    console.log("\n⏰ Creating shifts...");

    const shifts = [
        { name: "Morning Shift", startTime: "06:00", endTime: "14:00", sortOrder: 1, color: "#3b82f6", isActive: true },
        { name: "Evening Shift", startTime: "14:00", endTime: "22:00", sortOrder: 2, color: "#f59e0b", isActive: true },
        { name: "Night Shift", startTime: "22:00", endTime: "06:00", sortOrder: 3, color: "#8b5cf6", isActive: true },
        { name: "General Shift", startTime: "09:00", endTime: "18:00", sortOrder: 4, color: "#10b981", isActive: false },
    ];

    for (const shift of shifts) {
        await prisma.shift.upsert({
            where: { name: shift.name },
            update: {},
            create: shift,
        });
    }

    console.log(`✅ Created ${shifts.length} shifts`);

    console.log("\n📋 Creating sample jobs...");

    const job1 = await prisma.job.create({
        data: {
            machineId: machines[0].id,
            productSize: "8",
            insertTime: 120,
            targetQuantity: 100,
            startTime: new Date(Date.now() - 7200000),
            cycleCount: 85,
            goodParts: 82,
            rejectedParts: 3,
            totalSpindleTime: 10200,
            actualCycleTime: 120.0,
            efficiency: 85.0,
        },
    });

    await prisma.job.create({
        data: {
            machineId: machines[1].id,
            productSize: "10",
            insertTime: 150,
            targetQuantity: 50,
            startTime: new Date(Date.now() - 3600000),
            endTime: new Date(Date.now() - 600000),
            cycleCount: 50,
            goodParts: 49,
            rejectedParts: 1,
            totalSpindleTime: 7500,
            actualCycleTime: 150.0,
            efficiency: 98.0,
            isCompleted: true,
        },
    });

    const job3 = await prisma.job.create({
        data: {
            machineId: machines[3].id,
            productSize: "8",
            insertTime: 120,
            targetQuantity: 200,
            startTime: new Date(Date.now() - 14400000),
            cycleCount: 145,
            goodParts: 140,
            rejectedParts: 5,
            totalSpindleTime: 17400,
            actualCycleTime: 120.0,
            efficiency: 72.5,
        },
    });

    console.log("✅ Created 3 sample jobs");

    console.log("\n⏸️  Creating sample stops...");

    const toolChangeReason = stopReasons.find((r) => r.reasonCode === "R01");
    const breakdownReason = stopReasons.find((r) => r.reasonCode === "R04");
    const operatorBreakReason = stopReasons.find((r) => r.reasonCode === "R11");
    const operator = createdUsers.find((u) => u.role === "OPERATOR");
    const supervisor = createdUsers.find((u) => u.role === "SUPERVISOR");

    if (toolChangeReason && operator && breakdownReason && operatorBreakReason && supervisor) {
        const stops = [
            {
                jobId: job1.id,
                machineId: machines[0].id,
                reasonId: toolChangeReason.id,
                operatorId: operator.id,
                startTime: new Date(Date.now() - 5400000),
                endTime: new Date(Date.now() - 5220000),
                duration: 180,
                isToolChange: true,
                actualToolChangeTime: 180,
                isResolved: true,
                resolvedAt: new Date(Date.now() - 5220000),
                resolvedById: operator.id,
                notes: "Tool change completed as scheduled",
            },
            {
                jobId: job1.id,
                machineId: machines[0].id,
                reasonId: operatorBreakReason.id,
                operatorId: operator.id,
                startTime: new Date(Date.now() - 3600000),
                endTime: new Date(Date.now() - 2700000),
                duration: 900,
                isResolved: true,
                resolvedAt: new Date(Date.now() - 2700000),
                resolvedById: operator.id,
                notes: "Lunch break",
            },
            {
                jobId: job3.id,
                machineId: machines[3].id,
                reasonId: breakdownReason.id,
                operatorId: operator.id,
                startTime: new Date(Date.now() - 7200000),
                endTime: new Date(Date.now() - 5400000),
                duration: 1800,
                isResolved: true,
                resolvedAt: new Date(Date.now() - 5400000),
                resolvedById: supervisor.id,
                notes: "Spindle motor issue - replaced bearing",
                resolutionNote: "Bearing replaced, machine tested and approved",
            },
        ];

        for (const stopData of stops) {
            await prisma.stop.create({ data: stopData });
        }

        console.log(`✅ Created ${stops.length} sample stops`);
    }

    console.log("\n📊 Creating sample events...");

    const events = [
        { machineId: machines[0].id, eventType: "MACHINE_START" as const, severity: "INFO" as const, message: "Machine started successfully", timestamp: new Date(Date.now() - 7200000) },
        { machineId: machines[0].id, eventType: "JOB_START" as const, severity: "INFO" as const, message: "Job started", payload: { jobId: job1.id }, timestamp: new Date(Date.now() - 7200000) },
        { machineId: machines[0].id, eventType: "TOOL_CHANGE" as const, severity: "INFO" as const, message: "Tool change initiated", timestamp: new Date(Date.now() - 5400000) },
        { machineId: machines[3].id, eventType: "ALARM" as const, severity: "ERROR" as const, message: "Spindle motor overload detected", timestamp: new Date(Date.now() - 7200000), isAcknowledged: true, acknowledgedBy: supervisor?.id, acknowledgedAt: new Date(Date.now() - 7100000) },
    ];

    for (const eventData of events) {
        await prisma.event.create({ data: eventData });
    }

    console.log(`✅ Created ${events.length} sample events`);

    console.log("\n🔧 Creating sample maintenance logs...");

    await prisma.maintenanceLog.create({
        data: {
            machineId: machines[2].id,
            type: "PREVENTIVE",
            status: "IN_PROGRESS",
            scheduledDate: new Date(),
            description: "Quarterly preventive maintenance",
            performedBy: "Maintenance Team A",
            findings: "Lubrication of moving parts, coolant system check, electrical inspection ongoing",
            cost: 5000.0,
            partsReplaced: {
                parts: [
                    { part: "Oil Filter", quantity: 2 },
                    { part: "Coolant", quantity: 20, unit: "liters" },
                ],
            },
        },
    });

    console.log("✅ Created 1 maintenance log");

    console.log("\n📝 Creating sample audit logs...");

    const admin = createdUsers.find((u) => u.role === "ADMIN");

    if (admin) {
        await prisma.auditLog.create({
            data: {
                userId: admin.id,
                action: "LOGIN",
                entityType: "User",
                entityId: admin.id,
                ipAddress: "192.168.1.100",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                timestamp: new Date(Date.now() - 3600000),
            },
        });
    }

    console.log("✅ Created sample audit logs");

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log(`   Users:          ${createdUsers.length}`);
    console.log(`   Machines:       ${machines.length}`);
    console.log(`   Stop Reasons:   ${stopReasons.length}`);
    console.log(`   Settings:       ${settings.length}`);
    console.log(`   Shifts:         ${shifts.length}`);
    console.log("   Jobs:           3");
    console.log("   Stops:          3");
    console.log("   Events:         4");
    console.log("   Maintenance:    1");

    console.log("\n🔐 Login Credentials:");
    console.log("   ┌───────────────────────────────────────────────────┐");
    console.log("   │ Admin:      admin@cnc.com / admin123              │");
    console.log("   │ Supervisor: supervisor@cnc.com / supervisor123    │");
    console.log("   │ Operator:   operator@cnc.com / operator123        │");
    console.log("   └───────────────────────────────────────────────────┘");

    console.log("\n🖥️  Next Steps:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Visit: http://localhost:3000/login");
    console.log("   3. Login with admin credentials");
    console.log("   4. Visit: http://localhost:3000/settings\n");
}

main()
    .catch((e) => {
        console.error("\n❌ Seeding failed with error:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });