import { db } from "@/lib/db";
import { MachinesTable } from "@/components/machines/MachinesTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getMachines() {
	const machines = await db.machine.findMany({
		orderBy: { name: "asc" },
		include: {
			jobs: {
				where: { isCompleted: false },
				take: 1,
			},
			_count: {
				select: {
					jobs: true,
					stops: true,
				},
			},
		},
	});

	return machines;
}

export default async function MachinesPage() {
	const machines = await getMachines();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Machines</h1>
					<p className="mt-1 text-sm text-slate-600">
						Manage all CNC machines in your facility
					</p>
				</div>

				<Link href="/machines/add">
					<Button className="gap-2">
						<Plus className="h-4 w-4" />
						Add Machine
					</Button>
				</Link>
			</div>

			<MachinesTable machines={machines} />
		</div>
	);
}