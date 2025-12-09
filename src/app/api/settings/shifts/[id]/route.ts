import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuthAPI } from "@/lib/auth-helper"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthAPI(["ADMIN"])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const body = await request.json()

    const shift = await db.shift.update({
      where: { id },
      data: {
        name: body.name,
        startTime: body.startTime,
        endTime: body.endTime,
        color: body.color,
      },
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error("Error updating shift:", error)
    return NextResponse.json(
      { error: "Failed to update shift" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthAPI(["ADMIN"])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params
    const body = await request.json()

    const shift = await db.shift.update({
      where: { id },
      data: {
        isActive: body.isActive,
      },
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error("Error updating shift:", error)
    return NextResponse.json(
      { error: "Failed to update shift" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuthAPI(["ADMIN"])
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { id } = await params

    await db.shift.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting shift:", error)
    return NextResponse.json(
      { error: "Failed to delete shift" },
      { status: 500 }
    )
  }
}