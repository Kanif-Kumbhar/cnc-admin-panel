import { MachineForm } from "@/components/machines/MachineForm";
import { requireAuth } from "@/lib/auth-helper";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AddMachinePage() {
	await requireAuth(["ADMIN"]);

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Link href="/machines">
					<Button variant="ghost" size="icon">
						<ArrowLeft className="h-5 w-5" />
					</Button>
				</Link>
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Add New Machine</h1>
					<p className="mt-1 text-sm text-slate-600">
						Register a new CNC machine in the system
					</p>
				</div>
			</div>

			<MachineForm mode="create" />
		</div>
	);
}