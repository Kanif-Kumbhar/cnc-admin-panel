import { db } from "@/lib/db";
import { MachineForm } from "@/components/machines/MachineForm";
import { requireAuth } from "@/lib/auth-helper";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";

async function getMachine(id: string) {
	const machine = await db.machine.findUnique({
		where: { id },
	});

	if (!machine) {
		notFound();
	}

	return machine;
}

export default async function EditMachinePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requireAuth(["ADMIN", "SUPERVISOR"]);

	const { id } = await params;
	const machine = await getMachine(id);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Link href={`/machines/${id}`}>
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Link>
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Edit Machine</h1>
					<p className="mt-1 text-sm text-slate-600">
						Update machine configuration and settings
					</p>
				</div>
			</div>

			<MachineForm mode="edit" machine={machine} />
		</div>
	);
}