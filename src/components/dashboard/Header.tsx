import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { signOut } from "@/auth";
import { getCurrentUser } from "@/lib/auth-helper";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export async function Header() {
	const user = await getCurrentUser();

	if (!user) return null;

	const initials = user.name
		?.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

	return (
		<header className="sticky top-0 z-40 border-b bg-white">
			<div className="flex h-16 items-center justify-between px-6">
				<div>
					<h2 className="text-xl font-semibold text-slate-900">
						CNC Monitoring System
					</h2>
					<p className="text-sm text-slate-600">
						Real-time production tracking
					</p>
				</div>

				<div className="flex items-center gap-3">
					{/* Notification Bell */}
					<NotificationBell />

					{/* User Menu */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-100 transition-colors">
								<Avatar className="h-9 w-9">
									<AvatarFallback className="bg-blue-600 text-white">
										{initials}
									</AvatarFallback>
								</Avatar>
								<div className="text-left">
									<p className="text-sm font-medium text-slate-900">
										{user.name}
									</p>
									<p className="text-xs text-slate-600">{user.role}</p>
								</div>
							</button>
						</DropdownMenuTrigger>

						<DropdownMenuContent align="end" className="w-56">
							<DropdownMenuLabel>My Account</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<User className="mr-2 h-4 w-4" />
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Settings className="mr-2 h-4 w-4" />
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<form
								action={async () => {
									"use server";
									await signOut();
								}}
							>
								<button type="submit" className="w-full">
									<DropdownMenuItem className="text-red-600 cursor-pointer">
										<LogOut className="mr-2 h-4 w-4" />
										Logout
									</DropdownMenuItem>
								</button>
							</form>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}