import { db } from "@/lib/db";
import { Prisma, StopCategory } from "@prisma/client";

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

interface ReasonSummary {
	reasonId: string;
	reasonCode: string;
	reasonText: string;
	category: StopCategory;
	count: number;
	totalDuration: number;
}

export class AnalyticsService {
	// Calculate OEE for a machine within date range
	static async calculateOEE(machineId: string, startDate: Date, endDate: Date) {
		const stops = await db.stop.findMany({
			where: {
				machineId,
				startTime: { gte: startDate, lte: endDate },
			},
			include: {
				reason: true,
			},
		});

		const jobs = await db.job.findMany({
			where: {
				machineId,
				startTime: { gte: startDate, lte: endDate },
			},
		});

		// Calculate total time
		const totalTime = endDate.getTime() - startDate.getTime();
		const totalHours = totalTime / (1000 * 60 * 60);

		// Calculate downtime (in seconds)
		const totalDowntime = stops.reduce(
			(sum, stop) => sum + (stop.duration || 0),
			0
		);
		const downtimeHours = totalDowntime / 3600;

		// Calculate planned production time
		const plannedProductionTime = totalHours - downtimeHours;

		// For now, consider SETUP and MAINTENANCE as planned
		const plannedCategories: StopCategory[] = ["SETUP", "MAINTENANCE"];
		const unplannedStops = stops.filter(
			(s) => !plannedCategories.includes(s.reason.category)
		);
		const unplannedDowntime = unplannedStops.reduce(
			(sum, stop) => sum + (stop.duration || 0),
			0
		);
		const unplannedDowntimeHours = unplannedDowntime / 3600;

		// OEE Components - Availability
		const availability =
			plannedProductionTime > 0
				? ((plannedProductionTime - unplannedDowntimeHours) /
						plannedProductionTime) *
				  100
				: 0;

		// Calculate performance using actualCycleTime
		const totalGoodParts = jobs.reduce(
			(sum, job) => sum + (job.goodParts || 0),
			0
		);
		const totalRejectedParts = jobs.reduce(
			(sum, job) => sum + (job.rejectedParts || 0),
			0
		);
		const totalParts = totalGoodParts + totalRejectedParts;

		const avgCycleTime =
			jobs.length > 0
				? jobs.reduce((sum, job) => sum + (job.actualCycleTime || 0), 0) /
				  jobs.length
				: 0;

		// Use insertTime as ideal cycle time
		const avgInsertTime =
			jobs.length > 0
				? jobs.reduce((sum, job) => sum + (job.insertTime || 0), 0) /
				  jobs.length
				: 0;

		const performance =
			avgCycleTime > 0 && avgInsertTime > 0
				? (avgInsertTime / avgCycleTime) * 100
				: 100;

		// Quality (good parts / total parts)
		const quality = totalParts > 0 ? (totalGoodParts / totalParts) * 100 : 100;

		// OEE = Availability × Performance × Quality
		const oee = (availability * performance * quality) / 10000;

		return {
			oee: Math.min(oee, 100),
			availability: Math.min(availability, 100),
			performance: Math.min(performance, 100),
			quality: Math.min(quality, 100),
			totalHours,
			downtimeHours,
			plannedProductionTime,
			totalParts,
			totalGoodParts,
			totalRejectedParts,
			stopCount: stops.length,
		};
	}

	// Get downtime breakdown by category
	static async getDowntimeByCategory(
		machineId: string,
		startDate: Date,
		endDate: Date
	) {
		const stops = await db.stop.findMany({
			where: {
				machineId,
				startTime: { gte: startDate, lte: endDate },
			},
			include: {
				reason: true,
			},
		});

		const breakdown = stops.reduce<Record<string, CategoryBreakdown>>(
			(acc, stop) => {
				const category = stop.reason.category;
				if (!acc[category]) {
					acc[category] = {
						count: 0,
						totalDuration: 0,
						reasons: [],
					};
				}
				acc[category].count++;
				acc[category].totalDuration += stop.duration || 0;

				const reasonIndex = acc[category].reasons.findIndex(
					(r) => r.reasonId === stop.reasonId
				);
				if (reasonIndex >= 0) {
					acc[category].reasons[reasonIndex].count++;
					acc[category].reasons[reasonIndex].totalDuration +=
						stop.duration || 0;
				} else {
					acc[category].reasons.push({
						reasonId: stop.reasonId,
						reasonText: stop.reason.reasonText,
						count: 1,
						totalDuration: stop.duration || 0,
					});
				}

				return acc;
			},
			{}
		);

		return breakdown;
	}

	// Get production summary
	static async getProductionSummary(
		machineId: string | null,
		startDate: Date,
		endDate: Date
	) {
		const where: Prisma.JobWhereInput = {
			startTime: { gte: startDate, lte: endDate },
		};

		if (machineId) {
			where.machineId = machineId;
		}

		const jobs = await db.job.findMany({
			where,
			include: {
				machine: true,
			},
		});

		const summary = {
			totalJobs: jobs.length,
			completedJobs: jobs.filter((j) => j.isCompleted).length,
			activeJobs: jobs.filter((j) => !j.isCompleted && !j.endTime).length,
			totalParts: jobs.reduce((sum, job) => sum + (job.targetQuantity || 0), 0),
			producedParts: jobs.reduce(
				(sum, job) => sum + ((job.goodParts || 0) + (job.rejectedParts || 0)),
				0
			),
			goodParts: jobs.reduce((sum, job) => sum + (job.goodParts || 0), 0),
			rejectedParts: jobs.reduce(
				(sum, job) => sum + (job.rejectedParts || 0),
				0
			),
			avgCycleTime:
				jobs.length > 0
					? jobs.reduce((sum, job) => sum + (job.actualCycleTime || 0), 0) /
					  jobs.length
					: 0,
		};

		return {
			...summary,
			completionRate:
				summary.totalJobs > 0
					? (summary.completedJobs / summary.totalJobs) * 100
					: 0,
			yieldRate:
				summary.producedParts > 0
					? (summary.goodParts / summary.producedParts) * 100
					: 0,
			rejectionRate:
				summary.producedParts > 0
					? (summary.rejectedParts / summary.producedParts) * 100
					: 0,
		};
	}

	// Get machine utilization
	static async getMachineUtilization(startDate: Date, endDate: Date) {
		const machines = await db.machine.findMany({
			where: { isActive: true },
			include: {
				stops: {
					where: {
						startTime: { gte: startDate, lte: endDate },
					},
				},
				jobs: {
					where: {
						startTime: { gte: startDate, lte: endDate },
					},
				},
			},
		});

		const totalTime = endDate.getTime() - startDate.getTime();
		const totalHours = totalTime / (1000 * 60 * 60);

		return machines.map((machine) => {
			const downtime = machine.stops.reduce(
				(sum, stop) => sum + (stop.duration || 0),
				0
			);
			const downtimeHours = downtime / 3600;
			const utilizationRate =
				totalHours > 0 ? ((totalHours - downtimeHours) / totalHours) * 100 : 0;

			return {
				machineId: machine.id,
				machineName: machine.name,
				totalHours,
				downtimeHours,
				utilizationRate: Math.min(utilizationRate, 100),
				stopCount: machine.stops.length,
				jobCount: machine.jobs.length,
			};
		});
	}

	// Get top stop reasons
	static async getTopStopReasons(
		machineId: string | null,
		startDate: Date,
		endDate: Date,
		limit = 10
	) {
		const where: Prisma.StopWhereInput = {
			startTime: { gte: startDate, lte: endDate },
		};

		if (machineId) {
			where.machineId = machineId;
		}

		const stops = await db.stop.findMany({
			where,
			include: {
				reason: true,
			},
		});

		const reasonMap = stops.reduce<Record<string, ReasonSummary>>(
			(acc, stop) => {
				const reasonId = stop.reasonId;
				if (!acc[reasonId]) {
					acc[reasonId] = {
						reasonId,
						reasonCode: stop.reason.reasonCode,
						reasonText: stop.reason.reasonText,
						category: stop.reason.category,
						count: 0,
						totalDuration: 0,
					};
				}
				acc[reasonId].count++;
				acc[reasonId].totalDuration += stop.duration || 0;
				return acc;
			},
			{}
		);

		return Object.values(reasonMap)
			.sort((a, b) => b.totalDuration - a.totalDuration)
			.slice(0, limit);
	}

	// Get shift-wise performance
	static async getShiftPerformance(
		machineId: string | null,
		startDate: Date,
		endDate: Date
	) {
		const shifts = await db.shift.findMany({
			where: { isActive: true },
			orderBy: { sortOrder: "asc" },
		});

		const where: Prisma.StopWhereInput = {
			startTime: { gte: startDate, lte: endDate },
		};

		if (machineId) {
			where.machineId = machineId;
		}

		const stops = await db.stop.findMany({
			where,
			include: {
				reason: true,
			},
		});

		// Group stops by shift
		const shiftData = shifts.map((shift) => {
			const shiftStops = stops.filter((stop) => {
				const hour = new Date(stop.startTime).getHours();
				const [shiftStartHour] = shift.startTime.split(":").map(Number);
				const [shiftEndHour] = shift.endTime.split(":").map(Number);

				if (shiftStartHour < shiftEndHour) {
					return hour >= shiftStartHour && hour < shiftEndHour;
				} else {
					// Overnight shift
					return hour >= shiftStartHour || hour < shiftEndHour;
				}
			});

			const totalDowntime = shiftStops.reduce(
				(sum, stop) => sum + (stop.duration || 0),
				0
			);

			return {
				shiftId: shift.id,
				shiftName: shift.name,
				stopCount: shiftStops.length,
				totalDowntime,
				downtimeHours: totalDowntime / 3600,
			};
		});

		return shiftData;
	}
}