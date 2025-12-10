"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationList } from "./NotificationList";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
	const [open, setOpen] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		const fetchUnreadCount = async () => {
			try {
				const response = await fetch("/api/notifications/unread-count");
				if (response.ok) {
					const data = await response.json();
					setUnreadCount(data.count);
				}
			} catch (error) {
				console.error("Failed to fetch unread count:", error);
			}
		};

		// Initial fetch
		void fetchUnreadCount();

		// Poll every 30 seconds
		const interval = setInterval(fetchUnreadCount, 30000);

		return () => clearInterval(interval);
	}, []);

	const handleMarkAllRead = () => {
		setUnreadCount(0);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
						>
							{unreadCount > 9 ? "9+" : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96 p-0" align="end">
				<NotificationList onMarkAllRead={handleMarkAllRead} />
			</PopoverContent>
		</Popover>
	);
}