"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  Area,
  AreaChart,
} from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const Chart = ({
  type,
  data,
  config,
  className,
}: {
  type: "line" | "bar" | "pie" | "radial" | "area"
  data: Record<string, string | number>[]
  config: ChartConfig
  className?: string
}) => {
  const ChartComponent = React.useMemo(() => {
    switch (type) {
      case "line":
        return LineChart
      case "bar":
        return BarChart
      case "pie":
        return PieChart
      case "radial":
        return RadialBarChart
      case "area":
        return AreaChart
      default:
        return LineChart
    }
  }, [type])

  const renderChartElements = React.useCallback(() => {
    switch (type) {
      case "line":
        return Object.entries(config).map(([key, { color, type }]) => {
          if (type === "value") {
            return <Line key={key} dataKey={key} stroke={`hsl(${color})`} />
          }
          return null
        })
      case "bar":
        return Object.entries(config).map(([key, { color, type }]) => {
          if (type === "value") {
            return <Bar key={key} dataKey={key} fill={`hsl(${color})`} />
          }
          return null
        })
      case "area":
        return Object.entries(config).map(([key, { color, type }]) => {
          if (type === "value") {
            return <Area key={key} dataKey={key} fill={`hsl(${color})`} stroke={`hsl(${color})`} />
          }
          return null
        })
      case "pie":
        return <Pie dataKey="value" nameKey="name" data={data} outerRadius={80} label />
      case "radial":
        return <RadialBar dataKey="value" nameKey="name" data={data} background clockWise dataMax={100} />
      default:
        return null
    }
  }, [type, data, config])

  return (
    <ChartContainer config={config} className={className}>
      <ChartComponent data={data}>
        {type !== "pie" && type !== "radial" && <CartesianGrid vertical={false} />}
        <ChartTooltip content={<ChartTooltipContent />} />
        {renderChartElements()}
      </ChartComponent>
    </ChartContainer>
  )
}

export { Chart }
