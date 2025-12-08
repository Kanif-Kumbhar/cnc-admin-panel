"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MachineWithJobs } from "@/types/dashboard";

interface MachineStatusCardProps {
	machine: MachineWithJobs;
}

export function MachineStatusCard({ machine }: MachineStatusCardProps) {
	const statusConfig = {
		RUNNING: {
			label: "Running",
			color: "bg-green-500",
			textColor: "text-green-700",
			bgColor: "bg-green-50",
		},
		IDLE: {
			label: "Idle",
			color: "bg-yellow-500",
			textColor: "text-yellow-700",
			bgColor: "bg-yellow-50",
		},
		ERROR: {
			label: "Error",
			color: "bg-red-500",
			textColor: "text-red-700",
			bgColor: "bg-red-50",
		},
		OFFLINE: {
			label: "Offline",
			color: "bg-slate-500",
			textColor: "text-slate-700",
			bgColor: "bg-slate-50",
		},
		MAINTENANCE: {
			label: "Maintenance",
			color: "bg-orange-500",
			textColor: "text-orange-700",
			bgColor: "bg-orange-50",
		},
		ONLINE: {
			label: "Online",
			color: "bg-blue-500",
			textColor: "text-blue-700",
			bgColor: "bg-blue-50",
		},
	};

	const status =
		statusConfig[machine.status as keyof typeof statusConfig] ||
		statusConfig.OFFLINE;
	const currentJob = machine.jobs[0];

	return (
		<Link href={`/machines/${machine.id}`}>
			<Card className="group cursor-pointer transition-all hover:shadow-lg hover:ring-2 hover:ring-blue-500">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-lg font-semibold">
								{machine.name}
							</CardTitle>
							<p className="text-sm text-slate-500">{machine.model}</p>
						</div>

						<div className="flex items-center gap-2">
							<div className={cn("h-3 w-3 rounded-full", status.color)}>
								<div
									className={cn(
										"h-3 w-3 animate-ping rounded-full",
										status.color,
										"opacity-75"
									)}
								/>
							</div>
							<Badge
								variant="outline"
								className={cn(status.textColor, status.bgColor)}
							>
								{status.label}
							</Badge>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-3">
					{machine.location && (
						<div className="flex items-center gap-2 text-sm text-slate-600">
							<MapPin className="h-4 w-4" />
							<span>{machine.location}</span>
						</div>
					)}

					{currentJob && (
						<div className="flex items-center gap-2 rounded-lg bg-blue-50 p-2 text-sm">
							<Activity className="h-4 w-4 text-blue-600" />
							<span className="font-medium text-blue-700">
								Active Job: {currentJob.cycleCount} cycles (
								{currentJob.productSize}&quot;)
							</span>
						</div>
					)}

					{machine.lastMaintenance && (
						<div className="flex items-center gap-2 text-xs text-slate-500">
							<Clock className="h-3 w-3" />
							<span>
								Last maintenance:{" "}
								{formatDistanceToNow(new Date(machine.lastMaintenance), {
									addSuffix: true,
								})}
							</span>
						</div>
					)}

					{!currentJob && (
						<div className="rounded-lg bg-slate-50 p-2 text-center text-sm text-slate-500">
							No active job
						</div>
					)}
				</CardContent>
			</Card>
		</Link>
	);
}