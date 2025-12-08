"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsLoading(true);

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email") as string;
		const password = formData.get("password") as string;

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
				callbackUrl,
			});

			if (result?.error) {
				toast.error("Login Failed", {
					description: "Invalid email or password",
				});
			} else if (result?.ok) {
				toast.success("Login Successful!");
				router.push(callbackUrl);
				router.refresh();
			}
		} catch (error) {
			toast.error("Something went wrong");
			console.error("Login error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Sign In</CardTitle>
				<CardDescription>
					Enter your credentials to access the admin panel
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="admin@cnc.com"
							autoComplete="email"
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							autoComplete="current-password"
							required
							disabled={isLoading}
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							</>
						) : (
							"Sign In"
						)}
					</Button>
				</form>

				<div className="mt-6 p-4 bg-muted/50 rounded-md">
					<p className="text-xs font-medium mb-2">Demo Credentials:</p>
					<div className="text-xs space-y-1 text-muted-foreground">
						<p>Admin: admin@cnc.com / admin123</p>
						<p>Supervisor: supervisor@cnc.com / supervisor123</p>
						<p>Operator: operator@cnc.com / operator123</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}