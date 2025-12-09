"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AddStopReasonDialog() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		reasonCode: "",
		reasonText: "",
		category: "OTHER",
		detectionType: "MANUAL",
		standardDuration: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch("/api/stop-reasons", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					standardDuration: formData.standardDuration
						? parseInt(formData.standardDuration) * 60
						: null,
				}),
			});

			if (!response.ok) throw new Error("Failed to create");

			toast.success("Stop reason created successfully");
			setOpen(false);
			setFormData({
				reasonCode: "",
				reasonText: "",
				category: "OTHER",
				detectionType: "MANUAL",
				standardDuration: "",
			});
			router.refresh();
		} catch (error) {
			toast.error("Failed to create stop reason");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button className="gap-2">
					<Plus className="h-4 w-4" />
					Add Stop Reason
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add Stop Reason</DialogTitle>
					<DialogDescription>
						Create a new stop reason code for tracking machine downtime
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="reasonCode">
								Reason Code <span className="text-red-500">*</span>
							</Label>
							<Input
								id="reasonCode"
								placeholder="R01"
								value={formData.reasonCode}
								onChange={(e) =>
									setFormData({
										...formData,
										reasonCode: e.target.value.toUpperCase(),
									})
								}
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="category">
								Category <span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="category">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="SAFETY">Safety</SelectItem>
									<SelectItem value="MECHANICAL">Mechanical</SelectItem>
									<SelectItem value="MATERIAL">Material</SelectItem>
									<SelectItem value="QUALITY">Quality</SelectItem>
									<SelectItem value="SETUP">Setup</SelectItem>
									<SelectItem value="MAINTENANCE">Maintenance</SelectItem>
									<SelectItem value="OPERATOR">Operator</SelectItem>
									<SelectItem value="OTHER">Other</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="reasonText">
							Reason Text <span className="text-red-500">*</span>
						</Label>
						<Input
							id="reasonText"
							placeholder="Tool Change"
							value={formData.reasonText}
							onChange={(e) =>
								setFormData({ ...formData, reasonText: e.target.value })
							}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="detectionType">Detection Type</Label>
							<Select
								value={formData.detectionType}
								onValueChange={(value) =>
									setFormData({ ...formData, detectionType: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="detectionType">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="AUTOMATIC">Automatic</SelectItem>
									<SelectItem value="MANUAL">Manual</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="standardDuration">Standard Time (minutes)</Label>
							<Input
								id="standardDuration"
								type="number"
								placeholder="3"
								value={formData.standardDuration}
								onChange={(e) =>
									setFormData({ ...formData, standardDuration: e.target.value })
								}
								disabled={isLoading}
							/>
						</div>
					</div>

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Creating..." : "Create Stop Reason"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}