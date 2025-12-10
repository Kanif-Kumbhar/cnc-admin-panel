"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICards } from "./KPICards";
import { OEEChart } from "./OEEChart";
import { DowntimeChart } from "./DownTimeChart";
import { ProductionChart } from "./ProductionChart";
import { DateRangePicker } from "./DateRangePicker";
import { MachineFilter } from "./MachineFilter";

const getInitialDateRange = () => {
	const endDate = new Date();
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 7); // Last 7 days
	return { startDate, endDate };
};

export function AnalyticsDashboard() {
	const [dateRange, setDateRange] = useState(getInitialDateRange);
	const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

	return (
		<div className="space-y-6">
			{/* Filters */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-wrap gap-4">
						<DateRangePicker
							startDate={dateRange.startDate}
							endDate={dateRange.endDate}
							onChange={setDateRange}
						/>
						<MachineFilter
							selectedMachine={selectedMachine}
							onChange={setSelectedMachine}
						/>
					</div>
				</CardContent>
			</Card>

			{/* KPI Cards */}
			<KPICards
				machineId={selectedMachine}
				startDate={dateRange.startDate}
				endDate={dateRange.endDate}
			/>

			{/* Charts */}
			<Tabs defaultValue="oee" className="space-y-6">
				<TabsList>
					<TabsTrigger value="oee">OEE</TabsTrigger>
					<TabsTrigger value="downtime">Downtime</TabsTrigger>
					<TabsTrigger value="production">Production</TabsTrigger>
					<TabsTrigger value="shifts">Shifts</TabsTrigger>
				</TabsList>

				<TabsContent value="oee">
					<OEEChart
						machineId={selectedMachine}
						startDate={dateRange.startDate}
						endDate={dateRange.endDate}
					/>
				</TabsContent>

				<TabsContent value="downtime">
					<DowntimeChart
						machineId={selectedMachine}
						startDate={dateRange.startDate}
						endDate={dateRange.endDate}
					/>
				</TabsContent>

				<TabsContent value="production">
					<ProductionChart
						machineId={selectedMachine}
						startDate={dateRange.startDate}
						endDate={dateRange.endDate}
					/>
				</TabsContent>

				<TabsContent value="shifts">
					<Card>
						<CardHeader>
							<CardTitle>Shift Performance</CardTitle>
							<CardDescription>Coming soon...</CardDescription>
						</CardHeader>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}