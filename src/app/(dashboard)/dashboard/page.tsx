import { db } from "@/lib/db";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { MachineStatusCard } from "@/components/dashboard/MachineStatusCard";
import { Activity, AlertCircle, CheckCircle2, Clock } from "lucide-react";

async function getDashboardData() {
	const [machines, activeJobs, todayStops, unresolvedStops] = await Promise.all(
		[
			db.machine.findMany({
				where: { isActive: true },
				include: {
					jobs: {
						where: { isCompleted: false },
						select: {
							cycleCount: true,
							productSize: true,
						},
						take: 1,
						orderBy: { startTime: "desc" },
					},
				},
			}),
			db.job.count({
				where: { isCompleted: false },
			}),
			db.stop.findMany({
				where: {
					startTime: {
						gte: new Date(new Date().setHours(0, 0, 0, 0)),
					},
				},
				include: { reason: true },
			}),
			db.stop.count({
				where: { isResolved: false },
			}),
		]
	);

	const totalDowntime = todayStops.reduce(
		(sum, stop) => sum + (stop.duration || 0),
		0
	);

	const machineStatusCounts = {
		running: machines.filter((m) => m.status === "RUNNING").length,
		idle: machines.filter((m) => m.status === "IDLE").length,
		error: machines.filter((m) => m.status === "ERROR").length,
	};

	return {
		machines,
		activeJobs,
		totalDowntime,
		unresolvedStops,
		machineStatusCounts,
		todayStops: todayStops.length,
	};
}

export default async function DashboardPage() {
	const data = await getDashboardData();

	return (
		<div className="space-y-8">
			{/* Page Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight text-slate-900">
					Dashboard
				</h1>
				<p className="mt-2 text-slate-600">
					Real-time overview of CNC machine performance
				</p>
			</div>

			{/* KPI Cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<KpiCard
					title="Total Machines"
					value={data.machines.length}
					description={`${data.machineStatusCounts.running} running, ${data.machineStatusCounts.idle} idle`}
					icon={Activity}
					variant="default"
				/>

				<KpiCard
					title="Active Jobs"
					value={data.activeJobs}
					description="Currently in production"
					icon={CheckCircle2}
					variant="success"
				/>

				<KpiCard
					title="Downtime Today"
					value={`${Math.round(data.totalDowntime / 60)}m`}
					description={`${data.todayStops} stops recorded`}
					icon={Clock}
					variant="warning"
				/>

				<KpiCard
					title="Active Alerts"
					value={data.unresolvedStops}
					description={`${data.machineStatusCounts.error} machines in error`}
					icon={AlertCircle}
					variant="danger"
				/>
			</div>

			{/* Machine Status Grid */}
			<div>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-2xl font-bold text-slate-900">
						Live Machine Status
					</h2>
					<p className="text-sm text-slate-500">Updated in real-time</p>
				</div>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{data.machines.map((machine) => (
						<MachineStatusCard key={machine.id} machine={machine} />
					))}
				</div>
			</div>
		</div>
	);
}