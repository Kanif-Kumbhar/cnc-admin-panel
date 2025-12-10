"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	TrendingUp,
	TrendingDown,
	Activity,
	AlertTriangle,
	CheckCircle2,
	Clock,
} from "lucide-react";

interface KPICardsProps {
	machineId: string | null;
	startDate: Date;
	endDate: Date;
}

interface KPIData {
	oee: number;
	availability: number;
	performance: number;
	quality: number;
	totalDowntime: number;
	stopCount: number;
	goodParts: number;
	rejectedParts: number;
}

export function KPICards({ machineId, startDate, endDate }: KPICardsProps) {
	const [data, setData] = useState<KPIData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const fetchKPIData = useCallback(async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams({
				startDate: startDate.toISOString(),
				endDate: endDate.toISOString(),
			});
			if (machineId) params.append("machineId", machineId);

			const response = await fetch(`/api/analytics/kpi?${params}`);
			if (response.ok) {
				const result = await response.json();
				setData(result);
			}
		} catch (error) {
			console.error("Failed to fetch KPI data:", error);
		} finally {
			setIsLoading(false);
		}
	}, [machineId, startDate, endDate]);

	useEffect(() => {
		void fetchKPIData();
	}, [fetchKPIData]);

	if (isLoading) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<Card key={i}>
						<CardContent className="p-6">
							<div className="animate-pulse space-y-3">
								<div className="h-4 bg-slate-200 rounded w-24" />
								<div className="h-8 bg-slate-200 rounded w-16" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!data) return null;

	const kpis = [
		{
			title: "OEE",
			value: `${data.oee.toFixed(1)}%`,
			icon: Activity,
			trend: data.oee >= 85 ? "up" : data.oee >= 70 ? "neutral" : "down",
			color:
				data.oee >= 85
					? "text-green-600"
					: data.oee >= 70
					? "text-yellow-600"
					: "text-red-600",
			bgColor:
				data.oee >= 85
					? "bg-green-50"
					: data.oee >= 70
					? "bg-yellow-50"
					: "bg-red-50",
		},
		{
			title: "Availability",
			value: `${data.availability.toFixed(1)}%`,
			icon: Clock,
			trend: data.availability >= 90 ? "up" : "down",
			color: data.availability >= 90 ? "text-blue-600" : "text-orange-600",
			bgColor: data.availability >= 90 ? "bg-blue-50" : "bg-orange-50",
		},
		{
			title: "Quality",
			value: `${data.quality.toFixed(1)}%`,
			icon: CheckCircle2,
			trend: data.quality >= 95 ? "up" : "down",
			color: data.quality >= 95 ? "text-green-600" : "text-red-600",
			bgColor: data.quality >= 95 ? "bg-green-50" : "bg-red-50",
		},
		{
			title: "Total Stops",
			value: data.stopCount.toString(),
			icon: AlertTriangle,
			trend: data.stopCount <= 10 ? "up" : "down",
			color: data.stopCount <= 10 ? "text-green-600" : "text-red-600",
			bgColor: data.stopCount <= 10 ? "bg-green-50" : "bg-red-50",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{kpis.map((kpi) => (
				<Card key={kpi.title}>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
						<div className={`p-2 rounded-lg ${kpi.bgColor}`}>
							<kpi.icon className={`h-4 w-4 ${kpi.color}`} />
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className={`text-2xl font-bold ${kpi.color}`}>
								{kpi.value}
							</div>
							{kpi.trend === "up" && (
								<TrendingUp className="h-4 w-4 text-green-600" />
							)}
							{kpi.trend === "down" && (
								<TrendingDown className="h-4 w-4 text-red-600" />
							)}
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}