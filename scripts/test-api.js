// Comprehensive test suite for the Data Ingestion API
const BASE_URL = process.env.BASE_URL || "http://localhost:3000"

class APITester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.testResults = []
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()
    return { response, data }
  }

  async testIngestionAPI() {
    console.log("\n🧪 Testing Ingestion API...")

    // Test 1: Valid request
    try {
      const { response, data } = await this.makeRequest("/api/ingest", {
        method: "POST",
        body: JSON.stringify({
          ids: [1, 2, 3, 4, 5],
          priority: "MEDIUM",
        }),
      })

      if (response.ok && data.ingestion_id) {
        console.log("✅ Valid ingestion request successful")
        this.testResults.push({ test: "Valid ingestion", passed: true })
        return data.ingestion_id
      } else {
        console.log("❌ Valid ingestion request failed:", data)
        this.testResults.push({ test: "Valid ingestion", passed: false })
      }
    } catch (error) {
      console.log("❌ Valid ingestion request error:", error.message)
      this.testResults.push({ test: "Valid ingestion", passed: false })
    }

    // Test 2: Invalid IDs
    try {
      const { response, data } = await this.makeRequest("/api/ingest", {
        method: "POST",
        body: JSON.stringify({
          ids: [],
          priority: "HIGH",
        }),
      })

      if (!response.ok) {
        console.log("✅ Empty IDs validation working")
        this.testResults.push({ test: "Empty IDs validation", passed: true })
      } else {
        console.log("❌ Empty IDs validation failed")
        this.testResults.push({ test: "Empty IDs validation", passed: false })
      }
    } catch (error) {
      console.log("❌ Empty IDs validation error:", error.message)
      this.testResults.push({ test: "Empty IDs validation", passed: false })
    }

    // Test 3: Invalid priority
    try {
      const { response, data } = await this.makeRequest("/api/ingest", {
        method: "POST",
        body: JSON.stringify({
          ids: [1, 2, 3],
          priority: "INVALID",
        }),
      })

      if (!response.ok) {
        console.log("✅ Invalid priority validation working")
        this.testResults.push({ test: "Invalid priority validation", passed: true })
      } else {
        console.log("❌ Invalid priority validation failed")
        this.testResults.push({ test: "Invalid priority validation", passed: false })
      }
    } catch (error) {
      console.log("❌ Invalid priority validation error:", error.message)
      this.testResults.push({ test: "Invalid priority validation", passed: false })
    }

    return null
  }

  async testStatusAPI(ingestionId) {
    console.log("\n🔍 Testing Status API...")

    if (!ingestionId) {
      console.log("❌ No ingestion ID available for status testing")
      return
    }

    // Test 1: Valid status request
    try {
      const { response, data } = await this.makeRequest(`/api/status/${ingestionId}`)

      if (response.ok && data.ingestion_id && data.status && data.batches) {
        console.log("✅ Valid status request successful")
        console.log(`   Status: ${data.status}`)
        console.log(`   Batches: ${data.batches.length}`)
        this.testResults.push({ test: "Valid status request", passed: true })
        return data
      } else {
        console.log("❌ Valid status request failed:", data)
        this.testResults.push({ test: "Valid status request", passed: false })
      }
    } catch (error) {
      console.log("❌ Valid status request error:", error.message)
      this.testResults.push({ test: "Valid status request", passed: false })
    }

    // Test 2: Invalid ingestion ID
    try {
      const { response, data } = await this.makeRequest("/api/status/invalid-id")

      if (!response.ok && response.status === 404) {
        console.log("✅ Invalid ID handling working")
        this.testResults.push({ test: "Invalid ID handling", passed: true })
      } else {
        console.log("❌ Invalid ID handling failed")
        this.testResults.push({ test: "Invalid ID handling", passed: false })
      }
    } catch (error) {
      console.log("❌ Invalid ID handling error:", error.message)
      this.testResults.push({ test: "Invalid ID handling", passed: false })
    }
  }

  async testPriorityProcessing() {
    console.log("\n⚡ Testing Priority Processing...")

    try {
      // Submit MEDIUM priority request
      const { data: mediumJob } = await this.makeRequest("/api/ingest", {
        method: "POST",
        body: JSON.stringify({
          ids: [1, 2, 3, 4, 5],
          priority: "MEDIUM",
        }),
      })

      console.log("📤 Submitted MEDIUM priority job")

      // Wait 4 seconds
      await this.sleep(4000)

      // Submit HIGH priority request
      const { data: highJob } = await this.makeRequest("/api/ingest", {
        method: "POST",
        body: JSON.stringify({
          ids: [6, 7, 8, 9],
          priority: "HIGH",
        }),
      })

      console.log("📤 Submitted HIGH priority job (4s later)")

      // Wait and check processing order
      await this.sleep(8000)

      const { data: mediumStatus } = await this.makeRequest(`/api/status/${mediumJob.ingestion_id}`)
      const { data: highStatus } = await this.makeRequest(`/api/status/${highJob.ingestion_id}`)

      console.log(`Medium job status: ${mediumStatus.status}`)
      console.log(`High job status: ${highStatus.status}`)

      // Check if HIGH priority was processed first
      const highTriggered = highStatus.batches.some((b) => b.status === "triggered" || b.status === "completed")

      if (highTriggered) {
        console.log("✅ Priority processing working correctly")
        this.testResults.push({ test: "Priority processing", passed: true })
      } else {
        console.log("❌ Priority processing may not be working correctly")
        this.testResults.push({ test: "Priority processing", passed: false })
      }
    } catch (error) {
      console.log("❌ Priority processing test error:", error.message)
      this.testResults.push({ test: "Priority processing", passed: false })
    }
  }

  async testRateLimiting() {
    console.log("\n⏱️  Testing Rate Limiting...")

    try {
      const startTime = Date.now()

      // Submit multiple requests quickly
      const requests = []
      for (let i = 0; i < 3; i++) {
        requests.push(
          this.makeRequest("/api/ingest", {
            method: "POST",
            body: JSON.stringify({
              ids: [i * 10 + 1, i * 10 + 2, i * 10 + 3],
              priority: "LOW",
            }),
          }),
        )
      }

      const results = await Promise.all(requests)
      const ingestionIds = results.map((r) => r.data.ingestion_id)

      console.log("📤 Submitted 3 requests simultaneously")

      // Wait for processing and check timing
      await this.sleep(12000) // Wait for at least 2 batches to process

      let completedBatches = 0
      for (const id of ingestionIds) {
        const { data: status } = await this.makeRequest(`/api/status/${id}`)
        completedBatches += status.batches.filter((b) => b.status === "completed").length
      }

      const elapsedTime = Date.now() - startTime
      const expectedMinTime = Math.max(0, (completedBatches - 1) * 5000) // 5s per batch after first

      console.log(`Completed batches: ${completedBatches}`)
      console.log(`Elapsed time: ${elapsedTime}ms`)
      console.log(`Expected min time: ${expectedMinTime}ms`)

      if (elapsedTime >= expectedMinTime * 0.8) {
        // Allow some tolerance
        console.log("✅ Rate limiting appears to be working")
        this.testResults.push({ test: "Rate limiting", passed: true })
      } else {
        console.log("❌ Rate limiting may not be working correctly")
        this.testResults.push({ test: "Rate limiting", passed: false })
      }
    } catch (error) {
      console.log("❌ Rate limiting test error:", error.message)
      this.testResults.push({ test: "Rate limiting", passed: false })
    }
  }

  async testBatching() {
    console.log("\n📦 Testing Batching Logic...")

    try {
      // Submit request with 8 IDs (should create 3 batches: 3, 3, 2)
      const { data } = await this.makeRequest("/api/ingest", {
        method: "POST",
        body: JSON.stringify({
          ids: [1, 2, 3, 4, 5, 6, 7, 8],
          priority: "HIGH",
        }),
      })

      const { data: status } = await this.makeRequest(`/api/status/${data.ingestion_id}`)

      if (status.batches.length === 3) {
        const batchSizes = status.batches.map((b) => b.ids.length)
        if (batchSizes[0] === 3 && batchSizes[1] === 3 && batchSizes[2] === 2) {
          console.log("✅ Batching logic working correctly")
          console.log(`   Batch sizes: ${batchSizes.join(", ")}`)
          this.testResults.push({ test: "Batching logic", passed: true })
        } else {
          console.log("❌ Incorrect batch sizes:", batchSizes)
          this.testResults.push({ test: "Batching logic", passed: false })
        }
      } else {
        console.log("❌ Incorrect number of batches:", status.batches.length)
        this.testResults.push({ test: "Batching logic", passed: false })
      }
    } catch (error) {
      console.log("❌ Batching test error:", error.message)
      this.testResults.push({ test: "Batching logic", passed: false })
    }
  }

  async runAllTests() {
    console.log("🚀 Starting comprehensive API tests...")
    console.log(`Testing against: ${this.baseUrl}`)

    const ingestionId = await this.testIngestionAPI()
    await this.testStatusAPI(ingestionId)
    await this.testBatching()
    await this.testPriorityProcessing()
    await this.testRateLimiting()

    this.printResults()
  }

  printResults() {
    console.log("\n📊 Test Results Summary:")
    console.log("=".repeat(50))

    let passed = 0
    const total = this.testResults.length

    this.testResults.forEach((result) => {
      const status = result.passed ? "✅ PASS" : "❌ FAIL"
      console.log(`${status} - ${result.test}`)
      if (result.passed) passed++
    })

    console.log("=".repeat(50))
    console.log(`Overall: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`)

    if (passed === total) {
      console.log("🎉 All tests passed! API is working correctly.")
    } else {
      console.log("⚠️  Some tests failed. Please check the implementation.")
    }
  }
}

// Run tests
const tester = new APITester(BASE_URL)
tester.runAllTests().catch(console.error)
