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

interface EditUserDialogProps {
	user: {
		id: string;
		name: string;
		email: string;
		role: string;
		phone: string | null;
		telegramId: string | null;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
	user,
	open,
	onOpenChange,
}: EditUserDialogProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState({
		name: user.name,
		email: user.email,
		role: user.role,
		phone: user.phone || "",
		telegramId: user.telegramId || "",
	});

	useEffect(() => {
		setFormData({
			name: user.name,
			email: user.email,
			role: user.role,
			phone: user.phone || "",
			telegramId: user.telegramId || "",
		});
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch(`/api/users/${user.id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to update");
			}

			toast.success("User updated successfully");
			onOpenChange(false);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to update user"
			);
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit User</DialogTitle>
					<DialogDescription>Update user information</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="edit-name">
							Full Name <span className="text-red-500">*</span>
						</Label>
						<Input
							id="edit-name"
							value={formData.name}
							onChange={(e) =>
								setFormData({ ...formData, name: e.target.value })
							}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-email">
							Email <span className="text-red-500">*</span>
						</Label>
						<Input
							id="edit-email"
							type="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="edit-role">
								Role <span className="text-red-500">*</span>
							</Label>
							<Select
								value={formData.role}
								onValueChange={(value) =>
									setFormData({ ...formData, role: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="edit-role">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ADMIN">Admin</SelectItem>
									<SelectItem value="SUPERVISOR">Supervisor</SelectItem>
									<SelectItem value="OPERATOR">Operator</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="edit-phone">Phone</Label>
							<Input
								id="edit-phone"
								type="tel"
								value={formData.phone}
								onChange={(e) =>
									setFormData({ ...formData, phone: e.target.value })
								}
								disabled={isLoading}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="edit-telegramId">Telegram ID</Label>
						<Input
							id="edit-telegramId"
							value={formData.telegramId}
							onChange={(e) =>
								setFormData({ ...formData, telegramId: e.target.value })
							}
							disabled={isLoading}
						/>
						<p className="text-xs text-slate-500">
							For receiving notifications via Telegram bot
						</p>
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
							{isLoading ? "Updating..." : "Update User"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}