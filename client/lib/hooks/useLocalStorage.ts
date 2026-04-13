export function useLocalStorage<T>(initialValue: T) {
  return [initialValue, () => undefined] as const;
}
