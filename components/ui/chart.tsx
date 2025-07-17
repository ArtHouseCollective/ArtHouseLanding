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
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  type LayoutType,
  type BarChartProps,
  type LineChartProps,
  type AreaChartProps,
  type RadialBarChartProps,
  type PieChartProps,
  type ScatterChartProps,
} from "recharts"

import { cn } from "@/lib/utils"

const ChartContext = React.createContext<ChartContextProps>({
  data: [],
  categories: [],
  index: "",
  type: "bar",
  layout: "vertical",
})

type ChartContextProps = {
  data: Record<string, any>[]
  categories: string[]
  index: string
  type: ChartType
  layout: LayoutType
}

type ChartProps = {
  data: Record<string, any>[]
  categories: string[]
  index: string
  type?: ChartType
  layout?: LayoutType
} & (
  | { type: "bar"; chartProps?: BarChartProps }
  | { type: "line"; chartProps?: LineChartProps }
  | { type: "area"; chartProps?: AreaChartProps }
  | { type: "radialbar"; chartProps?: RadialBarChartProps }
  | { type: "pie"; chartProps?: PieChartProps }
  | { type: "scatter"; chartProps?: ScatterChartProps }
) &
  React.HTMLAttributes<HTMLDivElement>

type ChartType = "bar" | "line" | "area" | "radialbar" | "pie" | "scatter"

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ data, categories, index, type = "bar", layout = "vertical", className, children, chartProps, ...props }, ref) => {
    const ChartPrimitive = React.useMemo(() => {
      if (type === "bar") return BarChart
      if (type === "line") return LineChart
      if (type === "area") return AreaChart
      if (type === "radialbar") return RadialBarChart
      if (type === "pie") return PieChart
      if (type === "scatter") return ScatterChart
      return null
    }, [type])

    if (!ChartPrimitive) {
      return null
    }

    return (
      <ChartContext.Provider value={{ data, categories, index, type, layout }}>
        <div ref={ref} className={cn("w-full h-96", className)} {...props}>
          <ChartPrimitive data={data} layout={layout} className="size-full" {...chartProps}>
            {children}
          </ChartPrimitive>
        </div>
      </ChartContext.Provider>
    )
  },
)
Chart.displayName = "Chart"

const ChartCrosshair = ({ className, ...props }: React.ComponentProps<typeof CartesianGrid>) => {
  return (
    <CartesianGrid strokeDasharray="3 3" vertical={false} className={cn("stroke-gray-200", className)} {...props} />
  )
}
ChartCrosshair.displayName = "ChartCrosshair"

const ChartAxis = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof XAxis>>(
  ({ className, ...props }, ref) => {
    const { layout } = React.useContext(ChartContext)

    return (
      <XAxis
        ref={ref}
        stroke="#888888"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        className={cn("text-sm", className)}
        {...(layout === "horizontal" ? { type: "category" } : { type: "number" })}
        {...props}
      />
    )
  },
)
ChartAxis.displayName = "ChartAxis"

const ChartYAxis = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof YAxis>>(
  ({ className, ...props }, ref) => {
    const { layout } = React.useContext(ChartContext)

    return (
      <YAxis
        ref={ref}
        stroke="#888888"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        className={cn("text-sm", className)}
        {...(layout === "vertical" ? { type: "category" } : { type: "number" })}
        {...props}
      />
    )
  },
)
ChartYAxis.displayName = "ChartYAxis"

const ChartBar = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof Bar>>(({ className, ...props }, ref) => {
  const { categories, index } = React.useContext(ChartContext)

  return (
    <>
      {categories.map((category) => (
        <Bar
          ref={ref}
          key={category}
          dataKey={category}
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className={cn("fill-primary", className)}
          {...props}
        />
      ))}
    </>
  )
})
ChartBar.displayName = "ChartBar"

const ChartLine = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof Line>>(({ className, ...props }, ref) => {
  const { categories, index } = React.useContext(ChartContext)

  return (
    <>
      {categories.map((category) => (
        <Line
          ref={ref}
          key={category}
          dataKey={category}
          stroke="currentColor"
          className={cn("stroke-primary", className)}
          {...props}
        />
      ))}
    </>
  )
})
ChartLine.displayName = "ChartLine"

const ChartArea = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof Area>>(({ className, ...props }, ref) => {
  const { categories, index } = React.useContext(ChartContext)

  return (
    <>
      {categories.map((category) => (
        <Area
          ref={ref}
          key={category}
          dataKey={category}
          stroke="currentColor"
          fill="currentColor"
          className={cn("stroke-primary fill-primary", className)}
          {...props}
        />
      ))}
    </>
  )
})
ChartArea.displayName = "ChartArea"

const ChartRadialBar = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof RadialBar>>(
  ({ className, ...props }, ref) => {
    const { categories, index } = React.useContext(ChartContext)

    return (
      <>
        {categories.map((category) => (
          <RadialBar
            ref={ref}
            key={category}
            dataKey={category}
            fill="currentColor"
            className={cn("fill-primary", className)}
            {...props}
          />
        ))}
      </>
    )
  },
)
ChartRadialBar.displayName = "ChartRadialBar"

const ChartPie = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof Pie>>(({ className, ...props }, ref) => {
  const { categories, index } = React.useContext(ChartContext)

  return (
    <>
      {categories.map((category) => (
        <Pie
          ref={ref}
          key={category}
          dataKey={category}
          fill="currentColor"
          className={cn("fill-primary", className)}
          {...props}
        />
      ))}
    </>
  )
})
ChartPie.displayName = "ChartPie"

const ChartScatter = React.forwardRef<SVGSVGElement, React.ComponentProps<typeof Scatter>>(
  ({ className, ...props }, ref) => {
    const { categories, index } = React.useContext(ChartContext)

    return (
      <>
        {categories.map((category) => (
          <Scatter
            ref={ref}
            key={category}
            dataKey={category}
            fill="currentColor"
            className={cn("fill-primary", className)}
            {...props}
          />
        ))}
      </>
    )
  },
)
ChartScatter.displayName = "ChartScatter"

export {
  Chart,
  ChartCrosshair,
  ChartAxis,
  ChartYAxis,
  ChartBar,
  ChartLine,
  ChartArea,
  ChartRadialBar,
  ChartPie,
  ChartScatter,
}
