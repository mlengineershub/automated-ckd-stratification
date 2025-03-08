"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { calculateEGFR, calculateUACR, categorizeEGFR, categorizeUACR } from "@/lib/risk-engine/calculations"
import { determineRiskLevel, isNephrologyReferralRecommended } from "@/lib/risk-engine/risk-classification"
import { generateTestRecommendations } from "@/lib/risk-engine/test-recommendations"
import { Alert, Badge } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"

export default function RiskAssessment() {
  // Patient demographics
  const [age, setAge] = useState<number | "">("")
  const [isFemale, setIsFemale] = useState(false)
  const [isBlack, setIsBlack] = useState(false)
  const [hasDiabetes, setHasDiabetes] = useState(false)
  const [hasHypertension, setHasHypertension] = useState(false)

  // Lab values
  const [creatinine, setCreatinine] = useState<number | "">("")
  const [urineAlbumin, setUrineAlbumin] = useState<number | "">("")
  const [urineCreatinine, setUrineCreatinine] = useState<number | "">("")

  // Calculated values
  const [eGFR, setEGFR] = useState<number | null>(null)
  const [uACR, setUACR] = useState<number | null>(null)
  const [riskLevel, setRiskLevel] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [referralRecommended, setReferralRecommended] = useState<boolean | null>(null)

  // Calculate kidney function
  const calculateKidneyFunction = () => {
    if (age === "" || creatinine === "") {
      alert("Please enter age and serum creatinine to calculate eGFR")
      return
    }

    // Calculate eGFR
    const calculatedEGFR = calculateEGFR(creatinine as number, age as number, isFemale, isBlack)
    setEGFR(calculatedEGFR)

    // Calculate uACR if possible
    let calculatedUACR = null
    if (urineAlbumin !== "" && urineCreatinine !== "") {
      calculatedUACR = calculateUACR(urineAlbumin as number, urineCreatinine as number)
      setUACR(calculatedUACR)
    }

    // Determine risk level if both values are available
    if (calculatedEGFR && calculatedUACR) {
      const risk = determineRiskLevel(calculatedEGFR, calculatedUACR)
      setRiskLevel(risk)

      // Check if nephrology referral is recommended
      const referral = isNephrologyReferralRecommended(calculatedEGFR, calculatedUACR, hasDiabetes, hasHypertension)
      setReferralRecommended(referral)

      // Generate test recommendations
      const testRecs = generateTestRecommendations(
        risk,
        hasDiabetes,
        hasHypertension,
        true, // has eGFR
        true, // has uACR
        age as number,
      )
      setRecommendations(testRecs)
    } else {
      // Generate recommendations based on available data
      const testRecs = generateTestRecommendations(
        "Unknown",
        hasDiabetes,
        hasHypertension,
        calculatedEGFR !== null,
        calculatedUACR !== null,
        age as number,
      )
      setRecommendations(testRecs)
    }
  }

  // Reset form
  const resetForm = () => {
    setAge("")
    setIsFemale(false)
    setIsBlack(false)
    setHasDiabetes(false)
    setHasHypertension(false)
    setCreatinine("")
    setUrineAlbumin("")
    setUrineCreatinine("")
    setEGFR(null)
    setUACR(null)
    setRiskLevel(null)
    setRecommendations([])
    setReferralRecommended(null)
  }

  // Get color for risk level
  const getRiskColor = (risk: string | null) => {
    if (!risk) return "bg-gray-200 text-gray-800"

    switch (risk) {
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      case "Moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Very High":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">CKD Risk Assessment</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Age (years)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                  />
                </div>
                <div className="flex items-end space-x-4 pb-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFemale"
                      checked={isFemale}
                      onCheckedChange={(checked) => setIsFemale(checked === true)}
                    />
                    <Label htmlFor="isFemale">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isBlack"
                      checked={isBlack}
                      onCheckedChange={(checked) => setIsBlack(checked === true)}
                    />
                    <Label htmlFor="isBlack">Black</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Risk Factors</Label>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasDiabetes"
                      checked={hasDiabetes}
                      onCheckedChange={(checked) => setHasDiabetes(checked === true)}
                    />
                    <Label htmlFor="hasDiabetes">Diabetes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasHypertension"
                      checked={hasHypertension}
                      onCheckedChange={(checked) => setHasHypertension(checked === true)}
                    />
                    <Label htmlFor="hasHypertension">Hypertension</Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="creatinine">Serum Creatinine (mg/dL)</Label>
                <Input
                  id="creatinine"
                  type="number"
                  step="0.01"
                  value={creatinine}
                  onChange={(e) => setCreatinine(e.target.value ? Number(e.target.value) : "")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urineAlbumin">Urine Albumin (mg/L)</Label>
                  <Input
                    id="urineAlbumin"
                    type="number"
                    step="0.1"
                    value={urineAlbumin}
                    onChange={(e) => setUrineAlbumin(e.target.value ? Number(e.target.value) : "")}
                  />
                </div>
                <div>
                  <Label htmlFor="urineCreatinine">Urine Creatinine (mg/dL)</Label>
                  <Input
                    id="urineCreatinine"
                    type="number"
                    step="0.1"
                    value={urineCreatinine}
                    onChange={(e) => setUrineCreatinine(e.target.value ? Number(e.target.value) : "")}
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button onClick={calculateKidneyFunction}>Calculate Risk</Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-md p-4">
                  <p className="text-sm text-gray-500 mb-1">eGFR</p>
                  <p className="text-2xl font-bold">{eGFR !== null ? `${eGFR} mL/min/1.73m²` : "—"}</p>
                  {eGFR !== null && <p className="text-sm mt-1">Category: {categorizeEGFR(eGFR)}</p>}
                </div>

                <div className="border rounded-md p-4">
                  <p className="text-sm text-gray-500 mb-1">uACR</p>
                  <p className="text-2xl font-bold">{uACR !== null ? `${uACR} mg/g` : "—"}</p>
                  {uACR !== null && <p className="text-sm mt-1">Category: {categorizeUACR(uACR)}</p>}
                </div>
              </div>

              {riskLevel && (
                <div className={`border rounded-md p-4 ${getRiskColor(riskLevel)}`}>
                  <p className="text-sm mb-1">CKD Risk Level</p>
                  <p className="text-2xl font-bold">{riskLevel}</p>
                  <p className="text-sm mt-1">Based on KDIGO classification</p>
                </div>
              )}

              {referralRecommended !== null && (
                <Alert variant={referralRecommended ? "destructive" : "default"}>
                  <AlertCircle className="h-4 w-4" />
                  <p className="ml-2">
                    {referralRecommended ? "Nephrology referral is recommended" : "Routine monitoring recommended"}
                  </p>
                </Alert>
              )}

              {recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Recommended Tests:</h3>
                  <ul className="space-y-2">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="border rounded-md p-3">
                        <div className="flex justify-between">
                          <p className="font-medium">{rec.test}</p>
                          <Badge variant="outline">{rec.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Frequency: {rec.frequency}</p>
                        <p className="text-sm text-gray-600">Rationale: {rec.rationale}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!eGFR && !uACR && (
                <div className="flex items-center justify-center h-40 border rounded-md border-dashed">
                  <div className="text-center text-gray-500">
                    <Info className="h-8 w-8 mx-auto mb-2" />
                    <p>Enter patient information and lab values to calculate risk</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

