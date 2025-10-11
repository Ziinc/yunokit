import { useCallback, useState } from "react";

/**
 * useNullableState
 * Standardizes `T | null` state management with a clear() helper.
 * Returns a tuple: [value, setValue, clear]
 */
export function useNullableState<T>(initial: T | null = null) {
  const [value, setValue] = useState<T | null>(initial);
  const clear = useCallback(() => setValue(null), []);
  return [value, setValue, clear] as const;
}

