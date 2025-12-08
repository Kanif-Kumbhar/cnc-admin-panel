"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Eye, MoreVertical, Pencil, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface MachinesTableProps {
	machines: Array<{
		id: string;
		name: string;
		model: string;
		controller: string;
		location: string | null;
		status: string;
		ipAddress: string | null;
		opcPort: number | null;
		_count: {
			jobs: number;
			stops: number;
		};
	}>;
}

export function MachinesTable({ machines }: MachinesTableProps) {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const filteredMachines = machines.filter(
		(machine) =>
			machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			machine.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
			machine.location?.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const getStatusBadge = (status: string) => {
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

		const statusConfig =
			config[status as keyof typeof config] || config.OFFLINE;

		return (
			<Badge
				variant="outline"
				className={cn("font-medium", statusConfig.className)}
			>
				{statusConfig.label}
			</Badge>
		);
	};

	const handleDelete = async () => {
		if (!deleteId) return;

		setIsDeleting(true);
		try {
			const response = await fetch(`/api/machines/${deleteId}`, {
				method: "DELETE",
			});

			if (!response.ok) {
				throw new Error("Failed to delete machine");
			}

			toast.success("Machine deleted successfully");
			router.refresh();
		} catch (error) {
			toast.error("Failed to delete machine");
			console.error(error);
		} finally {
			setIsDeleting(false);
			setDeleteId(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
					<Input
						placeholder="Search machines..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>
				<div className="text-sm text-slate-600">
					{filteredMachines.length} of {machines.length} machines
				</div>
			</div>

			<div className="rounded-lg border border-slate-200 bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Model</TableHead>
							<TableHead>Controller</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>IP Address</TableHead>
							<TableHead className="text-center">Jobs</TableHead>
							<TableHead className="text-center">Stops</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredMachines.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={9}
									className="text-center py-8 text-slate-500"
								>
									No machines found
								</TableCell>
							</TableRow>
						) : (
							filteredMachines.map((machine) => (
								<TableRow key={machine.id} className="hover:bg-slate-50">
									<TableCell className="font-medium">{machine.name}</TableCell>
									<TableCell>{machine.model}</TableCell>
									<TableCell className="text-slate-600">
										{machine.controller}
									</TableCell>
									<TableCell className="text-slate-600">
										{machine.location || "-"}
									</TableCell>
									<TableCell>{getStatusBadge(machine.status)}</TableCell>
									<TableCell className="font-mono text-sm text-slate-600">
										{machine.ipAddress || "-"}
									</TableCell>
									<TableCell className="text-center">
										{machine._count.jobs}
									</TableCell>
									<TableCell className="text-center">
										{machine._count.stops}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreVertical className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem asChild>
													<Link href={`/machines/${machine.id}`}>
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/machines/${machine.id}/edit`}>
														<Pencil className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<DropdownMenuItem
													className="text-red-600"
													onClick={() => setDeleteId(machine.id)}
												>
													<Trash2 className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete this machine and all associated data.
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}