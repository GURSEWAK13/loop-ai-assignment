"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, Search } from "lucide-react"

type Priority = "HIGH" | "MEDIUM" | "LOW"
type BatchStatus = "yet_to_start" | "triggered" | "completed"
type IngestionStatus = "yet_to_start" | "triggered" | "completed"

interface Batch {
  batch_id: string
  ids: number[]
  status: BatchStatus
}

interface StatusResponse {
  ingestion_id: string
  status: IngestionStatus
  batches: Batch[]
}

export default function TestPage() {
  const [ids, setIds] = useState("1,2,3,4,5")
  const [priority, setPriority] = useState<Priority>("MEDIUM")
  const [ingestionId, setIngestionId] = useState("")
  const [statusId, setStatusId] = useState("")
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [statusResponse, setStatusResponse] = useState<StatusResponse | null>(null)
  const [error, setError] = useState("")

  const handleIngest = async () => {
    setLoading(true)
    setError("")
    setResponse(null)

    try {
      const idsArray = ids
        .split(",")
        .map((id) => Number.parseInt(id.trim()))
        .filter((id) => !isNaN(id))

      if (idsArray.length === 0) {
        throw new Error("Please provide valid IDs")
      }

      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: idsArray,
          priority: priority,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ingestion request")
      }

      setResponse(data)
      setIngestionId(data.ingestion_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleStatus = async () => {
    if (!statusId.trim()) {
      setError("Please provide an ingestion ID")
      return
    }

    setStatusLoading(true)
    setError("")
    setStatusResponse(null)

    try {
      const res = await fetch(`/api/status/${statusId}`)
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch status")
      }

      setStatusResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setStatusLoading(false)
    }
  }

  const getStatusColor = (status: BatchStatus | IngestionStatus) => {
    switch (status) {
      case "yet_to_start":
        return "bg-gray-500"
      case "triggered":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Test Interface</h1>
          <p className="text-gray-600">Test the data ingestion and status endpoints</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Ingestion Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Ingestion API Test
              </CardTitle>
              <CardDescription>POST /api/ingest - Submit data ingestion request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ids">IDs (comma-separated)</Label>
                <Input id="ids" value={ids} onChange={(e) => setIds(e.target.value)} placeholder="1,2,3,4,5" />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={(value: Priority) => setPriority(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="LOW">LOW</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleIngest} disabled={loading} className="w-full">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Ingestion Request
              </Button>

              {response && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Response:</h3>
                  <pre className="text-sm text-green-700 whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Test */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Status API Test
              </CardTitle>
              <CardDescription>GET /api/status/[id] - Check ingestion status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="statusId">Ingestion ID</Label>
                <Input
                  id="statusId"
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                  placeholder="Enter ingestion ID"
                />
              </div>

              {ingestionId && (
                <Button variant="outline" size="sm" onClick={() => setStatusId(ingestionId)} className="w-full">
                  Use Latest ID: {ingestionId.substring(0, 8)}...
                </Button>
              )}

              <Button onClick={handleStatus} disabled={statusLoading} className="w-full">
                {statusLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Check Status
              </Button>

              {statusResponse && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-800">Status Response:</h3>
                    <Badge className={getStatusColor(statusResponse.status)}>{statusResponse.status}</Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-blue-700">
                      <strong>ID:</strong> {statusResponse.ingestion_id}
                    </p>

                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-2">Batches:</p>
                      {statusResponse.batches.map((batch, index) => (
                        <div key={batch.batch_id} className="bg-white p-3 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Batch {index + 1}</span>
                            <Badge className={getStatusColor(batch.status)} variant="secondary">
                              {batch.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">IDs: [{batch.ids.join(", ")}]</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {error && (
          <Card className="mt-8 border-red-200">
            <CardContent className="p-4">
              <div className="text-red-800 bg-red-50 p-3 rounded">
                <strong>Error:</strong> {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Testing Priority Processing:</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Submit a MEDIUM priority request with IDs [1,2,3,4,5]</li>
                <li>Wait 4 seconds, then submit a HIGH priority request with IDs [6,7,8,9]</li>
                <li>Check status to see HIGH priority IDs processed first</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Rate Limiting:</h3>
              <p className="text-gray-600">
                The system processes maximum 3 IDs per batch with 1 batch every 5 seconds. You can submit multiple
                requests and they will be queued appropriately.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
