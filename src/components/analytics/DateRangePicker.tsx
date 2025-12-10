"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateRangePickerProps {
	startDate: Date;
	endDate: Date;
	onChange: (range: { startDate: Date; endDate: Date }) => void;
}

export function DateRangePicker({
	startDate,
	endDate,
	onChange,
}: DateRangePickerProps) {
	const presets = [
		{
			label: "Today",
			getValue: () => {
				const today = new Date();
				today.setHours(0, 0, 0, 0);
				const end = new Date();
				end.setHours(23, 59, 59, 999);
				return { startDate: today, endDate: end };
			},
		},
		{
			label: "Yesterday",
			getValue: () => {
				const yesterday = new Date();
				yesterday.setDate(yesterday.getDate() - 1);
				yesterday.setHours(0, 0, 0, 0);
				const end = new Date(yesterday);
				end.setHours(23, 59, 59, 999);
				return { startDate: yesterday, endDate: end };
			},
		},
		{
			label: "Last 7 Days",
			getValue: () => {
				const start = new Date();
				start.setDate(start.getDate() - 7);
				start.setHours(0, 0, 0, 0);
				return { startDate: start, endDate: new Date() };
			},
		},
		{
			label: "Last 30 Days",
			getValue: () => {
				const start = new Date();
				start.setDate(start.getDate() - 30);
				start.setHours(0, 0, 0, 0);
				return { startDate: start, endDate: new Date() };
			},
		},
		{
			label: "This Month",
			getValue: () => {
				const start = new Date();
				start.setDate(1);
				start.setHours(0, 0, 0, 0);
				return { startDate: start, endDate: new Date() };
			},
		},
	];

	return (
		<div className="flex flex-wrap gap-2">
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						className={cn(
							"justify-start text-left font-normal",
							!startDate && "text-muted-foreground"
						)}
					>
						<CalendarIcon className="mr-2 h-4 w-4" />
						{startDate && endDate ? (
							<>
								{format(startDate, "PPP")} - {format(endDate, "PPP")}
							</>
						) : (
							<span>Pick a date range</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<div className="p-3 space-y-2 border-b">
						<div className="text-sm font-medium">Quick Select</div>
						<div className="flex flex-wrap gap-2">
							{presets.map((preset) => (
								<Button
									key={preset.label}
									variant="outline"
									size="sm"
									onClick={() => onChange(preset.getValue())}
								>
									{preset.label}
								</Button>
							))}
						</div>
					</div>
					<div className="p-3">
						<div className="text-sm font-medium mb-2">Custom Range</div>
						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className="text-xs text-slate-600">Start Date</label>
								<Calendar
									mode="single"
									selected={startDate}
									onSelect={(date) =>
										date && onChange({ startDate: date, endDate })
									}
									disabled={(date) => date > new Date() || date > endDate}
								/>
							</div>
							<div>
								<label className="text-xs text-slate-600">End Date</label>
								<Calendar
									mode="single"
									selected={endDate}
									onSelect={(date) =>
										date && onChange({ startDate, endDate: date })
									}
									disabled={(date) => date > new Date() || date < startDate}
								/>
							</div>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}