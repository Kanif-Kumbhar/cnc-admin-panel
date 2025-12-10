import { NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-helper";
import { NotificationService } from "@/lib/services/notification-service";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await requireAuthAPI();
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const { id } = await params;
		await NotificationService.markAsRead(id);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error marking as read:", error);
		return NextResponse.json(
			{ error: "Failed to mark as read" },
			{ status: 500 }
		);
	}
}