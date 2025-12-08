import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
	title: string;
	value: string | number;
	description?: string;
	icon: LucideIcon;
	trend?: {
		value: number;
		label: string;
	};
	variant?: "default" | "success" | "warning" | "danger";
}

export function KpiCard({
	title,
	value,
	description,
	icon: Icon,
	trend,
	variant = "default",
}: KpiCardProps) {
	const variantStyles = {
		default: "bg-blue-50 text-blue-600",
		success: "bg-green-50 text-green-600",
		warning: "bg-yellow-50 text-yellow-600",
		danger: "bg-red-50 text-red-600",
	};

	return (
		<Card className="overflow-hidden transition-all hover:shadow-lg">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-slate-600">
					{title}
				</CardTitle>
				<div className={cn("rounded-lg p-2", variantStyles[variant])}>
					<Icon className="h-5 w-5" />
				</div>
			</CardHeader>
			<CardContent>
				<div className="text-3xl font-bold text-slate-900">{value}</div>

				{description && (
					<p className="mt-1 text-sm text-slate-500">{description}</p>
				)}

				{trend && (
					<div className="mt-2 flex items-center gap-1">
						<span
							className={cn(
								"text-sm font-medium",
								trend.value > 0
									? "text-green-600"
									: trend.value < 0
									? "text-red-600"
									: "text-slate-500"
							)}
						>
							{trend.value > 0 ? "+" : ""}
							{trend.value}%
						</span>
						<span className="text-xs text-slate-500">{trend.label}</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}