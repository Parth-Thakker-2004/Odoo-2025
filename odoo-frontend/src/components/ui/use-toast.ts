import * as React from "react"
import { toast as sonnerToast } from "sonner"

const toast = sonnerToast;

export { toast }

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  }
}
