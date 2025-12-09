import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "@/components/settings/GeneralSettings";
import { ShiftSettings } from "@/components/settings/ShiftSettings";
import { AlertSettings } from "@/components/settings/AlertSettings";
import { DefaultSettings } from "@/components/settings/DefaultSettings";

async function getSettings() {
	const settings = await db.setting.findMany({
		orderBy: { key: "asc" },
	});

	const grouped = settings.reduce<Record<string, Record<string, string>>>(
		(acc, setting) => {
			const category = setting.category || "OTHER";
			if (!acc[category]) acc[category] = {};
			acc[category][setting.key] = setting.value;
			return acc;
		},
		{}
	);

	return grouped;
}

async function getShifts() {
	return await db.shift.findMany({
		orderBy: { sortOrder: "asc" },
	});
}

export default async function SettingsPage() {
	await requireAuth(["ADMIN"]);
	const settings = await getSettings();
	const shifts = await getShifts();

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-900">Settings</h1>
				<p className="mt-1 text-sm text-slate-600">
					Configure system-wide settings and preferences
				</p>
			</div>

			<div suppressHydrationWarning>
				<Tabs defaultValue="general" className="space-y-6">
					<TabsList className="grid w-full grid-cols-4 lg:w-auto">
						<TabsTrigger value="general">General</TabsTrigger>
						<TabsTrigger value="shifts">Shifts</TabsTrigger>
						<TabsTrigger value="alerts">Alerts</TabsTrigger>
						<TabsTrigger value="defaults">Defaults</TabsTrigger>
					</TabsList>

					<TabsContent value="general">
						<GeneralSettings settings={settings.GENERAL || {}} />
					</TabsContent>

					<TabsContent value="shifts">
						<ShiftSettings shifts={shifts} />
					</TabsContent>

					<TabsContent value="alerts">
						<AlertSettings settings={settings.ALERTS || {}} />
					</TabsContent>

					<TabsContent value="defaults">
						<DefaultSettings settings={settings.DEFAULTS || {}} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}