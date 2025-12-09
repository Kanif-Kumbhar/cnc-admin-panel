"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface GeneralSettingsProps {
	settings: Record<string, string>;
}

export function GeneralSettings({
	settings: initialSettings,
}: GeneralSettingsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		companyName: initialSettings.companyName || "",
		timezone: initialSettings.timezone || "Asia/Kolkata",
		dateFormat: initialSettings.dateFormat || "DD/MM/YYYY",
		timeFormat: initialSettings.timeFormat || "24h",
		language: initialSettings.language || "en",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch("/api/settings/general", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to save");

			toast.success("Settings saved successfully");
			router.refresh();
		} catch (error) {
			toast.error("Failed to save settings");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>General Settings</CardTitle>
					<CardDescription>
						Configure basic system settings and preferences
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="companyName">Company Name</Label>
						<Input
							id="companyName"
							placeholder="Acme Manufacturing Ltd."
							value={formData.companyName}
							onChange={(e) =>
								setFormData({ ...formData, companyName: e.target.value })
							}
							disabled={isLoading}
						/>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="timezone">Timezone</Label>
							<Select
								value={formData.timezone}
								onValueChange={(value) =>
									setFormData({ ...formData, timezone: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="timezone">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Asia/Kolkata">
										Asia/Kolkata (IST)
									</SelectItem>
									<SelectItem value="America/New_York">
										America/New York (EST)
									</SelectItem>
									<SelectItem value="Europe/London">
										Europe/London (GMT)
									</SelectItem>
									<SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
									<SelectItem value="Australia/Sydney">
										Australia/Sydney (AEST)
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="language">Language</Label>
							<Select
								value={formData.language}
								onValueChange={(value) =>
									setFormData({ ...formData, language: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="language">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="en">English</SelectItem>
									<SelectItem value="hi">हिंदी (Hindi)</SelectItem>
									<SelectItem value="mr">मराठी (Marathi)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="dateFormat">Date Format</Label>
							<Select
								value={formData.dateFormat}
								onValueChange={(value) =>
									setFormData({ ...formData, dateFormat: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="dateFormat">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="DD/MM/YYYY">
										DD/MM/YYYY (09/12/2025)
									</SelectItem>
									<SelectItem value="MM/DD/YYYY">
										MM/DD/YYYY (12/09/2025)
									</SelectItem>
									<SelectItem value="YYYY-MM-DD">
										YYYY-MM-DD (2025-12-09)
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="timeFormat">Time Format</Label>
							<Select
								value={formData.timeFormat}
								onValueChange={(value) =>
									setFormData({ ...formData, timeFormat: value })
								}
								disabled={isLoading}
							>
								<SelectTrigger id="timeFormat">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="24h">24 Hour (18:30)</SelectItem>
									<SelectItem value="12h">12 Hour (6:30 PM)</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="flex justify-end pt-4">
						<Button type="submit" disabled={isLoading} className="gap-2">
							<Save className="h-4 w-4" />
							{isLoading ? "Saving..." : "Save Settings"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</form>
	);
}