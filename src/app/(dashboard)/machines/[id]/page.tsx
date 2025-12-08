import { db } from "@/lib/db";
import { MachineInfoCard } from "@/components/machines/MachineInfoCard";
import { CurrentJobCard } from "@/components/machines/CurrentJobCard";
import { StopHistoryTable } from "@/components/machines/StopHistoryTable";
import { MachineStatsCards } from "@/components/machines/MachineStatsCard";
import { RecentEventsCard } from "@/components/machines/RecentEventsCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

async function getMachineDetails(id: string) {
	const machine = await db.machine.findUnique({
		where: { id },
		include: {
			jobs: {
				where: { isCompleted: false },
				orderBy: { startTime: "desc" },
				take: 1,
			},
			stops: {
				orderBy: { startTime: "desc" },
				take: 50,
				include: {
					reason: true,
					operator: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			},
			events: {
				orderBy: { timestamp: "desc" },
				take: 20,
			},
		},
	});

	if (!machine) {
		notFound();
	}

	const todayStops = await db.stop.findMany({
		where: {
			machineId: id,
			startTime: {
				gte: new Date(new Date().setHours(0, 0, 0, 0)),
			},
		},
	});

	return { machine, todayStops };
}

export default async function MachineDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const { machine, todayStops } = await getMachineDetails(id);

	const currentJob = machine.jobs[0] || null;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link href="/machines">
						<Button variant="ghost" size="icon">
							<ArrowLeft className="h-5 w-5" />
						</Button>
					</Link>
					<div>
						<h1 className="text-2xl font-bold text-slate-900">
							{machine.name}
						</h1>
						<p className="mt-1 text-sm text-slate-600">{machine.model}</p>
					</div>
				</div>

				<Link href={`/machines/${id}/edit`}>
					<Button variant="outline">Edit Machine</Button>
				</Link>
			</div>

			<MachineStatsCards machine={machine} todayStops={todayStops} />

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<MachineInfoCard machine={machine} />
					{currentJob && (
						<CurrentJobCard job={currentJob} machineName={machine.name} />
					)}
					<StopHistoryTable stops={machine.stops} machineId={id} />
				</div>
				<div className="space-y-6">
					<RecentEventsCard events={machine.events} />
				</div>
			</div>
		</div>
	);
}