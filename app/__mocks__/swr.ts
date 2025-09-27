import { vi } from 'vitest';

type SWRReturn<T = any> = {
  data?: T;
  error?: any;
  isLoading?: boolean;
  mutate: (...args: any[]) => Promise<any> | any;
};

// Minimal mock that safely supports destructuring and avoids calling the fetcher
const useSWR = <T = any>(..._args: any[]): SWRReturn<T> => {
  return {
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  } as SWRReturn<T>;
};

export default useSWR;
