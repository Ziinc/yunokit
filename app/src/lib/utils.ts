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
    const errorObj = error as Record<string, unknown>
    if (typeof errorObj.message === "string") return errorObj.message
    if (errorObj.error && typeof errorObj.error === "object" && errorObj.error !== null) {
      const nestedError = errorObj.error as Record<string, unknown>
      if (typeof nestedError.message === "string") {
        return nestedError.message
      }
    }
  }
  return fallback
}

/**
 * Generates a UUID v4 using Web Crypto when available, with a safe fallback.
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  // Fallback generator (non-cryptographic)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

