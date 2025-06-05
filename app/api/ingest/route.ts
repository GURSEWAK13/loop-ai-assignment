import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import type { IngestionRequest, Priority } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body: IngestionRequest = await request.json()

    // Validate input
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({ error: "ids must be a non-empty array of integers" }, { status: 400 })
    }

    if (!body.priority || !["HIGH", "MEDIUM", "LOW"].includes(body.priority)) {
      return NextResponse.json({ error: "priority must be one of: HIGH, MEDIUM, LOW" }, { status: 400 })
    }

    // Validate IDs
    const validIds = body.ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 1000000007)

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: "No valid IDs provided. IDs must be integers between 1 and 10^9+7" },
        { status: 400 },
      )
    }

    if (validIds.length !== body.ids.length) {
      return NextResponse.json(
        { error: "Some IDs are invalid. IDs must be integers between 1 and 10^9+7" },
        { status: 400 },
      )
    }

    // Create ingestion job
    const ingestion_id = storage.createIngestionJob(validIds, body.priority as Priority)

    return NextResponse.json({ ingestion_id })
  } catch (error) {
    console.error("Error in /api/ingest:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
