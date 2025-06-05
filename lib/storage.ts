import type { IngestionJob, Batch, QueueItem, Priority } from "./types"

class InMemoryStorage {
  private jobs: Map<string, IngestionJob> = new Map()
  private queue: QueueItem[] = []
  private processing = false
  private lastProcessTime = 0
  private readonly RATE_LIMIT_MS = 5000 // 5 seconds
  private readonly BATCH_SIZE = 3

  generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  createIngestionJob(ids: number[], priority: Priority): string {
    const ingestion_id = this.generateId()
    const created_at = Date.now()

    // Create batches
    const batches: Batch[] = []
    for (let i = 0; i < ids.length; i += this.BATCH_SIZE) {
      const batchIds = ids.slice(i, i + this.BATCH_SIZE)
      const batch: Batch = {
        batch_id: this.generateId(),
        ids: batchIds,
        status: "yet_to_start",
        priority,
        created_at,
      }
      batches.push(batch)
    }

    const job: IngestionJob = {
      ingestion_id,
      priority,
      created_at,
      batches,
      status: "yet_to_start",
    }

    this.jobs.set(ingestion_id, job)

    // Add batches to queue
    batches.forEach((batch) => {
      this.queue.push({ batch, ingestion_id })
    })

    // Sort queue by priority and creation time
    this.sortQueue()

    // Start processing if not already running
    this.startProcessing()

    return ingestion_id
  }

  getIngestionJob(ingestion_id: string): IngestionJob | null {
    return this.jobs.get(ingestion_id) || null
  }

  private sortQueue() {
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }

    this.queue.sort((a, b) => {
      // First sort by priority (higher priority first)
      const priorityDiff = priorityOrder[b.batch.priority] - priorityOrder[a.batch.priority]
      if (priorityDiff !== 0) return priorityDiff

      // Then sort by creation time (earlier first)
      return a.batch.created_at - b.batch.created_at
    })
  }

  private async startProcessing() {
    if (this.processing) return

    this.processing = true

    while (this.queue.length > 0) {
      const now = Date.now()
      const timeSinceLastProcess = now - this.lastProcessTime

      // Wait for rate limit if needed
      if (timeSinceLastProcess < this.RATE_LIMIT_MS) {
        const waitTime = this.RATE_LIMIT_MS - timeSinceLastProcess
        await new Promise((resolve) => setTimeout(resolve, waitTime))
      }

      // Re-sort queue in case new high priority items were added
      this.sortQueue()

      const queueItem = this.queue.shift()
      if (!queueItem) break

      await this.processBatch(queueItem)
      this.lastProcessTime = Date.now()
    }

    this.processing = false
  }

  private async processBatch(queueItem: QueueItem) {
    const { batch, ingestion_id } = queueItem
    const job = this.jobs.get(ingestion_id)

    if (!job) return

    // Update batch status to triggered
    batch.status = "triggered"
    batch.started_at = Date.now()
    this.updateJobStatus(job)

    // Simulate external API call with delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Update batch status to completed
    batch.status = "completed"
    batch.completed_at = Date.now()
    this.updateJobStatus(job)
  }

  private updateJobStatus(job: IngestionJob) {
    const allCompleted = job.batches.every((b) => b.status === "completed")
    const anyTriggered = job.batches.some((b) => b.status === "triggered")

    if (allCompleted) {
      job.status = "completed"
    } else if (anyTriggered) {
      job.status = "triggered"
    } else {
      job.status = "yet_to_start"
    }
  }

  // For testing purposes
  getQueueLength(): number {
    return this.queue.length
  }

  getAllJobs(): IngestionJob[] {
    return Array.from(this.jobs.values())
  }
}

export const storage = new InMemoryStorage()
