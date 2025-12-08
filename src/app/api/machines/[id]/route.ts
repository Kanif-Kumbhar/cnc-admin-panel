import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helper";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const machine = await db.machine.findUnique({
			where: { id },
			include: {
				jobs: {
					orderBy: { startTime: "desc" },
					take: 10,
				},
				stops: {
					orderBy: { startTime: "desc" },
					take: 10,
					include: {
						reason: true,
						operator: true,
					},
				},
			},
		});

		if (!machine) {
			return NextResponse.json({ error: "Machine not found" }, { status: 404 });
		}

		return NextResponse.json(machine);
	} catch (error) {
		console.error("Error fetching machine:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(["ADMIN"]);
		const { id } = await params;

		// Delete related records first
		await db.stop.deleteMany({
			where: { machineId: id },
		});

		await db.job.deleteMany({
			where: { machineId: id },
		});

		await db.event.deleteMany({
			where: { machineId: id },
		});

		await db.maintenanceLog.deleteMany({
			where: { machineId: id },
		});

		// Delete the machine
		await db.machine.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting machine:", error);
		return NextResponse.json(
			{ error: "Failed to delete machine" },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(["ADMIN", "SUPERVISOR"]);
		const { id } = await params;
		const body = await request.json();

		const machine = await db.machine.update({
			where: { id },
			data: {
				name: body.name,
				model: body.model,
				controller: body.controller,
				ipAddress: body.ipAddress || null,
				opcPort: body.opcPort ? parseInt(body.opcPort) : null,
				location: body.location || null,
				status: body.status,
				serialNumber: body.serialNumber || null,
				manufacturer: body.manufacturer || null,
			},
		});

		return NextResponse.json(machine);
	} catch (error) {
		console.error("Error updating machine:", error);
		return NextResponse.json(
			{ error: "Failed to update machine" },
			{ status: 500 }
		);
	}
}