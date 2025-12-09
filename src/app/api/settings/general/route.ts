import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuthAPI } from "@/lib/auth-helper";

export async function PUT(request: NextRequest) {
	try {
		const auth = await requireAuthAPI(["ADMIN"]);
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const body = await request.json();
		const { companyName, timezone, dateFormat, timeFormat, language } = body;

		const updates = [
			{ key: "companyName", value: companyName },
			{ key: "timezone", value: timezone },
			{ key: "dateFormat", value: dateFormat },
			{ key: "timeFormat", value: timeFormat },
			{ key: "language", value: language },
		];

		for (const update of updates) {
			await db.setting.upsert({
				where: { key: update.key },
				update: {
					value: update.value,
					updatedBy: auth.session!.user.id,
				},
				create: {
					key: update.key,
					value: update.value,
					dataType: "STRING",
					category: "GENERAL",
					isPublic: true,
					updatedBy: auth.session!.user.id,
				},
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating general settings:", error);
		return NextResponse.json(
			{ error: "Failed to update settings" },
			{ status: 500 }
		);
	}
}