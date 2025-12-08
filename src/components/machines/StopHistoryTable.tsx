"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface StopHistoryTableProps {
	stops: Array<{
		id: string;
		startTime: Date;
		endTime: Date | null;
		duration: number | null;
		notes: string | null;
		isResolved: boolean;
		reason: {
			reasonCode: string;
			reasonText: string;
			category: string;
		};
		operator: {
			name: string;
			email: string;
		} | null;
	}>;
	machineId: string;
}

export function StopHistoryTable({ stops }: StopHistoryTableProps) {
	const formatDuration = (seconds: number | null) => {
		if (!seconds) return "-";
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
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

	const handleExport = () => {
		const csv = [
			[
				"Date/Time",
				"Reason",
				"Category",
				"Duration",
				"Operator",
				"Status",
				"Notes",
			],
			...stops.map((stop) => [
				format(new Date(stop.startTime), "yyyy-MM-dd HH:mm"),
				`${stop.reason.reasonCode} - ${stop.reason.reasonText}`,
				stop.reason.category,
				formatDuration(stop.duration),
				stop.operator?.name || "-",
				stop.isResolved ? "Resolved" : "Active",
				stop.notes || "-",
			]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csv], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `stop-history-${new Date().toISOString()}.csv`;
		a.click();
	};

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>Stop History</CardTitle>
					<Button variant="outline" size="sm" onClick={handleExport}>
						<Download className="mr-2 h-4 w-4" />
						Export CSV
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				<div className="rounded-lg border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Date/Time</TableHead>
								<TableHead>Reason</TableHead>
								<TableHead>Category</TableHead>
								<TableHead>Duration</TableHead>
								<TableHead>Operator</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{stops.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={6}
										className="text-center py-8 text-slate-500"
									>
										No stops recorded
									</TableCell>
								</TableRow>
							) : (
								stops.map((stop) => (
									<TableRow key={stop.id}>
										<TableCell className="font-medium">
											{format(new Date(stop.startTime), "MMM dd, HH:mm")}
										</TableCell>
										<TableCell>
											<div>
												<span className="font-medium">
													{stop.reason.reasonCode}
												</span>
												<p className="text-sm text-slate-600">
													{stop.reason.reasonText}
												</p>
											</div>
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={getCategoryColor(stop.reason.category)}
											>
												{stop.reason.category}
											</Badge>
										</TableCell>
										<TableCell>{formatDuration(stop.duration)}</TableCell>
										<TableCell className="text-sm text-slate-600">
											{stop.operator?.name || "-"}
										</TableCell>
										<TableCell>
											<Badge variant={stop.isResolved ? "outline" : "default"}>
												{stop.isResolved ? "Resolved" : "Active"}
											</Badge>
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