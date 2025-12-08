"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const result = await signIn("credentials", {
				email: formData.email,
				password: formData.password,
				redirect: false,
			});

			if (result?.error) {
				toast.error("Login Failed", {
					description: result.error,
				});
			} else {
				toast.success("Login Successful", {
					description: "Redirecting to dashboard...",
				});
				router.push("/dashboard");
				router.refresh();
			}
		} catch (error) {
			toast.error("Something went wrong", {
				description: `${error}`,
			});
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
							type="email"
							placeholder="admin@cnc.com"
							value={formData.email}
							onChange={(e) =>
								setFormData({ ...formData, email: e.target.value })
							}
							required
							disabled={isLoading}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
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