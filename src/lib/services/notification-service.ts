import { db } from "@/lib/db";
import {
	NotificationType,
	NotificationChannel,
	Notification,
	Prisma,
} from "@prisma/client";

interface CreateNotificationParams {
	type: NotificationType;
	channel: NotificationChannel;
	recipient: string;
	title: string;
	message: string;
	data?: Prisma.InputJsonValue;
}

export class NotificationService {
	// Create a notification
	static async create(params: CreateNotificationParams) {
		return await db.notification.create({
			data: {
				type: params.type,
				channel: params.channel,
				recipient: params.recipient,
				title: params.title,
				message: params.message,
				data: params.data ?? Prisma.JsonNull,
				status: "PENDING",
			},
		});
	}

	// Send pending notifications
	static async processPending() {
		const pending = await db.notification.findMany({
			where: {
				status: "PENDING",
				retryCount: { lt: 3 }, // Max 3 retries
			},
			take: 50, // Process in batches
		});

		for (const notification of pending) {
			try {
				switch (notification.channel) {
					case "EMAIL":
						await this.sendEmail(notification);
						break;
					case "TELEGRAM":
						await this.sendTelegram(notification);
						break;
					case "IN_APP":
						// Already in database, just mark as sent
						await this.markAsSent(notification.id);
						break;
				}
			} catch (error) {
				await this.markAsFailed(notification.id, String(error));
			}
		}
	}

	// Send email notification
	private static async sendEmail(notification: Notification) {
		// TODO: Implement email sending (Resend, SendGrid, etc.)
		console.log("📧 Sending email:", notification.title);

		// Simulate email sending
		await new Promise((resolve) => setTimeout(resolve, 100));

		await this.markAsSent(notification.id);
	}

	// Send Telegram notification
	private static async sendTelegram(notification: Notification) {
		const botToken = process.env.TELEGRAM_BOT_TOKEN;
		const chatId = notification.recipient;

		if (!botToken) {
			throw new Error("Telegram bot token not configured");
		}

		const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

		const response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				chat_id: chatId,
				text: `🔔 *${notification.title}*\n\n${notification.message}`,
				parse_mode: "Markdown",
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to send Telegram message");
		}

		await this.markAsSent(notification.id);
	}

	// Mark notification as sent
	private static async markAsSent(id: string) {
		await db.notification.update({
			where: { id },
			data: {
				status: "SENT",
				sentAt: new Date(),
			},
		});
	}

	// Mark notification as failed
	private static async markAsFailed(id: string, error: string) {
		await db.notification.update({
			where: { id },
			data: {
				status: "FAILED",
				failedAt: new Date(),
				errorReason: error,
				retryCount: { increment: 1 },
			},
		});
	}

	// Get user notifications (in-app)
	static async getUserNotifications(userId: string, limit = 20) {
		return await db.notification.findMany({
			where: {
				recipient: userId,
				channel: "IN_APP",
			},
			orderBy: { createdAt: "desc" },
			take: limit,
		});
	}

	// Mark notification as read
	static async markAsRead(id: string) {
		await db.notification.update({
			where: { id },
			data: { status: "SENT" },
		});
	}

	// Get unread count
	static async getUnreadCount(userId: string) {
		return await db.notification.count({
			where: {
				recipient: userId,
				channel: "IN_APP",
				status: "PENDING",
			},
		});
	}
}