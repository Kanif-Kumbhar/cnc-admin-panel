"use client";

import { useEffect, useState, useCallback } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface OEEChartProps {
	machineId: string | null;
	startDate: Date;
	endDate: Date;
}

interface OEEData {
	oee: number;
	availability: number;
	performance: number;
	quality: number;
}

export function OEEChart({ machineId, startDate, endDate }: OEEChartProps) {
	const [data, setData] = useState<OEEData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchOEEData = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			});
			if (machineId) params.append("machineId", machineId);

			const response = await fetch(`/api/analytics/oee?${params}`);
			if (response.ok) {
				const result = await response.json();
				setData(result);
			}
		} catch (error) {
			console.error("Failed to fetch OEE data:", error);
		} finally {
			setIsLoading(false);
		}
	}, [machineId, startDate, endDate]);

	useEffect(() => {
		void fetchOEEData();
	}, [fetchOEEData]);

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

	const metrics = [
		{ label: "OEE", value: data.oee, color: "bg-blue-500" },
		{ label: "Availability", value: data.availability, color: "bg-green-500" },
		{ label: "Performance", value: data.performance, color: "bg-yellow-500" },
		{ label: "Quality", value: data.quality, color: "bg-purple-500" },
	];

	return (
		<Card>
			<CardHeader>
				<CardTitle>OEE Breakdown</CardTitle>
				<CardDescription>Overall Equipment Effectiveness</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					{metrics.map((metric) => (
						<div key={metric.label} className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">{metric.label}</span>
								<span className="text-sm font-bold">
									{metric.value.toFixed(1)}%
								</span>
							</div>
							<div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
								<div
									className={`absolute top-0 left-0 h-full ${metric.color} transition-all duration-500`}
									style={{ width: `${Math.min(metric.value, 100)}%` }}
								/>
							</div>
						</div>
					))}

					<div className="mt-8 p-4 bg-slate-50 rounded-lg">
						<div className="text-sm text-slate-600">
							<strong>OEE Formula:</strong> Availability × Performance × Quality
						</div>
						<div className="text-xs text-slate-500 mt-1">
							{data.availability.toFixed(1)}% × {data.performance.toFixed(1)}% ×{" "}
							{data.quality.toFixed(1)}% = {data.oee.toFixed(1)}%
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}