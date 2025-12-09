import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth-helper";

export async function GET() {
	try {
		const stopReasons = await db.stopReason.findMany({
			orderBy: { sortOrder: "asc" },
			include: {
				_count: {
					select: {
						stops: true,
					},
				},
			},
		});

		return NextResponse.json(stopReasons);
	} catch (error) {
		console.error("Error fetching stop reasons:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		await requireAuth(["ADMIN", "SUPERVISOR"]);

		const body = await request.json();

		const lastReason = await db.stopReason.findFirst({
			orderBy: { sortOrder: "desc" },
		});

		const nextSortOrder = lastReason ? lastReason.sortOrder + 1 : 1;

		const stopReason = await db.stopReason.create({
			data: {
				reasonCode: body.reasonCode,
				reasonText: body.reasonText,
				category: body.category,
				detectionType: body.detectionType,
				standardDuration: body.standardDuration || null,
				sortOrder: nextSortOrder,
				isActive: true,
			},
		});

		return NextResponse.json(stopReason, { status: 201 });
	} catch (error) {
		console.error("Error creating stop reason:", error);
		return NextResponse.json(
			{ error: "Failed to create stop reason" },
			{ status: 500 }
		);
	}
}