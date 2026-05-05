import { QueryClient } from "@tanstack/react-query";

/**
 * Builds a fresh TanStack Query client with app-wide defaults.
 * Call from a client provider via `useState(() => createQueryClient())` so each
 * browser session gets one stable client (recommended for the App Router).
 */
export function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Data is treated as fresh for this window; override per-query for live dashboards.
				staleTime: 30_000,
				// One retry helps with flaky Wi‑Fi; set to 0 for strictly idempotent reads if you prefer.
				retry: 1,
				refetchOnWindowFocus: process.env.NODE_ENV === "production",
			},
			mutations: {
				// Mutations should not auto-retry (risk of double-submit); handle retries explicitly if needed.
				retry: 0,
			},
		},
	});
}
