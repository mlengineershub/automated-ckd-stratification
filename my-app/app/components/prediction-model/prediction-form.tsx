"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { type PatientData, type PredictionResult, predictCKDRisk } from "@/lib/prediction-model/model-interface"
import { Progress } from "@/components/ui/progress"

export default function PredictionForm() {
  const [patientData, setPatientData] = useState<PatientData>({
    age: 0,
    gender: "male",
    hasDiabetes: false,
    hasHypertension: false,
    bmi: 0,
    systolicBP: 0,
    diastolicBP: 0,
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setPatientData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNumberInput = (field: string, value: string) => {
    const numValue = value === "" ? 0 : Number(value)
    handleInputChange(field, numValue)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const result = await predictCKDRisk(patientData)
      setPrediction(result)
    } catch (error) {
      console.error("Prediction error:", error)
      alert("Error making prediction. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setPatientData({
      age: 0,
      gender: "male",
      hasDiabetes: false,
      hasHypertension: false,
      bmi: 0,
      systolicBP: 0,
      diastolicBP: 0,
    })
    setPrediction(null)
  }

  // Get color for risk category
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500"
      case "Moderate":
        return "bg-yellow-500"
      case "High":
        return "bg-orange-500"
      case "Very High":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">CKD Prediction Model</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={patientData.age || ""}
                    onChange={(e) => handleNumberInput("age", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <RadioGroup
                    id="gender"
                    value={patientData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    className="flex space-x-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female">Female</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medical History</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasDiabetes"
                      checked={patientData.hasDiabetes}
                      onCheckedChange={(checked) => handleInputChange("hasDiabetes", checked === true)}
                    />
                    <Label htmlFor="hasDiabetes">Diabetes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasHypertension"
                      checked={patientData.hasHypertension}
                      onCheckedChange={(checked) => handleInputChange("hasHypertension", checked === true)}
                    />
                    <Label htmlFor="hasHypertension">Hypertension</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="bmi">BMI (kg/m²)</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={patientData.bmi || ""}
                  onChange={(e) => handleNumberInput("bmi", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systolicBP">Systolic BP (mmHg)</Label>
                  <Input
                    id="systolicBP"
                    type="number"
                    value={patientData.systolicBP || ""}
                    onChange={(e) => handleNumberInput("systolicBP", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="diastolicBP">Diastolic BP (mmHg)</Label>
                  <Input
                    id="diastolicBP"
                    type="number"
                    value={patientData.diastolicBP || ""}
                    onChange={(e) => handleNumberInput("diastolicBP", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eGFR">eGFR (optional)</Label>
                  <Input
                    id="eGFR"
                    type="number"
                    step="0.1"
                    value={patientData.eGFR || ""}
                    onChange={(e) => handleNumberInput("eGFR", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="uACR">uACR (optional)</Label>
                  <Input
                    id="uACR"
                    type="number"
                    step="0.1"
                    value={patientData.uACR || ""}
                    onChange={(e) => handleNumberInput("uACR", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Predict CKD Risk"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 py-8">
                <p className="text-center">Analyzing patient data...</p>
                <Progress value={45} className="w-full" />
              </div>
            ) : prediction ? (
              <div className="space-y-6">
                <div className="text-center p-6 rounded-lg border">
                  <p className="text-sm text-gray-500 mb-1">CKD Risk Probability</p>
                  <p className="text-4xl font-bold mb-2">{(prediction.probability * 100).toFixed(1)}%</p>
                  <div
                    className={`inline-block px-3 py-1 rounded-full text-white ${getRiskColor(prediction.riskCategory)}`}
                  >
                    {prediction.riskCategory} Risk
                  </div>
                  <p className="text-sm mt-2">Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Key Risk Factors:</h3>
                  <ul className="space-y-3">
                    {prediction.topFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <p className="font-medium">{feature.feature}</p>
                          <p className="text-sm text-gray-600">
                            Value: {typeof feature.value === "boolean" ? (feature.value ? "Yes" : "No") : feature.value}
                          </p>
                        </div>
                        <div
                          className={`text-sm ${feature.direction === "increases risk" ? "text-red-500" : "text-green-500"}`}
                        >
                          {feature.direction}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Recommended Actions:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {prediction.recommendedActions.map((action, index) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border rounded-md border-dashed">
                <div className="text-center text-gray-500">
                  <p className="mb-2">Enter patient data to predict CKD risk</p>
                  <p className="text-sm">
                    The model will analyze risk factors and provide personalized recommendations
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

