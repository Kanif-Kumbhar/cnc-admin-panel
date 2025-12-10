import { NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-helper";
import { NotificationService } from "@/lib/services/notification-service";

export async function GET(request: NextRequest) {
	try {
		const auth = await requireAuthAPI();
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "20");

		const notifications = await NotificationService.getUserNotifications(
			auth.session!.user.id,
			limit
		);

		return NextResponse.json(notifications);
	} catch (error) {
		console.error("Error fetching notifications:", error);
		return NextResponse.json(
			{ error: "Failed to fetch notifications" },
			{ status: 500 }
		);
	}
}