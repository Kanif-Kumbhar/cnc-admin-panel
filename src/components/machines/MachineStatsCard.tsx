import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertCircle, Clock, TrendingUp } from "lucide-react";

interface MachineStatsCardsProps {
	machine: {
		totalRuntime: number;
		totalCycles: number;
		totalDowntime: number;
		averageOEE: number | null;
	};
	todayStops: Array<{
		duration: number | null;
	}>;
}

export function MachineStatsCards({
	machine,
	todayStops,
}: MachineStatsCardsProps) {
	const todayDowntime = todayStops.reduce(
		(sum, stop) => sum + (stop.duration || 0),
		0
	);

	const formatTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	};

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						Total Runtime
					</CardTitle>
					<Activity className="h-4 w-4 text-blue-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">
						{formatTime(machine.totalRuntime)}
					</div>
					<p className="mt-1 text-xs text-slate-500">Lifetime operation</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						Total Cycles
					</CardTitle>
					<TrendingUp className="h-4 w-4 text-green-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">
						{machine.totalCycles.toLocaleString()}
					</div>
					<p className="mt-1 text-xs text-slate-500">Parts produced</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						Downtime Today
					</CardTitle>
					<Clock className="h-4 w-4 text-yellow-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">
						{Math.round(todayDowntime / 60)}m
					</div>
					<p className="mt-1 text-xs text-slate-500">
						{todayStops.length} stops
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						Average OEE
					</CardTitle>
					<AlertCircle className="h-4 w-4 text-purple-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">
						{machine.averageOEE?.toFixed(1) || "0"}%
					</div>
					<p className="mt-1 text-xs text-slate-500">Overall efficiency</p>
				</CardContent>
			</Card>
		</div>
	);
}