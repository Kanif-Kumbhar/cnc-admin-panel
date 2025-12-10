import { NextRequest, NextResponse } from "next/server";
import { requireAuthAPI } from "@/lib/auth-helper";
import { AnalyticsService } from "@/lib/services/analytics-service";
import { db } from "@/lib/db";

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

		// If machineId provided, get OEE for that machine
		if (machineId) {
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
				totalDowntime: oeeData.downtimeHours,
				stopCount: oeeData.stopCount,
				goodParts: oeeData.totalGoodParts,
				rejectedParts: oeeData.totalRejectedParts,
			});
		}

		// Otherwise get aggregated data for all machines
		const machines = await db.machine.findMany({
			where: { isActive: true },
		});

		let totalOEE = 0;
		let totalAvailability = 0;
		let totalPerformance = 0;
		let totalQuality = 0;
		let totalDowntime = 0;
		let totalStops = 0;

		for (const machine of machines) {
			const oeeData = await AnalyticsService.calculateOEE(
				machine.id,
				startDate,
				endDate
			);
			totalOEE += oeeData.oee;
			totalAvailability += oeeData.availability;
			totalPerformance += oeeData.performance;
			totalQuality += oeeData.quality;
			totalDowntime += oeeData.downtimeHours;
			totalStops += oeeData.stopCount;
		}

		const machineCount = machines.length || 1;

		const productionSummary = await AnalyticsService.getProductionSummary(
			null,
			startDate,
			endDate
		);

		return NextResponse.json({
			oee: totalOEE / machineCount,
			availability: totalAvailability / machineCount,
			performance: totalPerformance / machineCount,
			quality: totalQuality / machineCount,
			totalDowntime,
			stopCount: totalStops,
			goodParts: productionSummary.goodParts,
			rejectedParts: productionSummary.rejectedParts,
		});
	} catch (error) {
		console.error("Error fetching KPI data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch KPI data" },
			{ status: 500 }
		);
	}
}