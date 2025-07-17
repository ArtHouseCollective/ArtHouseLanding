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
import { cn } from "@/lib/utils"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Helper to determine chart type from data keys
function getChartType(data: any[], dataKeys: string[]) {
  if (!data || data.length === 0 || dataKeys.length === 0) return null

  // Check for common chart patterns
  if (dataKeys.length === 1 && typeof data[0][dataKeys[0]] === "number") {
    // If single numeric key, could be bar or line
    return "bar" // Default to bar for simplicity
  }
  if (
    dataKeys.length > 1 &&
    data.every((d) => typeof d[dataKeys[0]] === "string" && typeof d[dataKeys[1]] === "number")
  ) {
    // If first key is string (category) and second is number, could be pie or radial
    return "pie" // Default to pie for simplicity
  }
  return "line" // Default to line for multi-series or time-series like data
}

interface ChartProps {
  data: Record<string, any>[]
  dataKeys: string[]
  chartType?: "line" | "bar" | "pie" | "radial" | "area"
  categoryKey?: string
  valueKey?: string
  chartProps?:
    | React.ComponentProps<typeof LineChart>
    | React.ComponentProps<typeof BarChart>
    | React.ComponentProps<typeof PieChart>
    | React.ComponentProps<typeof RadialBarChart>
    | React.ComponentProps<typeof AreaChart>
  seriesProps?: React.ComponentProps<typeof Line> | React.ComponentProps<typeof Bar> | React.ComponentProps<typeof Area>
  pieProps?: React.ComponentProps<typeof Pie>
  radialBarProps?: React.ComponentProps<typeof RadialBar>
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  showAxis?: boolean
  aspectRatio?: number
  height?: number
  width?: number
  enableSelect?: boolean
  children?: React.ReactNode
}

const Chart: React.FC<ChartProps> = ({
  data,
  dataKeys,
  chartType: propChartType,
  categoryKey,
  valueKey,
  chartProps,
  seriesProps,
  pieProps,
  radialBarProps,
  showGrid = false,
  showTooltip = true,
  showLegend = false,
  showAxis = true,
  aspectRatio = 16 / 9,
  height = 300,
  width = 500,
  enableSelect = false,
  children,
  ...props
}) => {
  const [chartType, setChartType] = React.useState(propChartType || getChartType(data, dataKeys) || "line")

  const renderChart = () => {
    const commonProps = {
      data,
      aspect: aspectRatio,
      height,
      width,
      ...chartProps,
    }

    const renderSeries = () => {
      if (chartType === "pie" || chartType === "radial") {
        return null // Handled by Pie/RadialBar component directly
      }
      return dataKeys.map((key) => {
        const color = `hsl(var(--chart-${dataKeys.indexOf(key) + 1}))`
        if (chartType === "line") {
          return <Line key={key} dataKey={key} stroke={color} {...seriesProps} />
        }
        if (chartType === "bar") {
          return <Bar key={key} dataKey={key} fill={color} {...seriesProps} />
        }
        if (chartType === "area") {
          return <Area key={key} dataKey={key} stroke={color} fill={color} {...seriesProps} />
        }
        return null
      })
    }

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid vertical={false} />}
            {showTooltip && <></>} {/* Add ChartTooltip if needed */}
            {showAxis && <></>} {/* Add XAxis, YAxis if needed */}
            {renderSeries()}
          </LineChart>
        )
      case "bar":
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid vertical={false} />}
            {showTooltip && <></>} {/* Add ChartTooltip if needed */}
            {showAxis && <></>} {/* Add XAxis, YAxis if needed */}
            {renderSeries()}
          </BarChart>
        )
      case "pie":
        if (!categoryKey || !valueKey) {
          console.warn("Pie chart requires categoryKey and valueKey props.")
          return null
        }
        return (
          <PieChart {...commonProps}>
            {showTooltip && <></>} {/* Add ChartTooltip if needed */}
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={categoryKey}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
              {...pieProps}
            />
          </PieChart>
        )
      case "radial":
        if (!categoryKey || !valueKey) {
          console.warn("RadialBar chart requires categoryKey and valueKey props.")
          return null
        }
        return (
          <RadialBarChart
            innerRadius="10%"
            outerRadius="80%"
            data={data}
            startAngle={90}
            endAngle={-270}
            {...commonProps}
          >
            {showTooltip && <></>} {/* Add ChartTooltip if needed */}
            <RadialBar
              minAngle={15}
              label={{ position: "insideStart", fill: "#fff" }}
              background
              clockWise
              dataKey={valueKey}
              {...radialBarProps}
            />
          </RadialBarChart>
        )
      case "area":
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid vertical={false} />}
            {showTooltip && <></>} {/* Add ChartTooltip if needed */}
            {showAxis && <></>} {/* Add XAxis, YAxis if needed */}
            {renderSeries()}
          </AreaChart>
        )
      default:
        return null
    }
  }

  return (
    <div {...props}>
      {enableSelect && (
        <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
          <SelectTrigger className="w-[180px] mb-4">
            <SelectValue placeholder="Select Chart Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
            <SelectItem value="pie">Pie Chart</SelectItem>
            <SelectItem value="radial">Radial Bar Chart</SelectItem>
            <SelectItem value="area">Area Chart</SelectItem>
          </SelectContent>
        </Select>
      )}
      <div className={cn("flex aspect-video justify-center text-tremor-content")}>{children || renderChart()}</div>
    </div>
  )
}

const ChartContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex aspect-video justify-center text-tremor-content", className)} {...props} />
  ),
)
ChartContainer.displayName = "ChartContainer"

export { Chart, ChartContainer }
