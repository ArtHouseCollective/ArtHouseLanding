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
  XAxis,
  YAxis,
  Cell,
} from "recharts"

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Helper to generate a unique ID for accessibility
let chartId = 0

function generateId() {
  return `chart-${chartId++}`
}

interface ChartProps extends React.ComponentProps<typeof ChartContainer> {
  type: "line" | "bar" | "pie" | "radial" | "area"
  data: Record<string, any>[]
  config: ChartConfig
  category: string
  index: string
  value?: string
  name?: string
  showTooltip?: boolean
  showLegend?: boolean
  showGrid?: boolean
  showAxis?: boolean
  aspectRatio?: number
  className?: string
  chartClassName?: string
  title?: string
  description?: string
  footer?: React.ReactNode
  options?: { value: string; label: string }[]
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      type,
      data,
      config,
      category,
      index,
      value,
      name,
      showTooltip = true,
      showLegend = true,
      showGrid = true,
      showAxis = true,
      aspectRatio = 16 / 9,
      className,
      chartClassName,
      title,
      description,
      footer,
      options,
      defaultValue,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    const id = React.useMemo(generateId, [])

    const renderChart = () => {
      switch (type) {
        case "line":
          return (
            <LineChart data={data} className={chartClassName}>
              {showGrid && <CartesianGrid vertical={false} />}
              {showAxis && (
                <>
                  <XAxis
                    dataKey={index}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => config[index]?.label || value}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => config[category]?.label || value}
                  />
                </>
              )}
              {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
              {showLegend && <ChartLegend content={<ChartLegendContent />} />}
              <Line dataKey={category} stroke={config[category]?.color} dot={false} />
            </LineChart>
          )
        case "bar":
          return (
            <BarChart data={data} className={chartClassName}>
              {showGrid && <CartesianGrid vertical={false} />}
              {showAxis && (
                <>
                  <XAxis
                    dataKey={index}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => config[index]?.label || value}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => config[category]?.label || value}
                  />
                </>
              )}
              {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
              {showLegend && <ChartLegend content={<ChartLegendContent />} />}
              <Bar dataKey={category} fill={config[category]?.color} />
            </BarChart>
          )
        case "pie":
          return (
            <PieChart className={chartClassName}>
              {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
              {showLegend && <ChartLegend content={<ChartLegendContent />} />}
              <Pie data={data} dataKey={value} nameKey={name} innerRadius={60} outerRadius={80} fill="#8884d8" label>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={config[entry[name]]?.color} />
                ))}
              </Pie>
            </PieChart>
          )
        case "radial":
          return (
            <RadialBarChart innerRadius="10%" outerRadius="80%" data={data} className={chartClassName}>
              {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
              {showLegend && <ChartLegend content={<ChartLegendContent />} />}
              <RadialBar
                minAngle={15}
                label={{ background: true, formatter: (value: string) => value }}
                dataKey={value}
              />
            </RadialBarChart>
          )
        case "area":
          return (
            <AreaChart data={data} className={chartClassName}>
              {showGrid && <CartesianGrid vertical={false} />}
              {showAxis && (
                <>
                  <XAxis
                    dataKey={index}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => config[index]?.label || value}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value: string) => config[category]?.label || value}
                  />
                </>
              )}
              {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
              {showLegend && <ChartLegend content={<ChartLegendContent />} />}
              <Area
                type="monotone"
                dataKey={category}
                stroke={config[category]?.color}
                fill={config[category]?.color}
              />
            </AreaChart>
          )
        default:
          return null
      }
    }

    return (
      <ChartContainer ref={ref} config={config} className={cn("min-h-[200px] w-full", className)} id={id} {...props}>
        <div className="flex flex-col space-y-1.5 p-6">
          {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {options && (
            <div className="flex items-center space-x-2">
              <Label htmlFor={`${id}-select`}>View:</Label>
              <Select defaultValue={defaultValue} onValueChange={onValueChange}>
                <SelectTrigger id={`${id}-select`} className="w-[180px]">
                  <SelectValue placeholder="Select a view" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex-1 p-6 pt-0" style={{ aspectRatio: aspectRatio }}>
          {renderChart()}
        </div>
        {footer && <div className="flex items-center p-6 pt-0">{footer}</div>}
      </ChartContainer>
    )
  },
)

Chart.displayName = "Chart"

export { Chart }
