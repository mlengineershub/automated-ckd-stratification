"use client"

import { useState } from "react"
import type { Alert } from "@/lib/alert-system/alert-generator"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, AlertCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AlertCardProps {
  alert: Alert
  onAcknowledge: (alertId: string) => void
}

export default function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  const [expanded, setExpanded] = useState(false)

  // Determine color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500 hover:bg-red-600"
      case "High":
        return "bg-orange-500 hover:bg-orange-600"
      case "Medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "Low":
        return "bg-blue-500 hover:bg-blue-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  // Get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Risk":
        return <AlertCircle className="h-5 w-5" />
      case "Test":
        return <Clock className="h-5 w-5" />
      case "Prediction":
        return <AlertTriangle className="h-5 w-5" />
      case "Medication":
        return <AlertCircle className="h-5 w-5" />
      case "Referral":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  return (
    <Card
      className={`mb-4 border-l-4 ${alert.acknowledged ? "border-l-gray-300" : `border-l-${alert.priority.toLowerCase()}`}`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getCategoryIcon(alert.category)}
            <CardTitle className="text-lg">{alert.title}</CardTitle>
          </div>
          <Badge className={getPriorityColor(alert.priority)}>{alert.priority}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 dark:text-gray-300">{alert.description}</p>
        <p className="text-xs text-gray-500 mt-1">Patient: {alert.patientName}</p>

        {expanded && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Recommendations:</h4>
            <ul className="list-disc pl-5 text-sm">
              {alert.recommendations.map((rec, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-xs flex items-center">
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show More
            </>
          )}
        </Button>

        {!alert.acknowledged && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAcknowledge(alert.id)}
            className="text-xs flex items-center"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Acknowledge
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

