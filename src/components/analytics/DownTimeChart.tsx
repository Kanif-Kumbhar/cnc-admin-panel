"use client";

import { useEffect, useState, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface DowntimeChartProps {
	machineId: string | null;
	startDate: Date;
	endDate: Date;
}

interface CategoryData {
	category: string;
	count: number;
	totalDuration: number;
	percentage: number;
}

export function DowntimeChart({
	machineId,
	startDate,
	endDate,
}: DowntimeChartProps) {
	const [data, setData] = useState<CategoryData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchDowntimeData = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			});
			if (machineId) params.append("machineId", machineId);

			const response = await fetch(`/api/analytics/downtime?${params}`);
			if (response.ok) {
				const result = await response.json();
				setData(result);
			}
		} catch (error) {
			console.error("Failed to fetch downtime data:", error);
		} finally {
			setIsLoading(false);
		}
	}, [machineId, startDate, endDate]);

	useEffect(() => {
		void fetchDowntimeData();
	}, [fetchDowntimeData]);

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

	const categoryColors: Record<string, string> = {
		SAFETY: "bg-red-500",
		MECHANICAL: "bg-orange-500",
		MATERIAL: "bg-yellow-500",
		QUALITY: "bg-purple-500",
		SETUP: "bg-blue-500",
		MAINTENANCE: "bg-pink-500",
		OPERATOR: "bg-green-500",
		OTHER: "bg-gray-500",
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Downtime by Category</CardTitle>
				<CardDescription>Stop duration breakdown</CardDescription>
			</CardHeader>
			<CardContent>
				{data.length === 0 ? (
					<div className="text-center py-12 text-slate-500">
						No downtime data available
					</div>
				) : (
					<div className="space-y-4">
						{data.map((category) => (
							<div key={category.category} className="space-y-2">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										{category.category}
									</span>
									<div className="flex items-center gap-3">
										<span className="text-xs text-slate-500">
											{category.count} stops
										</span>
										<span className="text-sm font-bold">
											{(category.totalDuration / 3600).toFixed(1)}h
										</span>
									</div>
								</div>
								<div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
									<div
										className={`absolute top-0 left-0 h-full ${
											categoryColors[category.category] || "bg-gray-500"
										} transition-all duration-500`}
										style={{ width: `${category.percentage}%` }}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}