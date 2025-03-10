"use client"

import * as React from "react"
import type { ChartConfig, ChartColors } from "./chart-config"

interface ChartContextValue {
  config: ChartConfig
  colors: ChartColors
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a ChartProvider")
  }

  return context
}

interface ChartContainerProps {
  config: ChartConfig
  children: React.ReactNode
  className?: string
}

function ChartContainer({ config, children, className }: ChartContainerProps) {
  const colors = React.useMemo(() => {
    return Object.entries(config).reduce<ChartColors>((acc, [key, value]) => {
      acc[`--color-${key}`] = value.color
      return acc
    }, {})
  }, [config])

  return (
    <ChartContext.Provider value={{ config, colors }}>
      <div className={className} style={colors}>
        <div className="h-full w-full">{children}</div>
      </div>
    </ChartContext.Provider>
  )
}

interface ChartTooltipProps {
  children?: React.ReactNode
  className?: string
  cursor?: boolean
  content?: React.ReactNode
}

function ChartTooltip({ children, className, cursor = true, content, ...props }: ChartTooltipProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: string | number
    payload: Record<string, any>
  }>
  label?: string
  className?: string
  indicator?: "dot" | "line" | "dashed"
  hideLabel?: boolean
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className={`rounded-lg border bg-background p-2 shadow-sm ${className}`}>
      {!hideLabel && label ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
        </div>
      ) : null}
      <div className="grid gap-2">
        {payload.map((item, index) => {
          const { name, value } = item
          const color = config[name.toLowerCase()]?.color || config[Object.keys(config)[index]]?.color

          return (
            <div key={name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {indicator === "dot" ? (
                  <div
                    className="h-1 w-1 rounded-full"
                    style={{
                      background: color,
                    }}
                  />
                ) : indicator === "line" ? (
                  <div
                    className="h-2 w-0.5"
                    style={{
                      background: color,
                    }}
                  />
                ) : indicator === "dashed" ? (
                  <div
                    className="h-0 w-2 border border-dashed border-t-0 border-x-0"
                    style={{
                      borderBottomColor: color,
                    }}
                  />
                ) : null}
                <span className="text-xs text-muted-foreground">{config[name.toLowerCase()]?.label || name}</span>
              </div>
              <span className="text-xs font-medium">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, useChart }

