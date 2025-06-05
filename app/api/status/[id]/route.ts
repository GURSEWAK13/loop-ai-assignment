import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ingestion_id = params.id

    if (!ingestion_id) {
      return NextResponse.json({ error: "Ingestion ID is required" }, { status: 400 })
    }

    const job = storage.getIngestionJob(ingestion_id)

    if (!job) {
      return NextResponse.json({ error: "Ingestion job not found" }, { status: 404 })
    }

    // Format response
    const response = {
      ingestion_id: job.ingestion_id,
      status: job.status,
      batches: job.batches.map((batch) => ({
        batch_id: batch.batch_id,
        ids: batch.ids,
        status: batch.status,
      })),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error in /api/status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
