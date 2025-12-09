"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { format, startOfDay, eachDayOfInterval } from "date-fns";

interface DowntimeChartProps {
	stops: Array<{
		startTime: Date;
		duration: number | null;
	}>;
}

interface ChartDataPoint {
	date: string;
	downtime: number;
	stops: number;
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: Array<{
		value: number;
		payload: ChartDataPoint;
	}>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
	if (active && payload && payload.length) {
		const data = payload[0].payload;
		return (
			<div className="rounded-lg border bg-white p-3 shadow-lg">
				<p className="font-medium text-slate-900">{data.date}</p>
				<p className="text-sm text-slate-600">
					Downtime:{" "}
					<span className="font-semibold text-red-600">
						{payload[0].value}h
					</span>
				</p>
				<p className="text-sm text-slate-600">
					Stops: <span className="font-semibold">{data.stops}</span>
				</p>
			</div>
		);
	}
	return null;
};

export function DowntimeChart({ stops }: DowntimeChartProps) {
	const dates = stops.map((stop) => new Date(stop.startTime));
	const minDate =
		dates.length > 0
			? new Date(Math.min(...dates.map((d) => d.getTime())))
			: new Date();
	const maxDate =
		dates.length > 0
			? new Date(Math.max(...dates.map((d) => d.getTime())))
			: new Date();

	const allDays = eachDayOfInterval({
		start: startOfDay(minDate),
		end: startOfDay(maxDate),
	});

	const chartData: ChartDataPoint[] = allDays.map((day) => {
		const dayStart = startOfDay(day);
		const dayEnd = new Date(dayStart);
		dayEnd.setHours(23, 59, 59, 999);

		const dayStops = stops.filter((stop) => {
			const stopDate = new Date(stop.startTime);
			return stopDate >= dayStart && stopDate <= dayEnd;
		});

		const totalDowntime = dayStops.reduce(
			(sum, stop) => sum + (stop.duration || 0),
			0
		);
		const downtimeHours = totalDowntime / 3600;

		return {
			date: format(day, "MMM dd"),
			downtime: parseFloat(downtimeHours.toFixed(2)),
			stops: dayStops.length,
		};
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>Daily Downtime Trend</CardTitle>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={350}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis
							dataKey="date"
							stroke="#64748b"
							fontSize={12}
							tickLine={false}
						/>
						<YAxis
							stroke="#64748b"
							fontSize={12}
							tickLine={false}
							label={{ value: "Hours", angle: -90, position: "insideLeft" }}
						/>
						<Tooltip content={<CustomTooltip />} />
						<Legend />
						<Bar
							dataKey="downtime"
							fill="#ef4444"
							radius={[8, 8, 0, 0]}
							name="Downtime (hours)"
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}