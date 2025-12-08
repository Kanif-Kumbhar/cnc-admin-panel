import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helper";

export async function GET() {
	try {
		const machines = await db.machine.findMany({
			orderBy: { name: "asc" },
		});

		return NextResponse.json(machines);
	} catch (error) {
		console.error("Error fetching machines:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		await requireAuth(["ADMIN"]);

		const body = await request.json();

		const machine = await db.machine.create({
			data: {
				name: body.name,
				model: body.model,
				controller: body.controller,
				ipAddress: body.ipAddress || null,
				opcPort: body.opcPort ? parseInt(body.opcPort) : null,
				location: body.location || null,
				status: body.status || "OFFLINE",
				serialNumber: body.serialNumber || null,
				manufacturer: body.manufacturer || null,
			},
		});

		return NextResponse.json(machine, { status: 201 });
	} catch (error) {
		console.error("Error creating machine:", error);
		return NextResponse.json(
			{ error: "Failed to create machine" },
			{ status: 500 }
		);
	}
}