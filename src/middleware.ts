import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
	const { nextUrl } = req;
	const isLoggedIn = !!req.auth;

	// Public routes that don't require authentication
	const publicRoutes = ["/login", "/api/auth"];
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const isPublicRoute = publicRoutes.some((route) =>
		nextUrl.pathname.startsWith(route)
	);

	// Protected routes
	const protectedRoutes = [
		"/dashboard",
		"/machines",
		"/reports",
		"/settings",
		"/users",
		"/stop-reasons",
	];
	const isProtectedRoute = protectedRoutes.some((route) =>
		nextUrl.pathname.startsWith(route)
	);

	if (isProtectedRoute && !isLoggedIn) {
		const loginUrl = new URL("/login", nextUrl.origin);
		loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
		return NextResponse.redirect(loginUrl);
	}

	if (nextUrl.pathname === "/login" && isLoggedIn) {
		return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
	}

	if (nextUrl.pathname === "/" && isLoggedIn) {
		return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
	}

	if (nextUrl.pathname === "/" && !isLoggedIn) {
		return NextResponse.redirect(new URL("/login", nextUrl.origin));
	}

	if (isLoggedIn && req.auth?.user) {
		const userRole = req.auth.user.role;

		// Admin-only routes
		if (nextUrl.pathname.startsWith("/users") && userRole !== "ADMIN") {
			return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
		}

		// Supervisor+ routes
		const supervisorRoutes = ["/reports", "/stop-reasons", "/settings"];
		const isSupervisorRoute = supervisorRoutes.some((route) =>
			nextUrl.pathname.startsWith(route)
		);

		if (isSupervisorRoute && userRole === "OPERATOR") {
			return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
		}
	}

	return NextResponse.next();
});

// Matcher configuration - optimized for performance
export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files (public folder)
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};