import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helper";

export async function POST(request: NextRequest) {
	try {
		await requireAuth(["ADMIN", "SUPERVISOR"]);

		const body = await request.json();
		const { items } = body as {
			items: Array<{ id: string; sortOrder: number }>;
		};

		await db.$transaction(
			items.map((item) =>
				db.stopReason.update({
					where: { id: item.id },
					data: { sortOrder: item.sortOrder },
				})
			)
		);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error reordering stop reasons:", error);
		return NextResponse.json(
			{ error: "Failed to reorder stop reasons" },
			{ status: 500 }
		);
	}
}