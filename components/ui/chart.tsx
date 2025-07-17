"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ChartContext = React.createContext<string | undefined>(undefined)

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    VariantProps<typeof chartVariants> & {
      id: string
    }
>(({ id, className, children, variant, color, ...props }, ref) => (
  <ChartContext.Provider value={id}>
    <div ref={ref} id={id} className={cn(chartVariants({ variant, color }), className)} {...props}>
      {children}
    </div>
  </ChartContext.Provider>
))
ChartContainer.displayName = "ChartContainer"

const chartVariants = cva("flex h-[400px] w-full flex-col items-center justify-center overflow-hidden", {
  variants: {
    variant: {
      default: "bg-card text-foreground",
      ghost: "",
    },
    color: {
      default: "fill-primary",
      gray: "fill-gray-400",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
  },
})

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    hideWhenStopped?: boolean
  }
>(({ className, hideWhenStopped = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      className,
      "absolute hidden rounded-lg border border-slate-200 bg-white p-2 text-slate-950 shadow-md data-[active=true]:flex dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50",
      hideWhenStopped && "data-[stopped=true]:hidden",
    )}
    {...props}
  />
))
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center px-1 py-0.5 text-xs", className)} {...props} />
  ),
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartTooltipArrow = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>(
  ({ className, ...props }, ref) => (
    <svg
      ref={ref}
      width="8"
      height="6"
      viewBox="0 0 8 6"
      className={cn("absolute z-10 -translate-x-1/2 translate-y-1.5 fill-slate-950 dark:fill-slate-50", className)}
      {...props}
    >
      <path d="M0 6H8L4 0L0 6Z" />
    </svg>
  ),
)
ChartTooltipArrow.displayName = "ChartTooltipArrow"

const ChartLegend = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props} />
))
ChartLegend.displayName = "ChartLegend"

const ChartLegendContent = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center gap-1", className)} {...props} />,
)
ChartLegendContent.displayName = "ChartLegendContent"

const ChartLegendLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center gap-1", className)} {...props} />,
)
ChartLegendLabel.displayName = "ChartLegendLabel"

const ChartPrimitive = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<"svg"> & {
    asChild?: boolean
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "svg"
  const id = React.useContext(ChartContext)

  return <Comp ref={ref} className={cn(id && `[&_[data-chart]=${id}]:!block`, "h-full w-full", className)} {...props} />
})
ChartPrimitive.displayName = "ChartPrimitive"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartTooltipArrow,
  ChartLegend,
  ChartLegendContent,
  ChartLegendLabel,
  ChartPrimitive,
}
