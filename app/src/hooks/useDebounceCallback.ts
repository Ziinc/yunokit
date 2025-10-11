import { useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash.debounce';

export const useDebounceCallback = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number = 500
): T & { cancel: () => void } => {
  const callbackRef = useRef(callback);
  const debouncedRef = useRef<ReturnType<typeof debounce>>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    debouncedRef.current = debounce((...args) => {
      callbackRef.current(...args);
    }, delay);

    return () => {
      debouncedRef.current?.cancel();
    };
  }, [delay]);

  const debouncedFunction = useCallback((...args: Parameters<T>) => {
    debouncedRef.current?.(...args);
  }, []) as T & { cancel: () => void };

  debouncedFunction.cancel = useCallback(() => {
    debouncedRef.current?.cancel();
  }, []);

  return debouncedFunction;
}; 