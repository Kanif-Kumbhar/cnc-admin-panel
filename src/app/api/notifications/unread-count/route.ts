import { NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-helper";
import { NotificationService } from "@/lib/services/notification-service";

export async function GET() {
	try {
		const auth = await requireAuthAPI();
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const count = await NotificationService.getUnreadCount(
			auth.session!.user.id
		);

		return NextResponse.json({ count });
	} catch (error) {
		console.error("Error fetching unread count:", error);
		return NextResponse.json(
			{ error: "Failed to fetch count" },
			{ status: 500 }
		);
	}
}