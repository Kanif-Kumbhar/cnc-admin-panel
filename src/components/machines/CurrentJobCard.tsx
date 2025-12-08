import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CurrentJobCardProps {
	job: {
		id: string;
		productSize: string;
		insertTime: number;
		startTime: Date;
		cycleCount: number;
		targetQuantity: number | null;
		totalSpindleTime: number | null;
	};
	machineName: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function CurrentJobCard({ job, machineName }: CurrentJobCardProps) {
	const progress = job.targetQuantity
		? (job.cycleCount / job.targetQuantity) * 100
		: 0;

	return (
		<Card className="border-blue-200 bg-blue-50/50">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="text-blue-900">Current Job</CardTitle>
					<Badge className="bg-blue-600">
						<Play className="mr-1 h-3 w-3" />
						Active
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">

					<div className="grid gap-4 md:grid-cols-3">
						<div>
							<p className="text-sm font-medium text-slate-900">Product Size</p>
							<p className="text-2xl font-bold text-blue-700">
								{job.productSize}&quot;
							</p>
						</div>

						<div>
							<p className="text-sm font-medium text-slate-900">Cycle Count</p>
							<p className="text-2xl font-bold text-blue-700">
								{job.cycleCount}
								{job.targetQuantity && (
									<span className="text-sm font-normal text-slate-600">
										/{job.targetQuantity}
									</span>
								)}
							</p>
						</div>

						<div>
							<p className="text-sm font-medium text-slate-900">Spindle Time</p>
							<p className="text-2xl font-bold text-blue-700">
								{job.totalSpindleTime
									? `${Math.round(job.totalSpindleTime / 60)}m`
									: "0m"}
							</p>
						</div>
					</div>

					{job.targetQuantity && (
						<div>
							<div className="mb-2 flex items-center justify-between text-sm">
								<span className="font-medium text-slate-900">Progress</span>
								<span className="text-slate-600">{progress.toFixed(1)}%</span>
							</div>
							<div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
								<div
									className="h-full bg-blue-600 transition-all"
									style={{ width: `${Math.min(progress, 100)}%` }}
								/>
							</div>
						</div>
					)}

					<div className="flex items-center gap-4 pt-2 text-sm text-slate-600">
						<div className="flex items-center gap-1">
							<Clock className="h-4 w-4" />
							Started{" "}
							{formatDistanceToNow(new Date(job.startTime), {
								addSuffix: true,
							})}
						</div>
						<div className="flex items-center gap-1">
							<Package className="h-4 w-4" />
							Insert time: {job.insertTime}s
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}