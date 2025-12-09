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

		const updates = [
			{
				key: "alertDowntimeThreshold",
				value: body.alertDowntimeThreshold,
				dataType: "NUMBER" as const,
			},
			{
				key: "alertCriticalDowntime",
				value: body.alertCriticalDowntime,
				dataType: "NUMBER" as const,
			},
			{
				key: "alertToolChangeOverrun",
				value: body.alertToolChangeOverrun,
				dataType: "NUMBER" as const,
			},
			{
				key: "enableEmailAlerts",
				value: String(body.enableEmailAlerts),
				dataType: "BOOLEAN" as const,
			},
			{
				key: "enableTelegramAlerts",
				value: String(body.enableTelegramAlerts),
				dataType: "BOOLEAN" as const,
			},
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
					dataType: update.dataType,
					category: "ALERTS",
					updatedBy: auth.session!.user.id,
				},
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating alert settings:", error);
		return NextResponse.json(
			{ error: "Failed to update settings" },
			{ status: 500 }
		);
	}
}