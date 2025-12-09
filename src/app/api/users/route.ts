import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuthAPI } from "@/lib/auth-helper";
import bcrypt from "bcryptjs";

export async function GET() {
	try {
		const users = await db.user.findMany({
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				telegramId: true,
				createdAt: true,
				updatedAt: true,
				_count: {
					select: {
						stops: true,
					},
				},
			},
		});

		return NextResponse.json(users);
	} catch (error) {
		console.error("Error fetching users:", error);
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

		if (!body.name || !body.email || !body.password || !body.role) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		const existingUser = await db.user.findUnique({
			where: { email: body.email },
		});

		if (existingUser) {
			return NextResponse.json(
				{ error: "Email already exists" },
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(body.password, 10);

		const user = await db.user.create({
			data: {
				name: body.name,
				email: body.email,
				password: hashedPassword,
				role: body.role,
				phone: body.phone || null,
				telegramId: body.telegramId || null,
			},
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				phone: true,
				telegramId: true,
				createdAt: true,
			},
		});

		return NextResponse.json(user, { status: 201 });
	} catch (error) {
		console.error("Error creating user:", error);
		return NextResponse.json(
			{ error: "Failed to create user" },
			{ status: 500 }
		);
	}
}