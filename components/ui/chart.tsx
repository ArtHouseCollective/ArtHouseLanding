"use client"

import * as React from "react"
import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Define the ChartConfig type for the chart
const chartConfig = {
  progress: {
    label: "Progress",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

// Define the props for the CircularProgress component
interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ value, size = 120, strokeWidth = 10, showLabel = true, className, ...props }, ref) => {
    const chartData = [{ browser: "progress", progress: value }]

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <ChartContainer config={chartConfig} className="h-full w-full">
          <RadialBarChart
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={90 + (value / 100) * 360}
          >
            <PolarGrid gridType="circle" radius={[size / 2 - strokeWidth, size / 2]} polarAngles={[0]}>
              <PolarRadiusAxis axisLine={false} tick={false} />
            </PolarGrid>
            <RadialBar dataKey="progress" cornerRadius={strokeWidth / 2} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            {showLabel && <Label value={`${value}%`} position="center" className="fill-foreground text-lg font-bold" />}
          </RadialBarChart>
        </ChartContainer>
      </div>
    )
  },
)
CircularProgress.displayName = "CircularProgress"

export { CircularProgress }
