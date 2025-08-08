import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

// GET - Fetch all events
export async function GET() {
  try {
    const eventsSnapshot = await db
      .collection("events")
      .orderBy("date", "asc")
      .get()

    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      success: true,
      events,
    }, { status: 200 })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { 
      title, 
      description, 
      eventType, 
      date, 
      time, 
      location, 
      isVirtual, 
      maxAttendees, 
      isPrivate, 
      tags, 
      createdBy 
    } = data

    if (!title || !description || !date || !time || !location || !createdBy) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      )
    }

    // Parse date and combine with time
    const eventDate = new Date(date + 'T' + time)

    const event = {
      title: title.trim(),
      description: description.trim(),
      eventType: eventType || "Workshop",
      date: Timestamp.fromDate(eventDate),
      time,
      location: location.trim(),
      isVirtual: isVirtual || false,
      maxAttendees: maxAttendees || null,
      currentAttendees: 0,
      isPrivate: isPrivate || false,
      tags: tags || [],
      status: "upcoming",
      createdBy,
      createdAt: Timestamp.now(),
      attendees: [],
      admins: [createdBy],
    }

    const docRef = await db.collection("events").add(event)

    return NextResponse.json({
      success: true,
      event: {
        id: docRef.id,
        ...event,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
