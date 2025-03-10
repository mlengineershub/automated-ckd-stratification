"use client"

import { useState, useEffect } from "react"
import type { Alert, AlertPriority } from "@/lib/alert-system/alert-generator"
import AlertCard from "./alert-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AlertDashboardProps {
  initialAlerts: Alert[]
}

export default function AlertDashboard({ initialAlerts }: AlertDashboardProps) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(initialAlerts)
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Handle alert acknowledgment
  const handleAcknowledge = (alertId: string) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
    )
  }

  // Apply filters whenever alerts or filter settings change
  useEffect(() => {
    let filtered = [...alerts]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (alert) =>
          alert.patientName.toLowerCase().includes(query) ||
          alert.title.toLowerCase().includes(query) ||
          alert.description.toLowerCase().includes(query),
      )
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((alert) => alert.priority === priorityFilter)
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((alert) => alert.category === categoryFilter)
    }

    setFilteredAlerts(filtered)
  }, [alerts, searchQuery, priorityFilter, categoryFilter])

  // Count alerts by priority
  const countByPriority = (priority: AlertPriority) => {
    return alerts.filter((alert) => alert.priority === priority && !alert.acknowledged).length
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">CKD Alert Dashboard</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 dark:text-red-200">Critical</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-300">{countByPriority("Critical")}</p>
        </div>
        <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800 dark:text-orange-200">High</h3>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-300">{countByPriority("High")}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Medium</h3>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">{countByPriority("Medium")}</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200">Low</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{countByPriority("Low")}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by patient name or alert details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Risk">Risk</SelectItem>
              <SelectItem value="Test">Test</SelectItem>
              <SelectItem value="Prediction">Prediction</SelectItem>
              <SelectItem value="Medication">Medication</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {filteredAlerts.filter((a) => !a.acknowledged).length > 0 ? (
            filteredAlerts
              .filter((a) => !a.acknowledged)
              .map((alert) => <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />)
          ) : (
            <p className="text-center py-8 text-gray-500">No active alerts match your filters.</p>
          )}
        </TabsContent>

        <TabsContent value="acknowledged">
          {filteredAlerts.filter((a) => a.acknowledged).length > 0 ? (
            filteredAlerts
              .filter((a) => a.acknowledged)
              .map((alert) => <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />)
          ) : (
            <p className="text-center py-8 text-gray-500">No acknowledged alerts match your filters.</p>
          )}
        </TabsContent>

        <TabsContent value="all">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} onAcknowledge={handleAcknowledge} />)
          ) : (
            <p className="text-center py-8 text-gray-500">No alerts match your filters.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

