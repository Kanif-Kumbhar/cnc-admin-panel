import { LoginForm } from "@/components/auth/LoginForm";
import { Activity } from "lucide-react";

export default function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
			<div className="w-full max-w-md">
				<div className="flex flex-col items-center mb-8">
					<div className="flex items-center gap-2 mb-2">
						<Activity className="h-8 w-8 text-primary" />
						<h1 className="text-2xl font-bold">CNC Monitor</h1>
					</div>
					<p className="text-sm text-muted-foreground">
						Machine Performance Monitoring System
					</p>
				</div>

				<LoginForm />

				<div className="mt-8 text-center">
					<p className="text-xs text-muted-foreground">
						© 2025 CNC Monitoring System. All rights reserved.
					</p>
				</div>
			</div>
		</div>
	);
}