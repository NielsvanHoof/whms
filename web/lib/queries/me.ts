import { queryOptions } from "@tanstack/react-query";

import { getMe } from "@/lib/api/me";

export const meQueryKeys = {
	all: ["me"] as const,
};

export function meQueryOptions() {
	return queryOptions({
		queryKey: meQueryKeys.all,
		queryFn: getMe,
		staleTime: 60_000,
	});
}
