import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helper";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const stopReason = await db.stopReason.findUnique({
			where: { id },
			include: {
				_count: {
					select: {
						stops: true,
					},
				},
			},
		});

		if (!stopReason) {
			return NextResponse.json(
				{ error: "Stop reason not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json(stopReason);
	} catch (error) {
		console.error("Error fetching stop reason:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
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

		const stopReason = await db.stopReason.update({
			where: { id },
			data: {
				reasonCode: body.reasonCode,
				reasonText: body.reasonText,
				category: body.category,
				detectionType: body.detectionType,
				standardDuration: body.standardDuration || null,
			},
		});

		return NextResponse.json(stopReason);
	} catch (error) {
		console.error("Error updating stop reason:", error);
		return NextResponse.json(
			{ error: "Failed to update stop reason" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		await requireAuth(["ADMIN", "SUPERVISOR"]);
		const { id } = await params;
		const body = await request.json();

		const stopReason = await db.stopReason.update({
			where: { id },
			data: {
				isActive: body.isActive,
			},
		});

		return NextResponse.json(stopReason);
	} catch (error) {
		console.error("Error updating stop reason:", error);
		return NextResponse.json(
			{ error: "Failed to update stop reason" },
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

		const stopsCount = await db.stop.count({
			where: { reasonId: id },
		});

		if (stopsCount > 0) {
			return NextResponse.json(
				{
					error:
						"Cannot delete stop reason that is in use. Please deactivate it instead.",
				},
				{ status: 400 }
			);
		}

		await db.stopReason.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting stop reason:", error);
		return NextResponse.json(
			{ error: "Failed to delete stop reason" },
			{ status: 500 }
		);
	}
}