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
				key: "defaultReportPeriod",
				value: body.defaultReportPeriod,
				dataType: "NUMBER" as const,
			},
			{
				key: "autoRefreshInterval",
				value: body.autoRefreshInterval,
				dataType: "NUMBER" as const,
			},
			{
				key: "defaultPageSize",
				value: body.defaultPageSize,
				dataType: "NUMBER" as const,
			},
			{
				key: "exportFormat",
				value: body.exportFormat,
				dataType: "STRING" as const,
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
					category: "DEFAULTS",
					updatedBy: auth.session!.user.id,
				},
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating default settings:", error);
		return NextResponse.json(
			{ error: "Failed to update settings" },
			{ status: 500 }
		);
	}
}