import RiskAssessment from "@/app/components/risk-engine/risk-assessment"
import PredictionForm from "@/app/components/prediction-model/prediction-form"
import AlertDashboard from "@/app/components/alert-system/alert-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample alerts for demonstration
const sampleAlerts = [
  {
    id: "1",
    patientId: "P12345",
    patientName: "John Smith",
    priority: "Critical",
    title: "Rapid eGFR Decline",
    description: "Patient's eGFR has decreased by 15 mL/min/1.73m² (25%) in the last 3 months.",
    recommendations: [
      "Urgent nephrology referral",
      "Check for acute kidney injury",
      "Review medications for nephrotoxicity",
    ],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    acknowledged: false,
    category: "Risk",
  },
  {
    id: "2",
    patientId: "P23456",
    patientName: "Jane Doe",
    priority: "High",
    title: "High CKD Risk with Diabetes",
    description: "Patient has high risk of CKD progression with poorly controlled diabetes (HbA1c: 9.2%).",
    recommendations: [
      "Optimize diabetes management",
      "Consider nephrology co-management",
      "Monitor kidney function every 3 months",
    ],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    acknowledged: false,
    category: "Risk",
  },
  {
    id: "3",
    patientId: "P34567",
    patientName: "Robert Johnson",
    priority: "Medium",
    title: "Overdue Test: uACR",
    description: "Last test was 395 days ago. Recommended frequency: Annual.",
    recommendations: ["Order urine albumin-to-creatinine ratio test", "Rationale: Monitor for kidney damage"],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    acknowledged: false,
    category: "Test",
  },
  {
    id: "4",
    patientId: "P45678",
    patientName: "Sarah Williams",
    priority: "High",
    title: "High Predicted CKD Risk",
    description: "Patient has a 72.5% probability of developing CKD in the next 5 years.",
    recommendations: [
      "Monitor kidney function closely",
      "Optimize blood pressure control",
      "Consider ACE inhibitor or ARB therapy",
    ],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    acknowledged: false,
    category: "Prediction",
  },
  {
    id: "5",
    patientId: "P56789",
    patientName: "Michael Brown",
    priority: "Low",
    title: "Medication Review Needed",
    description: "Patient is on multiple medications that may affect kidney function.",
    recommendations: ["Review medication list for nephrotoxic agents", "Consider dose adjustments based on eGFR"],
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    acknowledged: true,
    category: "Medication",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">CKD Early Detection System</h1>

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="alerts">Alert Dashboard</TabsTrigger>
            <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            <TabsTrigger value="prediction">CKD Prediction</TabsTrigger>
          </TabsList>

          <TabsContent value="alerts">
            <AlertDashboard initialAlerts={sampleAlerts} />
          </TabsContent>

          <TabsContent value="risk">
            <RiskAssessment />
          </TabsContent>

          <TabsContent value="prediction">
            <PredictionForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}

