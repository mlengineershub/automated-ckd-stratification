"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PredictionResult {
  probability: number
}

interface TestData {
  patientId: string
  date: Date
  test: string
  value: number
  unit: string
}

export default function PredictionForm() {
  const [allTestData, setAllTestData] = useState<TestData[]>([])
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [latestTest, setLatestTest] = useState<TestData | null>(null)

  const { addToast } = useToast();

  // Parse CSV data into test entries
  const parseCSVData = (data: string) => {
    const lines = data.split('\n')
    return lines.slice(1).filter(line => line.trim() !== '').map(line => {
      const [id, date, test, value, raw_info, unit] = line.split(',')
      return {
        patientId: id,
        date: new Date(date), // Convert to Date object for sorting
        test,
        value: parseFloat(value),
        unit
      }
    })
  }

  // Load and parse CSV data
  const loadCSVData = async () => {
    try {
      const response = await fetch('/data/cleaned_labs.csv')
      if (!response.ok) {
        throw new Error('Failed to fetch CSV data')
      }
      const data = await response.text()
      const parsedData = parseCSVData(data)
      setAllTestData(parsedData)
      
      // Get unique patient IDs
      const patientIds = [...new Set(parsedData.map(entry => entry.patientId))]
      
      if (patientIds.length > 0) {
        setSelectedPatient(patientIds[0]) // Set the first patient ID as the default
      }
    } catch (error) {
      console.error('Error loading CSV data:', error)
      addToast({
        title: "Error loading patient data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadCSVData()
  }, [])

  // Update latest test when patient selection changes
  useEffect(() => {
    if (selectedPatient && allTestData.length > 0) {
      // Filter tests for the selected patient
      const patientTests = allTestData.filter(
        item => item.patientId === selectedPatient
      )
      
      // Sort by date (newest first) and get the latest test
      const sortedTests = patientTests.sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      )
      
      setLatestTest(sortedTests.length > 0 ? sortedTests[0] : null)
    } else {
      setLatestTest(null)
    }
  }, [selectedPatient, allTestData])

  const handlePredict = async () => {
    if (!selectedPatient || !latestTest) {
      addToast({
        title: "Missing data",
        description: "Please select a patient and test type",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    setPrediction(null)
    
    try {
      // Send prediction request to the backend
      const response = await fetch("http://0.0.0.0:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: latestTest.test,
          measurement: latestTest.value
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Prediction failed: ${errorText}`)
      }
      
      const result = await response.json()
      console.log("Prediction result:", result)
      setPrediction(result)
    } catch (error) {
      console.error("Prediction error:", error)
      addToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get prediction",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const probability = prediction ? prediction.probability * 100 : 0
  const riskLevel = probability < 30 ? 'Low Risk' : probability < 70 ? 'Moderate Risk' : 'High Risk'
  const riskColor = probability < 30 ? 'bg-green-500' : probability < 70 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">CKD Prediction Model</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Test Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Patient ID</label>
                <Select onValueChange={setSelectedPatient} value={selectedPatient}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...new Set(allTestData
                      .map(entry => entry.patientId)
                      .filter(id => id && id.trim() !== '')
                    )].map((id) => (
                      <SelectItem key={id} value={id}>
                        Patient {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {latestTest && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium">Selected Test Value</p>
                  <p className="text-lg">
                    {latestTest.value} {latestTest.unit} ({latestTest.test})
                  </p>
                </div>
              )}

              <button
                onClick={handlePredict}
                disabled={!selectedPatient || !latestTest || isLoading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Predicting..." : "Get Prediction"}
              </button>

              {isLoading && (
                <div className="space-y-2 animate-pulse">
                  <p className="text-sm text-gray-600">Analyzing test results...</p>
                  <Progress value={50} className="w-full bg-gray-200" />
                  <p className="text-xs text-gray-500">This may take a few seconds</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {prediction && (
          <Card>
            <CardHeader>
              <CardTitle>CKD Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500 mb-1">Risk Probability</p>
                <p className="text-4xl font-bold mb-2">
                  {probability.toFixed(1)}%
                </p>
                <div className="w-full h-6 bg-gray-100 rounded-full mt-4 relative overflow-hidden">
                  <div 
                    className={`h-full ${riskColor} transition-all duration-500`}
                    style={{ width: `${probability}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium text-white drop-shadow-md">
                      {riskLevel}
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-md text-left">
                  <h3 className="font-medium mb-2">Assessment Details</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Patient ID:</span> {selectedPatient}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Test Type:</span> {latestTest?.test}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Test Value:</span> {latestTest?.value} {latestTest?.unit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
