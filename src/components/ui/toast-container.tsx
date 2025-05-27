"use client"

import { Toaster } from "sonner"

export function ToastContainer() {
  return (
    <Toaster 
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        duration: 5000,
        className: "toast-custom-class",
      }}
    />
  )
}
