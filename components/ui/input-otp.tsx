"use client"

import * as React from "react"
import { OTPInput, SlotOTPInput } from "input-otp"
import { Minus } from "lucide-react"

import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props}
    />
  ),
)
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<typeof SlotOTPInput>,
  React.ComponentPropsWithoutRef<typeof SlotOTPInput>
>(({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<typeof SlotOTPInput>,
  React.ComponentPropsWithoutRef<typeof SlotOTPInput> & { index: number }
>(({ index, className, ...props }, ref) => (
  <SlotOTPInput
    ref={ref}
    index={index}
    className={cn(
      "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "data-[active=true]:bg-accent/50 data-[filled=true]:bg-accent/50",
      className,
    )}
    {...props}
  >
    {({ char, has }) => (
      <div className="relative flex h-full w-full items-center justify-center">
        {char}
        {has && <span className="absolute bottom-1 left-1/2 h-px w-2 -translate-x-1/2 bg-foreground" />}
      </div>
    )}
  </SlotOTPInput>
))
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<typeof Minus>,
  React.ComponentPropsWithoutRef<typeof Minus>
>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" className={cn("flex items-center justify-center", className)} {...props}>
    <Minus />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
