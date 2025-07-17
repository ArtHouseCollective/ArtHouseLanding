"use client"

import * as React from "react"

import type { ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastsMap = Map<string, ToastProps>

type Action =
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
      toastId?: ToastProps["id"]
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: ToastProps["id"]
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

export const reducer = (state: State, action: Action): State => {
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
      const { toastId } = action
      // ! Side effects !
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id!)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
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

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => listener(memoryState))
}

type Toast = Omit<ToastProps, "id">

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
    const id = crypto.randomUUID()

    const update = () => {
      dispatch({
        type: "ADD_TOAST",
        toast: {
          ...toast,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) {
              dispatch({
                type: "DISMISS_TOAST",
                toastId: id,
              })
            }
          },
        },
      })
    }

    if (memoryState.toasts.length >= TOAST_LIMIT) {
      Promise.resolve({})
        .then(() =>
          dispatch({
            type: "DISMISS_TOAST",
            toastId: memoryState.toasts[0]?.id,
          }),
        )
        .then(() => update())
    } else {
      update()
    }
  }, [])

  const removeToast = React.useCallback((toastId?: string) => {
    dispatch({ type: "REMOVE_TOAST", toastId })
  }, [])

  return {
    ...state,
    toast: React.useCallback(
      (props: Toast) => {
        addToast(props)
      },
      [addToast],
    ),
    dismiss: React.useCallback((toastId?: string) => {
      dispatch({ type: "DISMISS_TOAST", toastId })
    }, []),
  }
}

export { useToast }
