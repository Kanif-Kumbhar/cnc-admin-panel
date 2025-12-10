import { NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-helper";
import { AnalyticsService } from "@/lib/services/analytics-service";

export async function GET(request: NextRequest) {
	try {
		const auth = await requireAuthAPI();
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const { searchParams } = new URL(request.url);
		const startDate = new Date(searchParams.get("startDate") || "");
		const endDate = new Date(searchParams.get("endDate") || "");

		if (
			!startDate ||
			!endDate ||
			isNaN(startDate.getTime()) ||
			isNaN(endDate.getTime())
		) {
			return NextResponse.json(
				{ error: "Valid startDate and endDate are required" },
				{ status: 400 }
			);
		}

		const utilization = await AnalyticsService.getMachineUtilization(
			startDate,
			endDate
		);

		return NextResponse.json(utilization);
	} catch (error) {
		console.error("Error fetching machine utilization:", error);
		return NextResponse.json(
			{ error: "Failed to fetch machine utilization" },
			{ status: 500 }
		);
	}
}