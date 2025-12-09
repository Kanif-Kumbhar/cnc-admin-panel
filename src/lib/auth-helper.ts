import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
	const session = await auth();
	return session?.user;
});

export async function requireAuth(allowedRoles?: string[]) {
	const session = await auth();

	if (!session?.user) {
		redirect("/login");
	}

	if (allowedRoles && !allowedRoles.includes(session.user.role)) {
		redirect("/dashboard");
	}

	return session;
}

export async function requireAuthAPI(allowedRoles?: string[]) {
	const session = await auth();

	if (!session?.user) {
		return {
			error: "Unauthorized - Please login",
			status: 401,
			session: null,
		};
	}

	if (allowedRoles && !allowedRoles.includes(session.user.role)) {
		return {
			error: "Forbidden - Insufficient permissions",
			status: 403,
			session: null,
		};
	}

	return {
		error: null,
		status: 200,
		session,
	};
}

export async function hasPermission(requiredRole: string | string[]) {
	const session = await auth();

	if (!session?.user) {
		return false;
	}

	const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
	return roles.includes(session.user.role);
}

const roleHierarchy = {
	ADMIN: 3,
	SUPERVISOR: 2,
	OPERATOR: 1,
};

export async function hasMinimumRole(minimumRole: keyof typeof roleHierarchy) {
	const session = await auth();

	if (!session?.user) {
		return false;
	}

	const userRoleLevel =
		roleHierarchy[session.user.role as keyof typeof roleHierarchy] || 0;
	const requiredLevel = roleHierarchy[minimumRole];

	return userRoleLevel >= requiredLevel;
}

export async function getUserRoleLevel() {
	const session = await auth();

	if (!session?.user) {
		return 0;
	}

	return roleHierarchy[session.user.role as keyof typeof roleHierarchy] || 0;
}

export async function canManageUser(targetUserRole: string) {
	const currentLevel = await getUserRoleLevel();
	const targetLevel =
		roleHierarchy[targetUserRole as keyof typeof roleHierarchy] || 0;

	return currentLevel > targetLevel;
}