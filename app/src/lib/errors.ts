import { getErrorMessage } from "./utils";

type ToastFn = (props: {
  title?: unknown;
  description?: unknown;
  variant?: "default" | "destructive" | string;
}) => unknown;

type ErrorOpts = {
  title: string;
  fallback?: string;
  prefix?: string;
};

/**
 * Standardized error notifier: logs to console and shows destructive toast.
 */
export function notifyError(
  toast: ToastFn,
  error: unknown,
  opts: ErrorOpts
) {
  const description = getErrorMessage(error, opts.fallback || "Unknown error");
  if (opts.prefix) {
    // Keep original error object for better debugging context
    console.error(`${opts.prefix}:`, error);
  } else {
    console.error(error);
  }
  toast({ title: opts.title, description, variant: "destructive" });
}

/**
 * Helper for `{ data, error }` shaped responses (e.g. Supabase functions).
 * Returns true if an error is found and a toast is shown.
 */
export function notifyIfResponseError<T extends { error?: unknown }>(
  toast: ToastFn,
  response: T,
  opts: ErrorOpts
): boolean {
  const err: unknown = response?.error;
  if (!err) return false;
  const description =
    typeof err === "object" && err !== null && "message" in err && typeof (err as Record<string, unknown>).message === "string"
      ? (err as Record<string, unknown>).message as string
      : getErrorMessage(err, opts.fallback || "Unknown error");
  if (opts.prefix) {
    console.error(`${opts.prefix}:`, err);
  }
  toast({ title: opts.title, description, variant: "destructive" });
  return true;
}

/**
 * Wrapper for async operations that automatically handles errors with toast notifications.
 * Returns a Promise that resolves to the result or undefined if an error occurred.
 */
export async function withErrorHandling<T>(
  toast: ToastFn,
  operation: () => Promise<T>,
  errorOpts: ErrorOpts
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    notifyError(toast, error, errorOpts);
    return undefined;
  }
}

/**
 * Creates a reusable error handler function with pre-configured toast and options.
 * Useful for components that need consistent error handling across multiple operations.
 */
export function createErrorHandler(toast: ToastFn, defaultOpts: Partial<ErrorOpts> = {}) {
  return {
    handleError: (error: unknown, opts?: Partial<ErrorOpts>) => {
      notifyError(toast, error, {
        title: "Error",
        ...defaultOpts,
        ...opts
      } as ErrorOpts);
    },

    withErrorHandling: async <T>(
      operation: () => Promise<T>,
      opts?: Partial<ErrorOpts>
    ): Promise<T | undefined> => {
      return withErrorHandling(toast, operation, {
        title: "Error",
        ...defaultOpts,
        ...opts
      } as ErrorOpts);
    }
  };
}

/**
 * Success notification helper to complement error handling.
 */
export function notifySuccess(
  toast: ToastFn,
  opts: { title: string; description?: string }
) {
  toast({
    title: opts.title,
    description: opts.description,
    variant: "default",
  });
}

