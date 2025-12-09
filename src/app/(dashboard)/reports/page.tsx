import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helper";
import { ReportsContainer } from "@/components/reports/ReportsContaine";
import { startOfDay, endOfDay, subDays } from "date-fns";

async function getReportsData(startDate: Date, endDate: Date) {
	const [stops, machines] = await Promise.all([
		db.stop.findMany({
			where: {
				startTime: {
					gte: startDate,
					lte: endDate,
				},
			},
			include: {
				reason: true,
				machine: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: {
				startTime: "desc",
			},
		}),
		db.machine.findMany({
			where: { isActive: true },
			select: {
				id: true,
				name: true,
			},
			orderBy: {
				name: "asc",
			},
		}),
	]);

	return { stops, machines };
}

export default async function ReportsPage({
	searchParams,
}: {
	searchParams: Promise<{
		from?: string;
		to?: string;
		machineId?: string;
	}>;
}) {
	await requireAuth(["ADMIN", "SUPERVISOR"]);

	const params = await searchParams;

	const startDate = params.from
		? new Date(params.from)
		: startOfDay(subDays(new Date(), 7));

	const endDate = params.to ? new Date(params.to) : endOfDay(new Date());

	const { stops, machines } = await getReportsData(startDate, endDate);

	const filteredStops = params.machineId
		? stops.filter((stop) => stop.machine.id === params.machineId)
		: stops;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-slate-900">
					Reports & Analytics
				</h1>
				<p className="mt-1 text-sm text-slate-600">
					Analyze machine performance and downtime patterns
				</p>
			</div>

			<ReportsContainer
				stops={filteredStops}
				machines={machines}
				initialDateRange={{
					from: startDate,
					to: endDate,
				}}
			/>
		</div>
	);
}