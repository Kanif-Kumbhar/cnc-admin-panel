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
		const machineId = searchParams.get("machineId");
		const startDate = new Date(searchParams.get("startDate") || "");
		const endDate = new Date(searchParams.get("endDate") || "");
		const limit = parseInt(searchParams.get("limit") || "10");

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

		const topReasons = await AnalyticsService.getTopStopReasons(
			machineId,
			startDate,
			endDate,
			limit
		);

		return NextResponse.json(topReasons);
	} catch (error) {
		console.error("Error fetching top stop reasons:", error);
		return NextResponse.json(
			{ error: "Failed to fetch top stop reasons" },
			{ status: 500 }
		);
	}
}