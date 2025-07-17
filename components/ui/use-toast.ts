"use client"

import * as React from "react"

import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastsMap = Map<
  string,
  {
    toast: ToastProps
    timeout: ReturnType<typeof setTimeout> | undefined
  }
>

type ActionType =
  | {
      type: "ADD_TOAST"
      toast: ToastProps
    }
  | {
      type: "UPDATE_TOAST"
      toast: ToastProps
    }
  | {
      type: "DISMISS_TOAST"
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: string
    }

interface State {
  toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case "DISMISS_TOAST":
      const { toasts } = state
      const [toastToDismiss] = toasts.splice(toasts.length - 1, 1)

      if (toastToDismiss) {
        clearTimeout(toastTimeouts.get(toastToDismiss.id!))
        addToRemoveQueue(toastToDismiss.id!)
      }

      return {
        ...state,
        toasts: [...toasts],
      }

    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: ((state: State) => void)[] = []

let memoryState: State = { toasts: [] }

function dispatch(action: ActionType) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = Pick<ToastProps, "id" | "title" | "description" | "type"> & {
  action?: ToastActionElement
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  const addToast = React.useCallback((toast: Toast) => {
    const id = toast.id || Math.random().toString(36).substring(2, 9)

    dispatch({
      type: "ADD_TOAST",
      toast: {
        ...toast,
        id,
        onOpenChange: (open) => {
          if (!open) {
            dispatch({ type: "DISMISS_TOAST" })
          }
        },
      },
    })
  }, [])

  const updateToast = React.useCallback((toast: Toast) => {
    dispatch({
      type: "UPDATE_TOAST",
      toast,
    })
  }, [])

  const dismissToast = React.useCallback(() => {
    dispatch({ type: "DISMISS_TOAST" })
  }, [])

  return {
    ...state,
    toast: addToast,
    updateToast,
    dismissToast,
  }
}

export { useToast }
