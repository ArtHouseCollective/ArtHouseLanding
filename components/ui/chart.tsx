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
import { useChart } from "@/hooks/useChart" // Import the useChart hook

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Helper to add CSS variables to Recharts components
function addStyle(component: React.ReactElement, chartConfig: ChartConfig) {
  return React.cloneElement(component, {
    ...component.props,
    stroke: `var(--color-${component.props.dataKey})`,
    fill: `var(--color-${component.props.dataKey})`,
  })
}

function Chart({ children, chartConfig, className, ...props }: React.ComponentProps<typeof ChartContainer>) {
  const hasChartComponents = React.useMemo(
    () =>
      React.Children.toArray(children).some(
        (child) =>
          React.isValidElement(child) &&
          (child.type === Line ||
            child.type === Bar ||
            child.type === Area ||
            child.type === RadialBar ||
            child.type === Pie),
      ),
    [children],
  )

  return (
    <ChartContainer className={className} chartConfig={chartConfig} {...props}>
      {hasChartComponents
        ? React.Children.map(children, (child) => {
            if (React.isValidElement(child) && hasChartComponents) {
              return addStyle(child, chartConfig)
            }
            return child
          })
        : children}
    </ChartContainer>
  )
}

function ChartTooltip_({ cursor = false, content, ...props }: React.ComponentProps<typeof ChartTooltip>) {
  const { chartConfig } = useChart()
  return (
    <ChartTooltip
      cursor={cursor}
      content={<ChartTooltipContent hideLabel hideIndicator chartConfig={chartConfig} />}
      {...props}
    />
  )
}

function ChartLegend_({ content, ...props }: React.ComponentProps<typeof ChartLegend>) {
  const { chartConfig } = useChart()
  return <ChartLegend content={<ChartLegendContent chartConfig={chartConfig} />} {...props} />
}

export {
  Chart,
  ChartTooltip_ as ChartTooltip,
  ChartLegend_ as ChartLegend,
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
}
