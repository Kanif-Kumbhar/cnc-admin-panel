import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuthAPI } from "@/lib/auth-helper";

export async function GET() {
	try {
		const shifts = await db.shift.findMany({
			orderBy: { sortOrder: "asc" },
		});

		return NextResponse.json(shifts);
	} catch (error) {
		console.error("Error fetching shifts:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await requireAuthAPI(["ADMIN"]);
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const body = await request.json();

		if (!body.name || !body.startTime || !body.endTime) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Get max sortOrder
		const maxShift = await db.shift.findFirst({
			orderBy: { sortOrder: "desc" },
			select: { sortOrder: true },
		});

		const shift = await db.shift.create({
			data: {
				name: body.name,
				startTime: body.startTime,
				endTime: body.endTime,
				color: body.color || "#3b82f6",
				sortOrder: (maxShift?.sortOrder || 0) + 1,
				isActive: true,
			},
		});

		return NextResponse.json(shift, { status: 201 });
	} catch (error) {
		console.error("Error creating shift:", error);
		return NextResponse.json(
			{ error: "Failed to create shift" },
			{ status: 500 }
		);
	}
}