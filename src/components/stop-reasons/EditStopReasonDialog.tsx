"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface EditStopReasonDialogProps {
	stopReason: {
		id: string;
		reasonCode: string;
		reasonText: string;
		category: string;
		detectionType: string;
		standardDuration: number | null;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditStopReasonDialog({
	stopReason,
	open,
	onOpenChange,
}: EditStopReasonDialogProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		reasonCode: stopReason.reasonCode,
		reasonText: stopReason.reasonText,
		category: stopReason.category,
		detectionType: stopReason.detectionType,
		standardDuration: stopReason.standardDuration
			? Math.round(stopReason.standardDuration / 60).toString()
			: "",
	});

	useEffect(() => {
		setFormData({
			reasonCode: stopReason.reasonCode,
			reasonText: stopReason.reasonText,
			category: stopReason.category,
			detectionType: stopReason.detectionType,
			standardDuration: stopReason.standardDuration
				? Math.round(stopReason.standardDuration / 60).toString()
				: "",
		});
	}, [stopReason]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch(`/api/stop-reasons/${stopReason.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					standardDuration: formData.standardDuration
						? parseInt(formData.standardDuration) * 60
						: null,
				}),
			});

			if (!response.ok) throw new Error("Failed to update");

			toast.success("Stop reason updated successfully");
			onOpenChange(false);
			router.refresh();
		} catch (error) {
			toast.error("Failed to update stop reason");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Stop Reason</DialogTitle>
					<DialogDescription>Update stop reason details</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="edit-reasonCode">
								Reason Code <span className="text-red-500">*</span>
							</Label>
							<Input
								id="edit-reasonCode"
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
							<Label htmlFor="edit-category">
								Category <span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="edit-category">
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
						<Label htmlFor="edit-reasonText">
							Reason Text <span className="text-red-500">*</span>
						</Label>
						<Input
							id="edit-reasonText"
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
							<Label htmlFor="edit-detectionType">Detection Type</Label>
							<Select
								value={formData.detectionType}
								onValueChange={(value) =>
									setFormData({ ...formData, detectionType: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="edit-detectionType">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="AUTOMATIC">Automatic</SelectItem>
									<SelectItem value="MANUAL">Manual</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-standardDuration">
								Standard Time (minutes)
							</Label>
							<Input
								id="edit-standardDuration"
								type="number"
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
							onClick={() => onOpenChange(false)}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Updating..." : "Update Stop Reason"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}