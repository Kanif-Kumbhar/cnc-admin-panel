import type { NextAuthConfig } from "next-auth";

export const authConfig = {
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60,
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
	callbacks: {
		authorized({ auth, request: { nextUrl } }) {
			const isLoggedIn = !!auth?.user;
			const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
			const isOnMachines = nextUrl.pathname.startsWith("/machines");
			const isOnReports = nextUrl.pathname.startsWith("/reports");
			const isOnSettings = nextUrl.pathname.startsWith("/settings");
			const isOnUsers = nextUrl.pathname.startsWith("/users");
			const isOnStopReasons = nextUrl.pathname.startsWith("/stop-reasons");
			const isOnLogin = nextUrl.pathname === "/login";

			const protectedRoutes =
				isOnDashboard ||
				isOnMachines ||
				isOnReports ||
				isOnSettings ||
				isOnUsers ||
				isOnStopReasons;

			if (protectedRoutes) {
				if (!isLoggedIn) return false;
				return true;
			}

			if (isOnLogin && isLoggedIn) {
				return Response.redirect(new URL("/dashboard", nextUrl));
			}

			return true;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.role = user.role;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.role = token.role as string;
			}
			return session;
		},
	},
	providers: [],
} satisfies NextAuthConfig;