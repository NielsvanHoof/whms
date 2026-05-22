"use client";

import { parseAsString } from "nuqs";
import { useMemo } from "react";

import { useUserPreferences } from "@/hooks/use-user-preferences";
import { isValidSortForList } from "@/lib/preferences/list-sort-options";
import type { ListPreferenceKey } from "@/lib/preferences/user-preferences";

/** URL sort parser whose default comes from localStorage preferences. */
export function useListSortParser(listKey: ListPreferenceKey) {
	const { preferences } = useUserPreferences();
	const stored = preferences.listSort[listKey] ?? "__default__";
	const defaultSort = isValidSortForList(listKey, stored)
		? stored
		: "__default__";

	return useMemo(() => parseAsString.withDefault(defaultSort), [defaultSort]);
}
