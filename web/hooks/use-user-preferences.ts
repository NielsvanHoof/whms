"use client";

import { useCallback, useEffect, useState } from "react";

import type { ListPerPage } from "@/lib/api/list-query-params";
import type {
	ListPreferenceKey,
	UserPreferences,
} from "@/lib/preferences/user-preferences";
import {
	readUserPreferences,
	resetUserPreferences,
	USER_PREFERENCES_CHANGED_EVENT,
	writeUserPreferences,
} from "@/lib/preferences/user-preferences";

export function useUserPreferences() {
	const [preferences, setPreferences] = useState<UserPreferences>(() =>
		readUserPreferences(),
	);

	useEffect(() => {
		const sync = () => {
			setPreferences(readUserPreferences());
		};
		sync();
		window.addEventListener(USER_PREFERENCES_CHANGED_EVENT, sync);
		return () => {
			window.removeEventListener(USER_PREFERENCES_CHANGED_EVENT, sync);
		};
	}, []);

	const setListPerPage = useCallback((listPerPage: ListPerPage) => {
		const next = { ...readUserPreferences(), listPerPage };
		writeUserPreferences(next);
		setPreferences(next);
	}, []);

	const setListSort = useCallback(
		(listKey: ListPreferenceKey, sort: string) => {
			const current = readUserPreferences();
			const next: UserPreferences = {
				...current,
				listSort: { ...current.listSort, [listKey]: sort },
			};
			writeUserPreferences(next);
			setPreferences(next);
		},
		[],
	);

	const reset = useCallback(() => {
		setPreferences(resetUserPreferences());
	}, []);

	return {
		preferences,
		resetPreferences: reset,
		setListPerPage,
		setListSort,
	};
}
