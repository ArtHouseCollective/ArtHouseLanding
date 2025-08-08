import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"
import { Timestamp } from "firebase-admin/firestore"

// PUT - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const data = await request.json()

    const eventRef = db.collection("events").doc(id)
    const eventDoc = await eventRef.get()

    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Handle status updates
    if (data.status && Object.keys(data).length === 1) {
      await eventRef.update({
        status: data.status,
        updatedAt: Timestamp.now(),
      })

      const updatedDoc = await eventRef.get()
      return NextResponse.json({
        success: true,
        event: {
          id: updatedDoc.id,
          ...updatedDoc.data(),
        },
      }, { status: 200 })
    }

    // Handle full event updates
    const { title, description, eventType, date, time, location, isVirtual, maxAttendees, isPrivate, tags } = data

    if (!title || !description || !date || !time || !location) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      )
    }

    // Parse date and combine with time
    const eventDate = new Date(date + 'T' + time)

    const updateData = {
      title: title.trim(),
      description: description.trim(),
      eventType: eventType || "Workshop",
      date: Timestamp.fromDate(eventDate),
      time,
      location: location.trim(),
      isVirtual: isVirtual || false,
      maxAttendees: maxAttendees || null,
      isPrivate: isPrivate || false,
      tags: tags || [],
      updatedAt: Timestamp.now(),
    }

    await eventRef.update(updateData)

    const updatedDoc = await eventRef.get()
    const event = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
    }

    return NextResponse.json({
      success: true,
      event,
    }, { status: 200 })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const eventRef = db.collection("events").doc(id)
    const eventDoc = await eventRef.get()

    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    await eventRef.delete()

    return NextResponse.json({
      success: true,
      message: "Event deleted successfully",
    }, { status: 200 })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
