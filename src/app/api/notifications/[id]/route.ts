import { NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-helper";
import { db } from "@/lib/db";

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await requireAuthAPI();
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const { id } = await params;

		await db.notification.deleteMany({
			where: {
				id,
				recipient: auth.session!.user.id,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting notification:", error);
		return NextResponse.json(
			{ error: "Failed to delete notification" },
			{ status: 500 }
		);
	}
}