"use client";

import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Machine {
	id: string;
	name: string;
}

interface MachineFilterProps {
	selectedMachine: string | null;
	onChange: (machineId: string | null) => void;
}

export function MachineFilter({
	selectedMachine,
	onChange,
}: MachineFilterProps) {
	const [machines, setMachines] = useState<Machine[]>([]);

	useEffect(() => {
		const fetchMachines = async () => {
			try {
				const response = await fetch("/api/machines");
				if (response.ok) {
					const data = await response.json();
					setMachines(data);
				}
			} catch (error) {
				console.error("Failed to fetch machines:", error);
			}
		};

		void fetchMachines();
	}, []);

	return (
		<Select
			value={selectedMachine || "all"}
			onValueChange={(value) => onChange(value === "all" ? null : value)}
		>
			<SelectTrigger className="w-[200px]">
				<SelectValue placeholder="All Machines" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="all">All Machines</SelectItem>
				{machines.map((machine) => (
					<SelectItem key={machine.id} value={machine.id}>
						{machine.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}