import { db } from "@/lib/db";
import { NotificationService } from "./notification-service";
import { Stop, Machine, StopReason, User } from "@prisma/client";

type StopWithRelations = Stop & {
	machine: Machine;
	reason: StopReason;
	operator: User | null;
};

interface AlertSettings {
	alertDowntimeThreshold: number;
	alertCriticalDowntime: number;
	alertToolChangeOverrun: number;
	enableEmailAlerts: boolean;
	enableTelegramAlerts: boolean;
}

export class AlertMonitor {
	// Check for downtime alerts
	static async checkDowntimeAlerts() {
		const settings = await this.getAlertSettings();

		if (!settings.enableEmailAlerts && !settings.enableTelegramAlerts) {
			return; // Alerts disabled
		}

		const activeStops = await db.stop.findMany({
			where: {
				endTime: null,
				isResolved: false,
			},
			include: {
				machine: true,
				reason: true,
				operator: true,
			},
		});

		for (const stop of activeStops) {
			const duration = Math.floor(
				(Date.now() - stop.startTime.getTime()) / 1000
			);

			if (duration >= settings.alertCriticalDowntime) {
				await this.sendDowntimeAlert(stop, "CRITICAL", settings);
			} else if (duration >= settings.alertDowntimeThreshold) {
				await this.sendDowntimeAlert(stop, "WARNING", settings);
			}
		}
	}

	// Check for tool change overruns
	static async checkToolChangeOverruns() {
		const settings = await this.getAlertSettings();

		const recentToolChanges = await db.stop.findMany({
			where: {
				isToolChange: true,
				endTime: { not: null },
				createdAt: { gte: new Date(Date.now() - 3600000) },
			},
			include: {
				machine: true,
				reason: true,
			},
		});

		for (const stop of recentToolChanges) {
			if (stop.duration && stop.actualToolChangeTime) {
				const overrun =
					stop.actualToolChangeTime - (stop.reason.standardDuration || 180);

				if (overrun > settings.alertToolChangeOverrun) {
					await this.sendToolChangeAlert(stop, overrun);
				}
			}
		}
	}

	// Send downtime alert
	private static async sendDowntimeAlert(
		stop: StopWithRelations,
		severity: string,
		settings: AlertSettings
	) {
		const duration = Math.floor(
			(Date.now() - stop.startTime.getTime()) / 60000
		);

		const title = `${
			severity === "CRITICAL" ? "🚨 CRITICAL" : "⚠️ WARNING"
		} Machine Downtime`;
		const message = `Machine: ${stop.machine.name}\nReason: ${
			stop.reason.reasonText
		}\nDuration: ${duration} minutes\nOperator: ${
			stop.operator?.name || "Unknown"
		}`;

		const recipients = await this.getAlertRecipients();

		for (const user of recipients) {
			await NotificationService.create({
				type: "STOP_ALERT",
				channel: "IN_APP",
				recipient: user.id,
				title,
				message,
				data: { stopId: stop.id, machineId: stop.machine.id },
			});

			if (settings.enableEmailAlerts && user.email) {
				await NotificationService.create({
					type: "STOP_ALERT",
					channel: "EMAIL",
					recipient: user.email,
					title,
					message,
				});
			}

			if (settings.enableTelegramAlerts && user.telegramId) {
				await NotificationService.create({
					type: "STOP_ALERT",
					channel: "TELEGRAM",
					recipient: user.telegramId,
					title,
					message,
				});
			}
		}
	}

	// Send tool change overrun alert
	private static async sendToolChangeAlert(
		stop: Stop & { machine: Machine; reason: StopReason },
		overrun: number
	) {
		const title = "⏱️ Tool Change Overrun";
		const message = `Machine: ${stop.machine.name}\nExpected: ${stop.reason.standardDuration}s\nActual: ${stop.actualToolChangeTime}s\nOverrun: ${overrun}s`;

		const recipients = await this.getAlertRecipients();

		for (const user of recipients) {
			await NotificationService.create({
				type: "TOOL_CHANGE_OVERRUN",
				channel: "IN_APP",
				recipient: user.id,
				title,
				message,
				data: { stopId: stop.id, machineId: stop.machine.id },
			});
		}
	}

	// Get alert recipients
	private static async getAlertRecipients() {
		return await db.user.findMany({
			where: {
				role: { in: ["ADMIN", "SUPERVISOR"] },
				isActive: true,
			},
		});
	}

	// Get alert settings
	private static async getAlertSettings(): Promise<AlertSettings> {
		const settings = await db.setting.findMany({
			where: { category: "ALERTS" },
		});

		return {
			alertDowntimeThreshold: parseInt(
				settings.find((s) => s.key === "alertDowntimeThreshold")?.value || "300"
			),
			alertCriticalDowntime: parseInt(
				settings.find((s) => s.key === "alertCriticalDowntime")?.value || "900"
			),
			alertToolChangeOverrun: parseInt(
				settings.find((s) => s.key === "alertToolChangeOverrun")?.value || "180"
			),
			enableEmailAlerts:
				settings.find((s) => s.key === "enableEmailAlerts")?.value === "true",
			enableTelegramAlerts:
				settings.find((s) => s.key === "enableTelegramAlerts")?.value ===
				"true",
		};
	}
}