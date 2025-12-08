import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { cache } from "react";

// Cached auth check for performance
export const getCurrentUser = cache(async () => {
	const session = await auth();
	return session?.user;
});

// Server-side auth requirement
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

// Check if user has permission (for conditional rendering)
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
