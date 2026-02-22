/**
 * Safe Query Utilities
 * Guarantees that database helpers never return `undefined` (which breaks tRPC/superjson).
 * All helpers return `null` for missing rows and `[]` for empty lists.
 */

/**
 * Wraps a single-row DB query result and coerces undefined → null.
 * Use this around any `.limit(1)` query result before returning from a procedure.
 */
export function safeRow<T>(row: T | undefined): T | null {
  return row ?? null;
}

/**
 * Wraps a multi-row DB query result and coerces undefined → empty array.
 */
export function safeRows<T>(rows: T[] | undefined): T[] {
  return rows ?? [];
}

/**
 * Wraps any async DB call and coerces undefined → null.
 * Useful for wrapping entire db helper functions.
 */
export async function safeQuery<T>(fn: () => Promise<T | undefined | null>): Promise<T | null> {
  try {
    const result = await fn();
    return result ?? null;
  } catch (err) {
    console.error("[SafeQuery] Caught error in db helper:", err);
    return null;
  }
}

/**
 * Wraps any async DB call that returns an array and coerces undefined → [].
 */
export async function safeListQuery<T>(fn: () => Promise<T[] | undefined | null>): Promise<T[]> {
  try {
    const result = await fn();
    return result ?? [];
  } catch (err) {
    console.error("[SafeListQuery] Caught error in db helper:", err);
    return [];
  }
}
