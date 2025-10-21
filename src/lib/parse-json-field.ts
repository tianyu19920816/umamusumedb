/**
 * Safely parse JSON fields that may be stored as strings or already-deserialized objects.
 * Falls back to a provided value (if any) when parsing fails.
 */
export function parseJsonField<T>(
  input: unknown,
  options: { fallback?: T; context?: string } = {}
): T | undefined {
  const { fallback, context } = options;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return fallback;
    }

    try {
      return JSON.parse(trimmed) as T;
    } catch (error) {
      console.warn(`[parseJsonField] Failed to parse ${context ?? 'value'}`, error);
      return fallback;
    }
  }

  if (input === null || typeof input === 'undefined') {
    return fallback;
  }

  return input as T;
}
