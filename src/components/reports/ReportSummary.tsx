import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertCircle, TrendingDown, Hash } from "lucide-react";

interface ReportSummaryProps {
	stops: Array<{
		duration: number | null;
		reason: {
			category: string;
		};
	}>;
}

export function ReportSummary({ stops }: ReportSummaryProps) {
	const totalDowntime = stops.reduce(
		(sum, stop) => sum + (stop.duration || 0),
		0
	);
	const avgDowntime = stops.length > 0 ? totalDowntime / stops.length : 0;

	const categoryCount = stops.reduce((acc, stop) => {
		acc[stop.reason.category] = (acc[stop.reason.category] || 0) + 1;
		return acc;
	}, {} as Record<string, number>);

	const topCategory = Object.entries(categoryCount).sort(
		(a, b) => b[1] - a[1]
	)[0];

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						Total Downtime
					</CardTitle>
					<Clock className="h-4 w-4 text-red-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">
						{Math.round(totalDowntime / 3600)}h{" "}
						{Math.round((totalDowntime % 3600) / 60)}m
					</div>
					<p className="mt-1 text-xs text-slate-500">Across all machines</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						Number of Stops
					</CardTitle>
					<Hash className="h-4 w-4 text-yellow-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">
						{stops.length}
					</div>
					<p className="mt-1 text-xs text-slate-500">Total incidents</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						Average Duration
					</CardTitle>
					<TrendingDown className="h-4 w-4 text-blue-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">
						{Math.round(avgDowntime / 60)}m
					</div>
					<p className="mt-1 text-xs text-slate-500">Per stop</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between pb-2">
					<CardTitle className="text-sm font-medium text-slate-600">
						Top Category
					</CardTitle>
					<AlertCircle className="h-4 w-4 text-purple-600" />
				</CardHeader>
				<CardContent>
					<div className="text-2xl font-bold text-slate-900">
						{topCategory?.[0] || "N/A"}
					</div>
					<p className="mt-1 text-xs text-slate-500">
						{topCategory?.[1] || 0} occurrences
					</p>
				</CardContent>
			</Card>
		</div>
	);
}