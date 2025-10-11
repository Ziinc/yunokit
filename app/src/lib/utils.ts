import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely extract a human-friendly error message.
 * Falls back to provided default when message is unavailable.
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An unexpected error occurred"
): string {
  if (!error) return fallback
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message || fallback
  if (typeof error === "object") {
    const anyErr = error as any
    if (typeof anyErr.message === "string") return anyErr.message
    if (anyErr.error && typeof anyErr.error.message === "string") {
      return anyErr.error.message
    }
  }
  return fallback
}

/**
 * Generates a UUID v4 using Web Crypto when available, with a safe fallback.
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID()
  }
  // Fallback generator (non-cryptographic)
  // eslint-disable-next-line no-bitwise
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

