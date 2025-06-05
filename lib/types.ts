export type Priority = "HIGH" | "MEDIUM" | "LOW"
export type BatchStatus = "yet_to_start" | "triggered" | "completed"
export type IngestionStatus = "yet_to_start" | "triggered" | "completed"

export interface IngestionRequest {
  ids: number[]
  priority: Priority
}

export interface Batch {
  batch_id: string
  ids: number[]
  status: BatchStatus
  priority: Priority
  created_at: number
  started_at?: number
  completed_at?: number
}

export interface IngestionJob {
  ingestion_id: string
  priority: Priority
  created_at: number
  batches: Batch[]
  status: IngestionStatus
}

export interface QueueItem {
  batch: Batch
  ingestion_id: string
}
