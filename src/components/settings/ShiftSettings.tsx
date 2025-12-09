"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Clock, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Shift {
	id: string;
	name: string;
	startTime: string;
	endTime: string;
	isActive: boolean;
	sortOrder: number;
	color: string | null;
}

interface ShiftSettingsProps {
	shifts: Shift[];
}

export function ShiftSettings({ shifts: initialShifts }: ShiftSettingsProps) {
	const router = useRouter();
	const [shifts, setShifts] = useState(initialShifts);
	const [open, setOpen] = useState(false);
	const [editShift, setEditShift] = useState<Shift | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		startTime: "",
		endTime: "",
		color: "#3b82f6",
	});

	const resetForm = () => {
		setFormData({
			name: "",
			startTime: "",
			endTime: "",
			color: "#3b82f6",
		});
		setEditShift(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const url = editShift
				? `/api/settings/shifts/${editShift.id}`
				: "/api/settings/shifts";
			const method = editShift ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to save");

			const updatedShift = await response.json();

			if (editShift) {
				setShifts(
					shifts.map((s) => (s.id === updatedShift.id ? updatedShift : s))
				);
			} else {
				setShifts([...shifts, updatedShift]);
			}

			toast.success(
				editShift ? "Shift updated successfully" : "Shift created successfully"
			);
			setOpen(false);
			resetForm();
			router.refresh();
		} catch (error) {
			toast.error("Failed to save shift");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleEdit = (shift: Shift) => {
		setEditShift(shift);
		setFormData({
			name: shift.name,
			startTime: shift.startTime,
			endTime: shift.endTime,
			color: shift.color || "#3b82f6",
		});
		setOpen(true);
	};

	const handleToggleActive = async (id: string, currentActive: boolean) => {
		setShifts(
			shifts.map((s) => (s.id === id ? { ...s, isActive: !currentActive } : s))
		);

		try {
			const response = await fetch(`/api/settings/shifts/${id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ isActive: !currentActive }),
			});

			if (!response.ok) throw new Error("Failed to update");

			toast.success(currentActive ? "Shift disabled" : "Shift enabled");
			router.refresh();
		} catch (error) {
			setShifts(
				shifts.map((s) => (s.id === id ? { ...s, isActive: currentActive } : s))
			);
			toast.error("Failed to update shift");
			console.error(error);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this shift?")) return;

		const deletedShift = shifts.find((s) => s.id === id);
		setShifts(shifts.filter((s) => s.id !== id));

		try {
			const response = await fetch(`/api/settings/shifts/${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete");

			toast.success("Shift deleted successfully");
			router.refresh();
		} catch (error) {
			if (deletedShift) {
				setShifts([...shifts, deletedShift]);
			}
			toast.error("Failed to delete shift");
			console.error(error);
		}
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Shift Configuration</CardTitle>
						<CardDescription>
							Define production shifts for time-based reporting
						</CardDescription>
					</div>

					<Dialog
						open={open}
						onOpenChange={(o) => {
							setOpen(o);
							if (!o) resetForm();
						}}
					>
						<DialogTrigger asChild>
							<Button className="gap-2">
								<Plus className="h-4 w-4" />
								Add Shift
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{editShift ? "Edit Shift" : "Add New Shift"}
								</DialogTitle>
								<DialogDescription>
									Configure shift timings for production tracking
								</DialogDescription>
							</DialogHeader>

							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="name">
										Shift Name <span className="text-red-500">*</span>
									</Label>
									<Input
										id="name"
										placeholder="Morning Shift"
										value={formData.name}
										onChange={(e) =>
											setFormData({ ...formData, name: e.target.value })
										}
										required
										disabled={isLoading}
									/>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="startTime">
											Start Time <span className="text-red-500">*</span>
										</Label>
										<Input
											id="startTime"
											type="time"
											value={formData.startTime}
											onChange={(e) =>
												setFormData({ ...formData, startTime: e.target.value })
											}
											required
											disabled={isLoading}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="endTime">
											End Time <span className="text-red-500">*</span>
										</Label>
										<Input
											id="endTime"
											type="time"
											value={formData.endTime}
											onChange={(e) =>
												setFormData({ ...formData, endTime: e.target.value })
											}
											required
											disabled={isLoading}
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="color">Color</Label>
									<div className="flex gap-3">
										<Input
											id="color"
											type="color"
											value={formData.color}
											onChange={(e) =>
												setFormData({ ...formData, color: e.target.value })
											}
											className="w-20 h-10"
											disabled={isLoading}
										/>
										<Input
											value={formData.color}
											onChange={(e) =>
												setFormData({ ...formData, color: e.target.value })
											}
											placeholder="#3b82f6"
											className="flex-1"
											disabled={isLoading}
										/>
									</div>
								</div>

								<div className="flex justify-end gap-3 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setOpen(false);
											resetForm();
										}}
										disabled={isLoading}
									>
										Cancel
									</Button>
									<Button type="submit" disabled={isLoading}>
										{isLoading
											? "Saving..."
											: editShift
											? "Update Shift"
											: "Create Shift"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>

			<CardContent>
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Shift Name</TableHead>
								<TableHead>Timing</TableHead>
								<TableHead>Duration</TableHead>
								<TableHead>Color</TableHead>
								<TableHead className="text-center">Active</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{shifts.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-8 text-slate-500"
									>
										No shifts configured. Add your first shift to get started.
									</TableCell>
								</TableRow>
							) : (
								shifts.map((shift) => {
									const duration = calculateDuration(
										shift.startTime,
										shift.endTime
									);
									return (
										<TableRow key={shift.id}>
											<TableCell className="font-medium">
												{shift.name}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2 text-sm">
													<Clock className="h-4 w-4 text-slate-400" />
													{shift.startTime} - {shift.endTime}
												</div>
											</TableCell>
											<TableCell className="text-sm text-slate-600">
												{duration}
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div
														className="h-6 w-6 rounded border"
														style={{
															backgroundColor: shift.color || "#3b82f6",
														}}
													/>
													<span className="text-sm text-slate-600">
														{shift.color}
													</span>
												</div>
											</TableCell>
											<TableCell className="text-center">
												<Switch
													checked={shift.isActive}
													onCheckedChange={() =>
														handleToggleActive(shift.id, shift.isActive)
													}
												/>
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
														<DropdownMenuItem onClick={() => handleEdit(shift)}>
															<Pencil className="mr-2 h-4 w-4" />
															Edit
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															className="text-red-600"
															onClick={() => handleDelete(shift.id)}
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}

function calculateDuration(startTime: string, endTime: string): string {
	const [startHour, startMin] = startTime.split(":").map(Number);
	const [endHour, endMin] = endTime.split(":").map(Number);

	let durationMins = endHour * 60 + endMin - (startHour * 60 + startMin);

	if (durationMins < 0) {
		durationMins += 24 * 60;
	}

	const hours = Math.floor(durationMins / 60);
	const mins = durationMins % 60;

	return `${hours}h ${mins}m`;
}