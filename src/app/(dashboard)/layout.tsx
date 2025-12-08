import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { requireAuth } from "@/lib/auth-helper";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await requireAuth();

	return (
		<div className="flex h-screen overflow-hidden bg-slate-50">
			<Sidebar userRole={session.user.role} />

			<div className="flex flex-1 flex-col overflow-hidden md:ml-64">
				<Header user={session.user} />

				<main className="flex-1 overflow-y-auto bg-slate-50 p-6">
					{children}
				</main>
			</div>
		</div>
	);
}