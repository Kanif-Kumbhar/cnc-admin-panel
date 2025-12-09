"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

interface ChangePasswordDialogProps {
	user: {
		id: string;
		name: string;
		email: string;
	};
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({
	user,
	open,
	onOpenChange,
}: ChangePasswordDialogProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		newPassword: "",
		confirmPassword: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (formData.newPassword !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (formData.newPassword.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch(`/api/users/${user.id}/password`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password: formData.newPassword }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to change password");
			}

			toast.success("Password changed successfully");
			setFormData({ newPassword: "", confirmPassword: "" });
			onOpenChange(false);
			router.refresh();
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to change password"
			);
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px]">
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Change password for <strong>{user.name}</strong> ({user.email})
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="newPassword">
							New Password <span className="text-red-500">*</span>
						</Label>
						<div className="relative">
							<Input
								id="newPassword"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={formData.newPassword}
								onChange={(e) =>
									setFormData({ ...formData, newPassword: e.target.value })
								}
								required
								minLength={6}
								disabled={isLoading}
								className="pr-10"
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-0 top-0 h-full"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4 text-slate-400" />
								) : (
									<Eye className="h-4 w-4 text-slate-400" />
								)}
							</Button>
						</div>
						<p className="text-xs text-slate-500">
							Password must be at least 6 characters long
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">
							Confirm Password <span className="text-red-500">*</span>
						</Label>
						<Input
							id="confirmPassword"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData({ ...formData, confirmPassword: e.target.value })
							}
							required
							minLength={6}
							disabled={isLoading}
						/>
					</div>

					{formData.newPassword &&
						formData.confirmPassword &&
						formData.newPassword !== formData.confirmPassword && (
							<p className="text-sm text-red-600">Passwords do not match</p>
						)}

					<div className="flex justify-end gap-3 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setFormData({ newPassword: "", confirmPassword: "" });
								onOpenChange(false);
							}}
							disabled={isLoading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Changing..." : "Change Password"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}