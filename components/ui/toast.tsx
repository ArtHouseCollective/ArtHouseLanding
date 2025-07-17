"use client"

import * as React from "react"
import { ToastAction as ToastActionPrimitive } from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastActionPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastActionPrimitive>
>(({ className, ...props }, ref) => (
  <ToastActionPrimitive
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className,
    )}
    {...props}
  />
))
ToastAction.displayName = ToastActionPrimitive.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastActionPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastActionPrimitive> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return <ToastActionPrimitive ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
})
Toast.displayName = ToastActionPrimitive.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastActionPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastActionPrimitive>
>(({ className, ...props }, ref) => (
  <ToastActionPrimitive ref={ref} className={cn("text-sm font-semibold [&+div]:text-xs", className)} {...props} />
))
ToastTitle.displayName = ToastActionPrimitive.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastActionPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastActionPrimitive>
>(({ className, ...props }, ref) => (
  <ToastActionPrimitive ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = ToastActionPrimitive.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToasterProps = {
  /**
   * The region where the toasts will be rendered.
   * @default "bottom-right"
   */
  region?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right"
} & React.HTMLAttributes<HTMLOListElement>

export { type ToastProps, type ToasterProps, Toast, ToastAction, ToastTitle, ToastDescription, toastVariants }
