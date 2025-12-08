import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
	...authConfig,
	providers: [
		CredentialsProvider({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const email = credentials.email as string;
				const password = credentials.password as string;

				const user = await db.user.findUnique({
					where: { email },
				});

				if (!user?.password || !user.isActive) {
					return null;
				}

				const isCorrectPassword = await bcrypt.compare(password, user.password);

				if (!isCorrectPassword) {
					return null;
				}

				db.auditLog
					.create({
						data: {
							userId: user.id,
							action: "LOGIN",
							entityType: "User",
							entityId: user.id,
							timestamp: new Date(),
						},
					})
					.catch((err) => console.error("Audit log error:", err));

				db.user
					.update({
						where: { id: user.id },
						data: { lastLogin: new Date() },
					})
					.catch((err) => console.error("Update login error:", err));

				return {
					id: user.id,
					email: user.email,
					name: user.name,
					role: user.role,
				};
			},
		}),
	],
});