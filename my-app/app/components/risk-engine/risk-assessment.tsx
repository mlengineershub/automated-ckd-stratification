"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { determineRiskLevel } from "@/lib/risk-engine/risk-classification"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts"
// Fonction pour convertir le niveau de risque numérique en texte
const getRiskLabel = (value: number) => {
  switch (value) {
    case 1:
      return "Low"
    case 2:
      return "Moderate"
    case 3:
      return "High"
    case 4:
      return "Very High"
    default:
      return "Unknown"
  }
}

// Fetch patient data from API
const fetchPatientData = async (patientId: string) => {
  try {
    const response = await fetch(`/api/patient-data?patientId=${patientId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch patient data')
    }
    const data = await response.json()
    return data.map((entry: any) => ({
      ...entry,
      riskLabel: getRiskLabel(entry.riskValue)
    }))
  } catch (error) {
    console.error('Error fetching patient data:', error)
    return []
  }
}

// Base de données des patients
const patientsDatabase: Record<string, any> = {}

// Couleurs pour les graphiques
const colors = {
  eGFR: "#2563eb",
  uACR: "#16a34a",
  risk: "#9333ea", // Violet pour la ligne de risque
}

export default function RiskAssessment() {
  const [selectedPatient, setSelectedPatient] = useState<string>("1523060") // Patient par défaut
  const [patientData, setPatientData] = useState<any[]>([])

  // Update patient data when selection changes
  useEffect(() => {
    const loadData = async () => {
      if (!patientsDatabase[selectedPatient]) {
        const data = await fetchPatientData(selectedPatient)
        patientsDatabase[selectedPatient] = data
      }
      setPatientData(patientsDatabase[selectedPatient])
    }
    
    loadData()
  }, [selectedPatient])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Patient History Visualization</h1>

      <div className="mb-6 flex justify-end">
        <Select value={selectedPatient} onValueChange={setSelectedPatient}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(patientsDatabase).map((id) => (
              <SelectItem key={id} value={id}>
                Patient {id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* eGFR Chart */}
        <Card>
          <CardHeader>
            <CardTitle>eGFR History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[0, "dataMax + 20"]}
                    label={{ value: "eGFR (mL/min/1.73m²)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded shadow-md">
                            <p className="font-semibold text-gray-600">{`Date: ${label}`}</p>
                            <p className="text-blue-600">{`eGFR: ${payload[0].value || 'N/A'} mL/min/1.73m²`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="eGFR"
                    stroke={colors.eGFR}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* uACR Chart */}
        <Card>
          <CardHeader>
            <CardTitle>uACR History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis
                    domain={[0, "dataMax + 50"]}
                    label={{ value: "uACR (mg/g)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded shadow-md">
                            <p className="font-semibold text-gray-600">{`Date: ${label}`}</p>
                            <p className="text-green-600">{`uACR: ${payload[0].value || 'N/A'} mg/g`}</p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="uACR"
                    stroke={colors.uACR}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Level Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Level History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4]}
                  tickFormatter={(value) => {
                    switch (value) {
                      case 1:
                        return "Low"
                      case 2:
                        return "Moderate"
                      case 3:
                        return "High"
                      case 4:
                        return "Very High"
                      default:
                        return ""
                    }
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const riskValue = Number(payload[0].value) || 1
                      return (
                        <div className="bg-white p-3 border rounded shadow-md">
                          <p className="font-semibold text-gray-600">{`Date: ${label}`}</p>
                          <p className="text-purple-600">{`Risk Level: ${getRiskLabel(riskValue)}`}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend formatter={() => "Risk Level"} />
                <Line
                  type="stepAfter"
                  dataKey="riskValue"
                  name="Risk Level"
                  stroke={colors.risk}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
