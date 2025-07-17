"use client"

import * as React from "react"
import { OTPInput, type SlotProps } from "input-otp"
import { MinusIcon } from "@radix-ui/react-icons"

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

const InputOTPGroup = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center", className)} {...props} />,
)
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<React.ElementRef<"div">, SlotProps & React.ComponentPropsWithoutRef<"div">>(
  ({ char, has = { adjacent: false }, isActive, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center border border-input text-sm shadow-sm transition-all",
          isActive && "z-10 ring-1 ring-ring",
          has.adjacent && "border-r-0",
          className,
        )}
        {...props}
      >
        {char}
      </div>
    )
  },
)
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-2 flex items-center justify-center", className)} {...props}>
      <MinusIcon />
    </div>
  ),
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
