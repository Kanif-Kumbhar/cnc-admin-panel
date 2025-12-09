"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Search } from "lucide-react";
import { format } from "date-fns";

interface DetailedReportTableProps {
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
			name: string;
		};
	}>;
}

export function DetailedReportTable({ stops }: DetailedReportTableProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredStops = stops.filter(
		(stop) =>
			stop.machine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			stop.reason.reasonText
				.toLowerCase()
				.includes(searchQuery.toLowerCase()) ||
			stop.reason.reasonCode.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const formatDuration = (seconds: number | null) => {
		if (!seconds) return "-";
		const hours = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;

		if (hours > 0) {
			return `${hours}h ${mins}m`;
		}
		return `${mins}m ${secs}s`;
	};

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			SAFETY: "bg-red-100 text-red-700",
			MECHANICAL: "bg-orange-100 text-orange-700",
			MATERIAL: "bg-yellow-100 text-yellow-700",
			QUALITY: "bg-blue-100 text-blue-700",
			SETUP: "bg-purple-100 text-purple-700",
			MAINTENANCE: "bg-pink-100 text-pink-700",
			OPERATOR: "bg-green-100 text-green-700",
			OTHER: "bg-slate-100 text-slate-700",
		};
		return colors[category] || colors.OTHER;
	};

	const handleExportExcel = () => {
		const csv = [
			[
				"Date/Time",
				"Machine",
				"Reason Code",
				"Reason",
				"Category",
				"Duration (min)",
			],
			...filteredStops.map((stop) => [
				format(new Date(stop.startTime), "yyyy-MM-dd HH:mm:ss"),
				stop.machine.name,
				stop.reason.reasonCode,
				stop.reason.reasonText,
				stop.reason.category,
				stop.duration ? Math.round(stop.duration / 60).toString() : "0",
			]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `detailed-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
		a.click();
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Detailed Stop Records</CardTitle>
					<Button variant="outline" size="sm" onClick={handleExportExcel}>
						<Download className="mr-2 h-4 w-4" />
						Export Excel
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{/* Search */}
				<div className="mb-4 flex items-center gap-4">
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<Input
							placeholder="Search stops..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
					<div className="text-sm text-slate-600">
						{filteredStops.length} of {stops.length} records
					</div>
				</div>

				{/* Table */}
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date/Time</TableHead>
								<TableHead>Machine</TableHead>
								<TableHead>Reason Code</TableHead>
								<TableHead>Reason</TableHead>
								<TableHead>Category</TableHead>
								<TableHead className="text-right">Duration</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredStops.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-8 text-slate-500"
									>
										No records found
									</TableCell>
								</TableRow>
							) : (
								filteredStops.map((stop) => (
									<TableRow key={stop.id}>
										<TableCell className="font-medium">
											{format(new Date(stop.startTime), "MMM dd, yyyy HH:mm")}
										</TableCell>
										<TableCell>{stop.machine.name}</TableCell>
										<TableCell>
											<Badge variant="outline">{stop.reason.reasonCode}</Badge>
										</TableCell>
										<TableCell className="max-w-xs">
											<div className="truncate">{stop.reason.reasonText}</div>
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={getCategoryColor(stop.reason.category)}
											>
												{stop.reason.category}
											</Badge>
										</TableCell>
										<TableCell className="text-right font-medium">
											{formatDuration(stop.duration)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}