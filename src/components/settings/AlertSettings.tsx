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
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Bell, AlertTriangle } from "lucide-react";

interface AlertSettingsProps {
	settings: Record<string, string>;
}

export function AlertSettings({
	settings: initialSettings,
}: AlertSettingsProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		alertDowntimeThreshold: initialSettings.alertDowntimeThreshold || "300",
		alertCriticalDowntime: initialSettings.alertCriticalDowntime || "900",
		alertToolChangeOverrun: initialSettings.alertToolChangeOverrun || "180",
		enableEmailAlerts: initialSettings.enableEmailAlerts === "true",
		enableTelegramAlerts: initialSettings.enableTelegramAlerts === "true",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch("/api/settings/alerts", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(formData),
			});

			if (!response.ok) throw new Error("Failed to save");

			toast.success("Alert settings saved successfully");
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
					<CardTitle>Alert & Notification Settings</CardTitle>
					<CardDescription>
						Configure thresholds and channels for automated alerts
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Thresholds */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium flex items-center gap-2">
							<AlertTriangle className="h-4 w-4" />
							Alert Thresholds
						</h3>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="alertDowntimeThreshold">
									Downtime Alert (seconds)
								</Label>
								<Input
									id="alertDowntimeThreshold"
									type="number"
									min="60"
									max="7200"
									value={formData.alertDowntimeThreshold}
									onChange={(e) =>
										setFormData({
											...formData,
											alertDowntimeThreshold: e.target.value,
										})
									}
									disabled={isLoading}
								/>
								<p className="text-xs text-slate-500">
									Alert when stop exceeds{" "}
									{Math.floor(Number(formData.alertDowntimeThreshold) / 60)}{" "}
									minutes
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="alertCriticalDowntime">
									Critical Downtime (seconds)
								</Label>
								<Input
									id="alertCriticalDowntime"
									type="number"
									min="300"
									max="14400"
									value={formData.alertCriticalDowntime}
									onChange={(e) =>
										setFormData({
											...formData,
											alertCriticalDowntime: e.target.value,
										})
									}
									disabled={isLoading}
								/>
								<p className="text-xs text-slate-500">
									Critical alert at{" "}
									{Math.floor(Number(formData.alertCriticalDowntime) / 60)}{" "}
									minutes
								</p>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="alertToolChangeOverrun">
								Tool Change Overrun (seconds)
							</Label>
							<Input
								id="alertToolChangeOverrun"
								type="number"
								min="30"
								max="1800"
								value={formData.alertToolChangeOverrun}
								onChange={(e) =>
									setFormData({
										...formData,
										alertToolChangeOverrun: e.target.value,
									})
								}
								disabled={isLoading}
							/>
							<p className="text-xs text-slate-500">
								Alert when tool change exceeds standard time by{" "}
								{formData.alertToolChangeOverrun} seconds
							</p>
						</div>
					</div>

					<div className="border-t pt-6">
						<h3 className="text-sm font-medium flex items-center gap-2 mb-4">
							<Bell className="h-4 w-4" />
							Notification Channels
						</h3>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="enableEmailAlerts">Email Notifications</Label>
									<p className="text-sm text-slate-500">
										Send alerts via email to configured recipients
									</p>
								</div>
								<Switch
									id="enableEmailAlerts"
									checked={formData.enableEmailAlerts}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, enableEmailAlerts: checked })
									}
									disabled={isLoading}
								/>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label htmlFor="enableTelegramAlerts">
										Telegram Notifications
									</Label>
									<p className="text-sm text-slate-500">
										Send alerts via Telegram bot (requires bot configuration)
									</p>
								</div>
								<Switch
									id="enableTelegramAlerts"
									checked={formData.enableTelegramAlerts}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, enableTelegramAlerts: checked })
									}
									disabled={isLoading}
								/>
							</div>
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