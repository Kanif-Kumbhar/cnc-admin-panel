"use client";

import { useEffect, useState, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, XCircle, Target } from "lucide-react";

interface ProductionChartProps {
	machineId: string | null;
	startDate: Date;
	endDate: Date;
}

interface ProductionData {
	totalJobs: number;
	completedJobs: number;
	totalParts: number;
	goodParts: number;
	rejectedParts: number;
	yieldRate: number;
	rejectionRate: number;
}

export function ProductionChart({
	machineId,
	startDate,
	endDate,
}: ProductionChartProps) {
	const [data, setData] = useState<ProductionData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchProductionData = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			});
			if (machineId) params.append("machineId", machineId);

			const response = await fetch(`/api/analytics/production?${params}`);
			if (response.ok) {
				const result = await response.json();
				setData(result);
			}
		} catch (error) {
			console.error("Failed to fetch production data:", error);
		} finally {
			setIsLoading(false);
		}
	}, [machineId, startDate, endDate]);

	useEffect(() => {
		void fetchProductionData();
	}, [fetchProductionData]);

	if (isLoading) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-slate-200 rounded w-1/3" />
						<div className="h-64 bg-slate-200 rounded" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!data) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Production Summary</CardTitle>
				<CardDescription>Parts produced and quality metrics</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{/* Summary Stats */}
					<div className="grid grid-cols-3 gap-4">
						<div className="p-4 bg-blue-50 rounded-lg">
							<div className="flex items-center gap-2 mb-1">
								<Target className="h-4 w-4 text-blue-600" />
								<span className="text-sm text-blue-600">Total Parts</span>
							</div>
							<div className="text-2xl font-bold text-blue-900">
								{data.totalParts.toLocaleString()}
							</div>
						</div>

						<div className="p-4 bg-green-50 rounded-lg">
							<div className="flex items-center gap-2 mb-1">
								<CheckCircle2 className="h-4 w-4 text-green-600" />
								<span className="text-sm text-green-600">Good Parts</span>
							</div>
							<div className="text-2xl font-bold text-green-900">
								{data.goodParts.toLocaleString()}
							</div>
						</div>

						<div className="p-4 bg-red-50 rounded-lg">
							<div className="flex items-center gap-2 mb-1">
								<XCircle className="h-4 w-4 text-red-600" />
								<span className="text-sm text-red-600">Rejected</span>
							</div>
							<div className="text-2xl font-bold text-red-900">
								{data.rejectedParts.toLocaleString()}
							</div>
						</div>
					</div>

					{/* Quality Metrics */}
					<div className="space-y-4">
						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">Yield Rate</span>
								<span className="text-sm font-bold text-green-600">
									{data.yieldRate.toFixed(1)}%
								</span>
							</div>
							<div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
								<div
									className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500"
									style={{ width: `${Math.min(data.yieldRate, 100)}%` }}
								/>
							</div>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<span className="text-sm font-medium">Rejection Rate</span>
								<span className="text-sm font-bold text-red-600">
									{data.rejectionRate.toFixed(1)}%
								</span>
							</div>
							<div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
								<div
									className="absolute top-0 left-0 h-full bg-red-500 transition-all duration-500"
									style={{ width: `${Math.min(data.rejectionRate, 100)}%` }}
								/>
							</div>
						</div>
					</div>

					{/* Jobs */}
					<div className="pt-4 border-t">
						<div className="flex items-center justify-between">
							<span className="text-sm text-slate-600">Total Jobs</span>
							<span className="text-lg font-bold">{data.totalJobs}</span>
						</div>
						<div className="flex items-center justify-between mt-1">
							<span className="text-sm text-slate-600">Completed Jobs</span>
							<span className="text-lg font-bold text-green-600">
								{data.completedJobs}
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}