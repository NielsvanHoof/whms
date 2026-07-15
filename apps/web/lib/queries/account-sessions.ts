import { queryOptions } from "@tanstack/react-query";

import { listAccountSessions } from "@/lib/api/account";

export const accountSessionsQueryKeys = {
	all: ["account", "sessions"] as const,
};

export function accountSessionsQueryOptions() {
	return queryOptions({
		queryKey: accountSessionsQueryKeys.all,
		queryFn: listAccountSessions,
	});
}
