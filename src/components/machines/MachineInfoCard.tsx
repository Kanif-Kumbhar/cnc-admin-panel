import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Network, Settings, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface MachineInfoCardProps {
	machine: {
		status: string;
		location: string | null;
		ipAddress: string | null;
		opcPort: number | null;
		controller: string;
		serialNumber: string | null;
		manufacturer: string | null;
		lastMaintenance: Date | null;
	};
}

export function MachineInfoCard({ machine }: MachineInfoCardProps) {
	const getStatusConfig = (status: string) => {
		const config = {
			RUNNING: { label: "Running", className: "bg-green-100 text-green-700" },
			IDLE: { label: "Idle", className: "bg-yellow-100 text-yellow-700" },
			ERROR: { label: "Error", className: "bg-red-100 text-red-700" },
			OFFLINE: { label: "Offline", className: "bg-slate-100 text-slate-700" },
			MAINTENANCE: {
				label: "Maintenance",
				className: "bg-orange-100 text-orange-700",
			},
			ONLINE: { label: "Online", className: "bg-blue-100 text-blue-700" },
		};
		return config[status as keyof typeof config] || config.OFFLINE;
	};

	const statusConfig = getStatusConfig(machine.status);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Machine Information</CardTitle>
					<Badge
						variant="outline"
						className={cn("font-medium", statusConfig.className)}
					>
						<div className="mr-2 h-2 w-2 rounded-full bg-current" />
						{statusConfig.label}
					</Badge>
				</div>
			</CardHeader>
			<CardContent>
				<div className="grid gap-4 md:grid-cols-2">
					{machine.location && (
						<div className="flex items-start gap-3">
							<MapPin className="mt-0.5 h-5 w-5 text-slate-400" />
							<div>
								<p className="text-sm font-medium text-slate-900">Location</p>
								<p className="text-sm text-slate-600">{machine.location}</p>
							</div>
						</div>
					)}

					<div className="flex items-start gap-3">
						<Network className="mt-0.5 h-5 w-5 text-slate-400" />
						<div>
							<p className="text-sm font-medium text-slate-900">Network</p>
							<p className="text-sm text-slate-600">
								{machine.ipAddress || "Not configured"}
								{machine.opcPort && `:${machine.opcPort}`}
							</p>
						</div>
					</div>

					<div className="flex items-start gap-3">
						<Settings className="mt-0.5 h-5 w-5 text-slate-400" />
						<div>
							<p className="text-sm font-medium text-slate-900">Controller</p>
							<p className="text-sm text-slate-600">{machine.controller}</p>
						</div>
					</div>

					{machine.serialNumber && (
						<div className="flex items-start gap-3">
							<Settings className="mt-0.5 h-5 w-5 text-slate-400" />
							<div>
								<p className="text-sm font-medium text-slate-900">
									Serial Number
								</p>
								<p className="text-sm text-slate-600">{machine.serialNumber}</p>
							</div>
						</div>
					)}

					{machine.manufacturer && (
						<div className="flex items-start gap-3">
							<Settings className="mt-0.5 h-5 w-5 text-slate-400" />
							<div>
								<p className="text-sm font-medium text-slate-900">
									Manufacturer
								</p>
								<p className="text-sm text-slate-600">{machine.manufacturer}</p>
							</div>
						</div>
					)}

					{machine.lastMaintenance && (
						<div className="flex items-start gap-3">
							<Calendar className="mt-0.5 h-5 w-5 text-slate-400" />
							<div>
								<p className="text-sm font-medium text-slate-900">
									Last Maintenance
								</p>
								<p className="text-sm text-slate-600">
									{formatDistanceToNow(new Date(machine.lastMaintenance), {
										addSuffix: true,
									})}
								</p>
							</div>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}