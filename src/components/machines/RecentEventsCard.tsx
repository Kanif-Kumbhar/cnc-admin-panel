import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface RecentEventsCardProps {
	events: Array<{
		id: string;
		eventType: string;
		timestamp: Date;
		severity: string | null;
		message: string | null;
	}>;
}

export function RecentEventsCard({ events }: RecentEventsCardProps) {
	const getSeverityColor = (severity: string | null) => {
		const colors: Record<string, string> = {
			INFO: "bg-blue-100 text-blue-700",
			WARNING: "bg-yellow-100 text-yellow-700",
			ERROR: "bg-red-100 text-red-700",
		};
		return colors[severity || "INFO"] || colors.INFO;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Events</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{events.length === 0 ? (
						<p className="text-center py-8 text-sm text-slate-500">
							No events recorded
						</p>
					) : (
						events.slice(0, 10).map((event) => (
							<div
								key={event.id}
								className="flex items-start gap-3 rounded-lg border p-3"
							>
								<Badge
									variant="outline"
									className={getSeverityColor(event.severity)}
								>
									{event.severity || "INFO"}
								</Badge>
								<div className="flex-1 space-y-1">
									<p className="text-sm font-medium text-slate-900">
										{event.eventType}
									</p>
									{event.message && (
										<p className="text-sm text-slate-600">{event.message}</p>
									)}
									<p className="text-xs text-slate-500">
										{formatDistanceToNow(new Date(event.timestamp), {
											addSuffix: true,
										})}
									</p>
								</div>
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}