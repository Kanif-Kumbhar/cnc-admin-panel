"use client";

import { useState, useEffect } from "react";
import { Bell, CheckCheck, Trash2} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	status: string;
	createdAt: string;
	data: Record<string, unknown> | null;
}

interface NotificationListProps {
	onMarkAllRead?: () => void;
}

export function NotificationList({ onMarkAllRead }: NotificationListProps) {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchNotifications();
	}, []);

	const fetchNotifications = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("/api/notifications?limit=20");
			if (response.ok) {
				const data = await response.json();
				setNotifications(data);
			}
		} catch (error) {
			console.error("Failed to fetch notifications:", error);
			toast.error("Failed to load notifications");
		} finally {
			setIsLoading(false);
		}
	};

	const markAsRead = async (id: string) => {
		try {
			const response = await fetch(`/api/notifications/${id}/read`, {
				method: "PATCH",
			});

			if (response.ok) {
				setNotifications(
					notifications.map((n) => (n.id === id ? { ...n, status: "SENT" } : n))
				);
				onMarkAllRead?.();
			}
		} catch (error) {
			console.error("Failed to mark as read:", error);
		}
	};

	const markAllAsRead = async () => {
		try {
			const unreadIds = notifications
				.filter((n) => n.status === "PENDING")
				.map((n) => n.id);

			await Promise.all(
				unreadIds.map((id) =>
					fetch(`/api/notifications/${id}/read`, { method: "PATCH" })
				)
			);

			setNotifications(notifications.map((n) => ({ ...n, status: "SENT" })));
			onMarkAllRead?.();
			toast.success("All notifications marked as read");
		} catch (error) {
			console.error("Failed to mark all as read:", error);
			toast.error("Failed to mark all as read");
		}
	};

	const deleteNotification = async (id: string) => {
		try {
			// Optimistic update
			setNotifications(notifications.filter((n) => n.id !== id));

			const response = await fetch(`/api/notifications/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				// Rollback on error
				await fetchNotifications();
				toast.error("Failed to delete notification");
			}
		} catch (error) {
			console.error("Failed to delete notification:", error);
			await fetchNotifications();
			toast.error("Failed to delete notification");
		}
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "STOP_ALERT":
				return "🚨";
			case "TOOL_CHANGE_OVERRUN":
				return "⏱️";
			case "MACHINE_ERROR":
				return "⚠️";
			case "MAINTENANCE_DUE":
				return "🔧";
			case "JOB_COMPLETE":
				return "✅";
			default:
				return "🔔";
		}
	};

	if (isLoading) {
		return (
			<div className="p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="font-semibold text-lg">Notifications</h3>
				</div>
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="animate-pulse">
							<div className="h-16 bg-slate-200 rounded-lg" />
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-[500px]">
			{/* Header */}
			<div className="p-4 border-b">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-lg flex items-center gap-2">
						<Bell className="h-5 w-5" />
						Notifications
					</h3>
					{notifications.some((n) => n.status === "PENDING") && (
						<Button
							variant="ghost"
							size="sm"
							onClick={markAllAsRead}
							className="text-xs"
						>
							<CheckCheck className="h-4 w-4 mr-1" />
							Mark all read
						</Button>
					)}
				</div>
			</div>

			{/* Notification List */}
			<ScrollArea className="flex-1">
				{notifications.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-12 text-slate-500">
						<Bell className="h-12 w-12 mb-3 opacity-20" />
						<p className="text-sm">No notifications</p>
					</div>
				) : (
					<div className="p-2">
						{notifications.map((notification, index) => (
							<div key={notification.id}>
								<div
									className={cn(
										"p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer relative group",
										notification.status === "PENDING" &&
											"bg-blue-50 hover:bg-blue-100"
									)}
									onClick={() =>
										notification.status === "PENDING" &&
										markAsRead(notification.id)
									}
								>
									<div className="flex gap-3">
										<div className="text-2xl shrink-0">
											{getNotificationIcon(notification.type)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<h4 className="font-medium text-sm text-slate-900">
													{notification.title}
												</h4>
												{notification.status === "PENDING" && (
													<div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1" />
												)}
											</div>

											<p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
												{notification.message}
											</p>

											<p className="text-xs text-slate-400 mt-2">
												{formatDistanceToNow(new Date(notification.createdAt), {
													addSuffix: true,
												})}
											</p>
										</div>

										<Button
											variant="ghost"
											size="icon"
											className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
											onClick={(e) => {
												e.stopPropagation();
												deleteNotification(notification.id);
											}}
										>
											<Trash2 className="h-4 w-4 text-slate-400" />
										</Button>
									</div>
								</div>
								{index < notifications.length - 1 && (
									<Separator className="my-1" />
								)}
							</div>
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	);
}