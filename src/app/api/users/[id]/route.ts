import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuthAPI } from "@/lib/auth-helper";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;

		const user = await db.user.findUnique({
			where: { id },
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

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error fetching user:", error);
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
		const auth = await requireAuthAPI(["ADMIN"]);
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const { id } = await params;
		const body = await request.json();

		if (body.email) {
			const existingUser = await db.user.findFirst({
				where: {
					email: body.email,
					NOT: { id },
				},
			});

			if (existingUser) {
				return NextResponse.json(
					{ error: "Email already exists" },
					{ status: 400 }
				);
			}
		}

		const user = await db.user.update({
			where: { id },
			data: {
				name: body.name,
				email: body.email,
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
			},
		});

		return NextResponse.json(user);
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json(
			{ error: "Failed to update user" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await requireAuthAPI(["ADMIN"]);
		if (auth.error) {
			return NextResponse.json({ error: auth.error }, { status: auth.status });
		}

		const { id } = await params;

		// Prevent deleting yourself
		if (auth.session && auth.session.user.id === id) {
			return NextResponse.json(
				{ error: "Cannot delete your own account" },
				{ status: 400 }
			);
		}

		const stopsCount = await db.stop.count({
			where: { operatorId: id },
		});

		if (stopsCount > 0) {
			return NextResponse.json(
				{
					error:
						"Cannot delete user with recorded stops. Please reassign stops first.",
				},
				{ status: 400 }
			);
		}

		await db.user.delete({
			where: { id },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting user:", error);
		return NextResponse.json(
			{ error: "Failed to delete user" },
			{ status: 500 }
		);
	}
}