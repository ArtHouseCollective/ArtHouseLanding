import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

// PUT - Update collective
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()
    const { name, description, category, tags, isPrivate } = data

    if (!name || !description) {
      return NextResponse.json(
        { error: "Name and description are required" },
        { status: 400 }
      )
    }

    const collectiveRef = db.collection("collectives").doc(id)
    const collectiveDoc = await collectiveRef.get()

    if (!collectiveDoc.exists) {
      return NextResponse.json(
        { error: "Collective not found" },
        { status: 404 }
      )
    }

    const updateData = {
      name: name.trim(),
      description: description.trim(),
      category: category || "General",
      tags: tags || [],
      isPrivate: isPrivate || false,
      lastActivity: Timestamp.now(),
    }

    await collectiveRef.update(updateData)

    const updatedDoc = await collectiveRef.get()
    const collective = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    }

    return NextResponse.json({
      success: true,
      collective,
    }, { status: 200 })
  } catch (error) {
    console.error("Error updating collective:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete collective
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const collectiveRef = db.collection("collectives").doc(id)
    const collectiveDoc = await collectiveRef.get()

    if (!collectiveDoc.exists) {
      return NextResponse.json(
        { error: "Collective not found" },
        { status: 404 }
      )
    }

    await collectiveRef.delete()

    return NextResponse.json({
      success: true,
      message: "Collective deleted successfully",
    }, { status: 200 })
  } catch (error) {
    console.error("Error deleting collective:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
