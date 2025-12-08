"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Settings,
	Users,
	Activity,
	FileText,
	AlertTriangle,
	LogOut,
	ChevronLeft,
	Menu,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
	userRole: string;
}

const navigationRoutes = [
	{
		label: "Dashboard",
		icon: LayoutDashboard,
		href: "/dashboard",
		roles: ["ADMIN", "SUPERVISOR", "OPERATOR"],
	},
	{
		label: "Machines",
		icon: Activity,
		href: "/machines",
		roles: ["ADMIN", "SUPERVISOR", "OPERATOR"],
	},
	{
		label: "Reports",
		icon: FileText,
		href: "/reports",
		roles: ["ADMIN", "SUPERVISOR"],
	},
	{
		label: "Stop Reasons",
		icon: AlertTriangle,
		href: "/stop-reasons",
		roles: ["ADMIN", "SUPERVISOR"],
	},
	{
		label: "Users",
		icon: Users,
		href: "/users",
		roles: ["ADMIN"],
	},
	{
		label: "Settings",
		icon: Settings,
		href: "/settings",
		roles: ["ADMIN", "SUPERVISOR"],
	},
];

export function Sidebar({ userRole }: SidebarProps) {
	const pathname = usePathname();
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/login" });
	};

	const filteredRoutes = navigationRoutes.filter((route) =>
		route.roles.includes(userRole)
	);

	return (
		<>
			{/* Mobile Menu Button */}
			<Button
				variant="ghost"
				size="icon"
				className="fixed top-4 left-4 z-50 md:hidden"
				onClick={() => setMobileOpen(!mobileOpen)}
			>
				<Menu className="h-6 w-6" />
			</Button>

			{/* Mobile Overlay */}
			{mobileOpen && (
				<div
					className="fixed inset-0 z-40 bg-black/50 md:hidden"
					onClick={() => setMobileOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300",
					collapsed ? "w-20" : "w-64",
					mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
				)}
			>

				<div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
					{!collapsed && (
						<Link href="/dashboard" className="flex items-center gap-2">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-blue-700 text-white">
								<Activity className="h-6 w-6" />
							</div>
							<div className="flex flex-col">
								<span className="text-lg font-bold text-slate-900">
									CNC Monitor
								</span>
								<span className="text-xs text-slate-500">v1.0.0</span>
							</div>
						</Link>
					)}

					<Button
						variant="ghost"
						size="icon"
						className="hidden md:flex"
						onClick={() => setCollapsed(!collapsed)}
					>
						<ChevronLeft
							className={cn(
								"h-5 w-5 transition-transform",
								collapsed && "rotate-180"
							)}
						/>
					</Button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto p-4">
					<ul className="space-y-1">
						{filteredRoutes.map((route) => {
							const isActive = pathname === route.href;
							const Icon = route.icon;

							return (
								<li key={route.href}>
									<Link
										href={route.href}
										onClick={() => setMobileOpen(false)}
										className={cn(
											"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-slate-100",
											isActive
												? "bg-blue-50 text-blue-700 hover:bg-blue-100"
												: "text-slate-700 hover:text-slate-900",
											collapsed && "justify-center"
										)}
									>
										<Icon className="h-5 w-5 shrink-0" />
										{!collapsed && <span>{route.label}</span>}
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* User Section */}
				<div className="border-t border-slate-200 p-4">
					<Button
						variant="ghost"
						className={cn(
							"w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700",
							collapsed && "justify-center px-2"
						)}
						onClick={handleLogout}
					>
						<LogOut className="h-5 w-5 shrink-0" />
						{!collapsed && <span>Logout</span>}
					</Button>
				</div>
			</aside>
		</>
	);
}