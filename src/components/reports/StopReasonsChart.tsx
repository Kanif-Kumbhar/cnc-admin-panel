"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Tooltip,
	Legend,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Line,
	ComposedChart,
} from "recharts";

interface StopReasonsChartProps {
	stops: Array<{
		duration: number | null;
		reason: {
			reasonCode: string;
			reasonText: string;
			category: string;
		};
	}>;
	type?: "pie" | "category" | "pareto";
}

interface PieTooltipProps {
	active?: boolean;
	payload?: Array<{
		name: string;
		value: number;
	}>;
}

const COLORS = [
	"#ef4444",
	"#f97316",
	"#f59e0b",
	"#84cc16",
	"#10b981",
	"#06b6d4",
	"#3b82f6",
	"#6366f1",
	"#8b5cf6",
	"#d946ef",
];

const CustomTooltip = ({ active, payload }: PieTooltipProps) => {
	if (active && payload && payload.length) {
		return (
			<div className="rounded-lg border bg-white p-3 shadow-lg">
				<p className="font-medium text-slate-900">{payload[0].name}</p>
				<p className="text-sm text-slate-600">
					<span className="font-semibold">{payload[0].value}h</span>
				</p>
			</div>
		);
	}
	return null;
};

export function StopReasonsChart({
	stops,
	type = "pie",
}: StopReasonsChartProps) {
	if (type === "category") {
		const categoryData = stops.reduce((acc, stop) => {
			const category = stop.reason.category;
			if (!acc[category]) {
				acc[category] = { count: 0, duration: 0 };
			}
			acc[category].count += 1;
			acc[category].duration += stop.duration || 0;
			return acc;
		}, {} as Record<string, { count: number; duration: number }>);

		const chartData = Object.entries(categoryData)
			.map(([category, data]) => ({
				category,
				count: data.count,
				hours: parseFloat((data.duration / 3600).toFixed(2)),
			}))
			.sort((a, b) => b.hours - a.hours);

		return (
			<Card>
				<CardHeader>
					<CardTitle>Downtime by Category</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={350}>
						<BarChart data={chartData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis dataKey="category" stroke="#64748b" fontSize={12} />
							<YAxis stroke="#64748b" fontSize={12} />
							<Tooltip />
							<Legend />
							<Bar
								dataKey="hours"
								fill="#3b82f6"
								name="Downtime (hours)"
								radius={[8, 8, 0, 0]}
							/>
							<Bar
								dataKey="count"
								fill="#f59e0b"
								name="Number of stops"
								radius={[8, 8, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		);
	}

	if (type === "pareto") {
		const reasonData = stops.reduce((acc, stop) => {
			const key = `${stop.reason.reasonCode} - ${stop.reason.reasonText}`;
			if (!acc[key]) {
				acc[key] = 0;
			}
			acc[key] += stop.duration || 0;
			return acc;
		}, {} as Record<string, number>);

		const sortedData = Object.entries(reasonData)
			.map(([reason, duration]) => ({
				reason: reason.length > 20 ? reason.substring(0, 20) + "..." : reason,
				hours: parseFloat((duration / 3600).toFixed(2)),
			}))
			.sort((a, b) => b.hours - a.hours)
			.slice(0, 10);

		const total = sortedData.reduce((sum, item) => sum + item.hours, 0);

		const paretoData = sortedData.reduce((acc, item, index) => {
			const prevCumulative = index > 0 ? acc[index - 1].cumulative : 0;
			const currentCumulative = prevCumulative + item.hours;

			acc.push({
				...item,
				cumulative: parseFloat(((currentCumulative / total) * 100).toFixed(1)),
			});

			return acc;
		}, [] as Array<{ reason: string; hours: number; cumulative: number }>);

		return (
			<Card>
				<CardHeader>
					<CardTitle>Pareto Analysis - Top Stop Reasons</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer width="100%" height={350}>
						<ComposedChart data={paretoData}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis
								dataKey="reason"
								stroke="#64748b"
								fontSize={11}
								angle={-45}
								textAnchor="end"
								height={100}
							/>
							<YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
							<YAxis
								yAxisId="right"
								orientation="right"
								stroke="#64748b"
								fontSize={12}
								domain={[0, 100]}
							/>
							<Tooltip />
							<Legend />
							<Bar
								yAxisId="left"
								dataKey="hours"
								fill="#ef4444"
								name="Downtime (hours)"
								radius={[8, 8, 0, 0]}
							/>
							<Line
								yAxisId="right"
								type="monotone"
								dataKey="cumulative"
								stroke="#3b82f6"
								strokeWidth={2}
								name="Cumulative %"
								dot={{ fill: "#3b82f6", r: 4 }}
							/>
						</ComposedChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		);
	}

	const reasonData = stops.reduce((acc, stop) => {
		const key = `${stop.reason.reasonCode}`;
		if (!acc[key]) {
			acc[key] = { name: stop.reason.reasonText, value: 0 };
		}
		acc[key].value += stop.duration || 0;
		return acc;
	}, {} as Record<string, { name: string; value: number }>);

	const chartData = Object.values(reasonData)
		.map((item) => ({
			name: item.name,
			value: parseFloat((item.value / 3600).toFixed(2)),
		}))
		.sort((a, b) => b.value - a.value)
		.slice(0, 8);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Stop Reasons Distribution</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={350}>
					<PieChart>
						<Pie
							data={chartData}
							cx="50%"
							cy="50%"
							labelLine={false}
							label={({ name, percent }) => {
								const percentValue = percent !== undefined ? percent : 0;
								return `${name}: ${(percentValue * 100).toFixed(0)}%`;
							}}
							outerRadius={100}
							fill="#8884d8"
							dataKey="value"
						>
							{chartData.map((entry, index) => (
								<Cell
									key={`cell-${index}`}
									fill={COLORS[index % COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip content={<CustomTooltip />} />
						<Legend />
					</PieChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}