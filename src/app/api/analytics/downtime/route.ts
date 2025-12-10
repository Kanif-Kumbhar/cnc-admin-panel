import { NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-helper";
import { AnalyticsService } from "@/lib/services/analytics-service";

interface CategoryBreakdown {
	count: number;
	totalDuration: number;
	reasons: Array<{
		reasonId: string;
		reasonText: string;
		count: number;
		totalDuration: number;
	}>;
}

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

		const breakdown = await AnalyticsService.getDowntimeByCategory(
			machineId,
			startDate,
			endDate
		);

		const totalDuration = Object.values(breakdown).reduce(
			(sum, cat: CategoryBreakdown) => sum + cat.totalDuration,
			0
		);

		const result = Object.entries(breakdown).map(
			([category, data]: [string, CategoryBreakdown]) => ({
				category,
				count: data.count,
				totalDuration: data.totalDuration,
				percentage:
					totalDuration > 0 ? (data.totalDuration / totalDuration) * 100 : 0,
			})
		);

		result.sort((a, b) => b.totalDuration - a.totalDuration);

		return NextResponse.json(result);
	} catch (error) {
		console.error("Error fetching downtime data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch downtime data" },
			{ status: 500 }
		);
	}
}