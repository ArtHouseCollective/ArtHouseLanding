import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

// GET - Fetch all collectives
export async function GET() {
  try {
    const collectivesSnapshot = await db
      .collection("collectives")
      .orderBy("lastActivity", "desc")
      .get()

    const collectives = collectivesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      success: true,
      collectives,
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching collectives:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new collective
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, description, category, tags, isPrivate, createdBy } = data

    if (!name || !description || !createdBy) {
      return NextResponse.json(
        { error: "Name, description, and creator are required" },
        { status: 400 }
      )
    }

    const collective = {
      name: name.trim(),
      description: description.trim(),
      category: category || "General",
      tags: tags || [],
      isPrivate: isPrivate || false,
      createdBy,
      createdAt: Timestamp.now(),
      lastActivity: Timestamp.now(),
      memberCount: 1,
      members: [createdBy],
      admins: [createdBy],
    }

    const docRef = await db.collection("collectives").add(collective)

    return NextResponse.json({
      success: true,
      collective: {
        id: docRef.id,
        ...collective,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating collective:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}