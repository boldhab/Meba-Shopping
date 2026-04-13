export function validateForm<T extends Record<string, unknown>>(values: T) {
  return Object.values(values).every(Boolean);
}
