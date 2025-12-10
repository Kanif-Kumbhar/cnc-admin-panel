import { requireAuth } from "@/lib/auth-helper";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export default async function AnalyticsPage() {
	await requireAuth(["ADMIN", "SUPERVISOR"]);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-900">
					Analytics & Reports
				</h1>
				<p className="mt-1 text-sm text-slate-600">
					Production insights and performance metrics
				</p>
			</div>

			<AnalyticsDashboard />
		</div>
	);
}