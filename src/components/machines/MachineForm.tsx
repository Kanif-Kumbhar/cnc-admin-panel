"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface MachineFormProps {
	machine?: {
		id: string;
		name: string;
		model: string;
		controller: string;
		ipAddress: string | null;
		opcPort: number | null;
		location: string | null;
		status: string;
		serialNumber: string | null;
		manufacturer: string | null;
	};
	mode: "create" | "edit";
}

export function MachineForm({ machine, mode }: MachineFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		name: machine?.name || "",
		model: machine?.model || "",
		controller: machine?.controller || "",
		ipAddress: machine?.ipAddress || "",
		opcPort: machine?.opcPort?.toString() || "",
		location: machine?.location || "",
		status: machine?.status || "OFFLINE",
		serialNumber: machine?.serialNumber || "",
		manufacturer: machine?.manufacturer || "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const url =
				mode === "create" ? "/api/machines" : `/api/machines/${machine?.id}`;

			const method = mode === "create" ? "POST" : "PUT";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					...formData,
					opcPort: formData.opcPort ? parseInt(formData.opcPort) : null,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save machine");
			}

			toast.success(
				mode === "create"
					? "Machine created successfully"
					: "Machine updated successfully"
			);

			router.push("/machines");
			router.refresh();
		} catch (error) {
			toast.error("Failed to save machine");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<form onSubmit={handleSubmit}>
			<div className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>Basic Information</CardTitle>
						<CardDescription>
							Essential machine identification details
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">
									Machine Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="name"
									placeholder="CNC-001"
									value={formData.name}
									onChange={(e) => handleChange("name", e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="model">
									Model <span className="text-red-500">*</span>
								</Label>
								<Input
									id="model"
									placeholder="MTAB COMPACT MILL"
									value={formData.model}
									onChange={(e) => handleChange("model", e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="controller">
									Controller <span className="text-red-500">*</span>
								</Label>
								<Input
									id="controller"
									placeholder="Siemens 828D"
									value={formData.controller}
									onChange={(e) => handleChange("controller", e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">
									Status <span className="text-red-500">*</span>
								</Label>
								<Select
									value={formData.status}
									onValueChange={(value) => handleChange("status", value)}
									disabled={isLoading}
								>
									<SelectTrigger id="status">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="ONLINE">Online</SelectItem>
										<SelectItem value="OFFLINE">Offline</SelectItem>
										<SelectItem value="RUNNING">Running</SelectItem>
										<SelectItem value="IDLE">Idle</SelectItem>
										<SelectItem value="ERROR">Error</SelectItem>
										<SelectItem value="MAINTENANCE">Maintenance</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-2">
								<Label htmlFor="serialNumber">Serial Number</Label>
								<Input
									id="serialNumber"
									placeholder="MTAB-2024-001"
									value={formData.serialNumber}
									onChange={(e) => handleChange("serialNumber", e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="manufacturer">Manufacturer</Label>
								<Input
									id="manufacturer"
									placeholder="MTAB Engineering"
									value={formData.manufacturer}
									onChange={(e) => handleChange("manufacturer", e.target.value)}
									disabled={isLoading}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Network Configuration</CardTitle>
						<CardDescription>OPC UA connection settings</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="ipAddress">IP Address</Label>
								<Input
									id="ipAddress"
									placeholder="192.168.10.10"
									value={formData.ipAddress}
									onChange={(e) => handleChange("ipAddress", e.target.value)}
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="opcPort">OPC UA Port</Label>
								<Input
									id="opcPort"
									type="number"
									placeholder="4840"
									value={formData.opcPort}
									onChange={(e) => handleChange("opcPort", e.target.value)}
									disabled={isLoading}
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Location</CardTitle>
						<CardDescription>Physical location in the facility</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label htmlFor="location">Location</Label>
							<Input
								id="location"
								placeholder="Shop Floor A - Section 1"
								value={formData.location}
								onChange={(e) => handleChange("location", e.target.value)}
								disabled={isLoading}
							/>
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center gap-4">
					<Button type="submit" disabled={isLoading} className="min-w-32">
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : mode === "create" ? (
							"Create Machine"
						) : (
							"Update Machine"
						)}
					</Button>

					<Button
						type="button"
						variant="outline"
						onClick={() => router.back()}
						disabled={isLoading}
					>
						Cancel
					</Button>
				</div>
			</div>
		</form>
	);
}