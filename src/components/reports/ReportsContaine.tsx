"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportFilters } from "./ReportFilters";
import { ReportSummary } from "./ReportSummary";
import { DowntimeChart } from "./DownTimeChart";
import { StopReasonsChart } from "./StopReasonsChart";
import { DetailedReportTable } from "./DetailedReportTable";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

interface ReportsContainerProps {
	stops: Array<{
		id: string;
		startTime: Date;
		duration: number | null;
		reason: {
			reasonCode: string;
			reasonText: string;
			category: string;
		};
		machine: {
			id: string;
			name: string;
		};
	}>;
	machines: Array<{
		id: string;
		name: string;
	}>;
	initialDateRange: {
		from: Date;
		to: Date;
	};
}

export function ReportsContainer({
	stops,
	machines,
	initialDateRange,
}: ReportsContainerProps) {
	const [dateRange, setDateRange] = useState(initialDateRange);
	const [selectedMachine, setSelectedMachine] = useState<string>("all");
	const [activeTab, setActiveTab] = useState("daily");

	const filteredStops = stops.filter((stop) => {
		const inDateRange =
			new Date(stop.startTime) >= dateRange.from &&
			new Date(stop.startTime) <= dateRange.to;
		const matchesMachine =
			selectedMachine === "all" || stop.machine.id === selectedMachine;
		return inDateRange && matchesMachine;
	});

	const handleQuickFilter = (type: "week" | "month") => {
		const now = new Date();
		if (type === "week") {
			setDateRange({
				from: startOfWeek(now),
				to: endOfWeek(now),
			});
		} else {
			setDateRange({
				from: startOfMonth(now),
				to: endOfMonth(now),
			});
		}
	};

	return (
		<div className="space-y-6">
			<ReportFilters
				dateRange={dateRange}
				onDateRangeChange={setDateRange}
				selectedMachine={selectedMachine}
				onMachineChange={setSelectedMachine}
				machines={machines}
				onQuickFilter={handleQuickFilter}
			/>

			<ReportSummary stops={filteredStops} />

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList>
					<TabsTrigger value="daily">Daily View</TabsTrigger>
					<TabsTrigger value="analysis">Analysis</TabsTrigger>
					<TabsTrigger value="detailed">Detailed Report</TabsTrigger>
				</TabsList>

				<TabsContent value="daily" className="space-y-6">
					<DowntimeChart stops={filteredStops} />
					<StopReasonsChart stops={filteredStops} />
				</TabsContent>

				<TabsContent value="analysis" className="space-y-6">
					<StopReasonsChart stops={filteredStops} type="category" />
					<StopReasonsChart stops={filteredStops} type="pareto" />
				</TabsContent>

				<TabsContent value="detailed">
					<DetailedReportTable stops={filteredStops} />
				</TabsContent>
			</Tabs>
		</div>
	);
}