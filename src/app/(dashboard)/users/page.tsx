import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helper";
import { UsersTable } from "@/components/users/UsersTable";
import { AddUserDialog } from "@/components/users/AddUserDialog";

async function getUsers() {
	const users = await db.user.findMany({
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			phone: true,
			telegramId: true,
			createdAt: true,
			updatedAt: true,
			_count: {
				select: {
					stops: true,
				},
			},
		},
	});

	return users;
}

export default async function UsersPage() {
	await requireAuth(["ADMIN"]);
	const users = await getUsers();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Users</h1>
					<p className="mt-1 text-sm text-slate-600">
						Manage system users and their permissions
					</p>
				</div>

				<AddUserDialog />
			</div>

			<UsersTable users={users} />
		</div>
	);
}