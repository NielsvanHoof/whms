import type { PermissionKey } from "@/lib/permissions";

/** Shared metadata and wiring for CRUD list pages. */
export type ListResource<
	TQuery extends Record<string, unknown> = Record<string, unknown>,
	TListQueryOptions extends (query?: TQuery) => object = (
		query?: TQuery,
	) => object,
> = {
	title: string;
	description: string;
	createHref: string;
	createLabel: string;
	itemLabel: string;
	loadingTitle: string;
	loadingDescription?: string;
	errorTitle: string;
	errorDescription?: string;
	accessDeniedDescription: string;
	deleteSuccessMessage: string;
	deleteErrorMessage: string;
	canView: (permissions: readonly PermissionKey[] | undefined) => boolean;
	canManage: (permissions: readonly PermissionKey[] | undefined) => boolean;
	deleteFn: (id: number) => Promise<void>;
	invalidateQueryKey: readonly unknown[];
	listQueryOptions: TListQueryOptions;
};
