import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
	user: {
		name: string;
		email: string;
		role: string;
	};
}

export function Header({ user }: HeaderProps) {
	const getInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	const getRoleBadgeVariant = (role: string) => {
		switch (role) {
			case "ADMIN":
				return "destructive";
			case "SUPERVISOR":
				return "default";
			case "OPERATOR":
				return "secondary";
			default:
				return "outline";
		}
	};

	return (
		<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
			<div className="hidden flex-1 md:block">
				<div className="relative max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
					<Input placeholder="Search machines, reports..." className="pl-10" />
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					<span className="absolute right-1 top-1 flex h-2 w-2">
						<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
						<span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
					</span>
				</Button>

				<div className="flex items-center gap-3">
					<div className="hidden text-right md:block">
						<p className="text-sm font-medium text-slate-900">{user.name}</p>
						<Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
							{user.role}
						</Badge>
					</div>
					<Avatar>
						<AvatarFallback className="bg-linear-to-br from-blue-600 to-blue-700 text-white">
							{getInitials(user.name)}
						</AvatarFallback>
					</Avatar>
				</div>
			</div>
		</header>
	);
}