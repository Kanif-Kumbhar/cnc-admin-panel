import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuthAPI } from "@/lib/auth-helper";
import bcrypt from "bcryptjs";

export async function PATCH(
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

		if (!body.password || body.password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters" },
				{ status: 400 }
			);
		}

		const hashedPassword = await bcrypt.hash(body.password, 10);

		await db.user.update({
			where: { id },
			data: {
				password: hashedPassword,
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error changing password:", error);
		return NextResponse.json(
			{ error: "Failed to change password" },
			{ status: 500 }
		);
	}
}