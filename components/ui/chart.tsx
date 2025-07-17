"use client"

import * as React from "react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Label, Pie, PieChart } from "recharts"

const desktopData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function Component() {
  const totalVisitors = React.useMemo(() => desktopData.reduce((acc, curr) => acc + curr.desktop, 0), [])

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={desktopData}
          dataKey="desktop"
          nameKey="month"
          innerRadius={60}
          strokeWidth={5}
          activeIndex={0}
          activeShape={({
            outerRadius = 0,
            fill = "",
            ...props
          }: {
            outerRadius: number
            fill: string
          }) => (
            <g>
              <circle cx={0} cy={0} r={outerRadius + 10} fill={fill} stroke="none" />
              <path d="M 0 0 L 0 0 L 0 0 A 0 0 0 0 1 0 0 Z" fill={fill} stroke="none" {...props} />
            </g>
          )}
        >
          <Label
            content={() => (
              <div className="flex flex-col items-center justify-center">
                <span className="text-5xl font-bold tracking-tighter">{totalVisitors}</span>
                <span className="text-sm text-muted-foreground">Visitors</span>
              </div>
            )}
            position="center"
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
