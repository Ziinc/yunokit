// Common type guards and collection helpers

export const isString = (val: unknown): val is string => typeof val === 'string';
export const isNumber = (val: unknown): val is number => typeof val === 'number' && !Number.isNaN(val);
export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean';
export const isObject = (val: unknown): val is Record<string, unknown> => typeof val === 'object' && val !== null;
export const isRecord = (val: unknown): val is Record<string, unknown> => isObject(val);
export const isNonEmptyString = (val: unknown): val is string => isString(val) && val.trim().length > 0;

export const hasOwn = <K extends PropertyKey>(obj: unknown, key: K): obj is Record<K, unknown> =>
  isObject(obj) && Object.prototype.hasOwnProperty.call(obj, key);

export const hasItems = <T>(arr: ReadonlyArray<T> | null | undefined): arr is T[] =>
  Array.isArray(arr) && arr.length > 0;

