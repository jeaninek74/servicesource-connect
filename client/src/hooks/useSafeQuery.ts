/**
 * useSafeQuery — null-safe tRPC query wrapper
 *
 * Prevents the "data is undefined" crash by returning a guaranteed fallback
 * value when the query hasn't loaded yet or returns null.
 *
 * Usage:
 *   const profile = useSafeQuery(trpc.profile.get.useQuery(), null);
 *   const items   = useSafeQuery(trpc.saved.list.useQuery(), []);
 */
export function useSafeQuery<T>(
  queryResult: { data: T | null | undefined; isLoading: boolean; isError: boolean; error: unknown },
  fallback: T
): { data: T; isLoading: boolean; isError: boolean; error: unknown } {
  return {
    ...queryResult,
    data: queryResult.data ?? fallback,
  };
}
