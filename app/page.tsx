import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Clock, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Ingestion API System</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A robust API system for handling data ingestion requests with priority-based processing, rate limiting, and
            real-time status tracking.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Database className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Batch Processing</CardTitle>
              <CardDescription>Process up to 3 IDs per batch with intelligent queuing</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Rate Limiting</CardTitle>
              <CardDescription>Respects 1 batch per 5 seconds rate limit automatically</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Priority Queue</CardTitle>
              <CardDescription>HIGH priority requests processed before MEDIUM and LOW</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>RESTful endpoints for data ingestion and status checking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">POST /api/ingest</h3>
                <p className="text-sm text-gray-600 mb-2">Submit data ingestion request</p>
                <code className="text-xs bg-white p-2 rounded block">{`{"ids": [1,2,3,4,5], "priority": "HIGH"}`}</code>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">GET /api/status/[id]</h3>
                <p className="text-sm text-gray-600">Check ingestion status</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Interface</CardTitle>
              <CardDescription>Interactive interface to test the API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/test">
                <Button className="w-full">Open Test Interface</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2">1. Submit Request</h3>
              <p className="text-gray-600">Send a POST request with IDs and priority level to start ingestion</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Batch Processing</h3>
              <p className="text-gray-600">
                System automatically batches IDs (max 3 per batch) and queues them by priority
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Track Status</h3>
              <p className="text-gray-600">
                Monitor progress in real-time using the status endpoint with your ingestion ID
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
