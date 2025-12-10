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

		if (!machineId) {
			return NextResponse.json(
				{ error: "machineId is required" },
				{ status: 400 }
			);
		}

		const oeeData = await AnalyticsService.calculateOEE(
			machineId,
			startDate,
			endDate
		);

		return NextResponse.json({
			oee: oeeData.oee,
			availability: oeeData.availability,
			performance: oeeData.performance,
			quality: oeeData.quality,
		});
	} catch (error) {
		console.error("Error fetching OEE data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch OEE data" },
			{ status: 500 }
		);
	}
}