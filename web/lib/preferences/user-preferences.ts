import {
	DEFAULT_LIST_PER_PAGE,
	type ListPerPage,
	normalizeListPerPage,
} from "@/lib/api/list-query-params";

/** Keys for per-list default sort stored in localStorage. */
export type ListPreferenceKey =
	| "products"
	| "warehouses"
	| "locations"
	| "inventory_balances"
	| "inventory_movements";

export type UserPreferences = {
	listPerPage: ListPerPage;
	listSort: Partial<Record<ListPreferenceKey, string>>;
};

export const USER_PREFERENCES_CHANGED_EVENT =
	"warehouse-user-preferences-changed";

const STORAGE_KEY = "warehouse_user_preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
	listPerPage: DEFAULT_LIST_PER_PAGE,
	listSort: {},
};

function isListPreferenceKey(value: string): value is ListPreferenceKey {
	return (
		value === "products" ||
		value === "warehouses" ||
		value === "locations" ||
		value === "inventory_balances" ||
		value === "inventory_movements"
	);
}

function parseStoredPreferences(raw: unknown): UserPreferences {
	if (!raw || typeof raw !== "object") {
		return { ...DEFAULT_PREFERENCES };
	}

	const o = raw as Record<string, unknown>;
	const listPerPage = normalizeListPerPage(
		typeof o.listPerPage === "number" ? o.listPerPage : DEFAULT_LIST_PER_PAGE,
	);

	const listSort: Partial<Record<ListPreferenceKey, string>> = {};
	if (o.listSort && typeof o.listSort === "object") {
		for (const [key, value] of Object.entries(
			o.listSort as Record<string, unknown>,
		)) {
			if (isListPreferenceKey(key) && typeof value === "string") {
				listSort[key] = value;
			}
		}
	}

	return { listPerPage, listSort };
}

/** Read preferences from localStorage (browser only). */
export function readUserPreferences(): UserPreferences {
	if (typeof window === "undefined") {
		return { ...DEFAULT_PREFERENCES };
	}

	try {
		const encoded = window.localStorage.getItem(STORAGE_KEY);
		if (!encoded) {
			return { ...DEFAULT_PREFERENCES };
		}
		return parseStoredPreferences(JSON.parse(encoded));
	} catch {
		return { ...DEFAULT_PREFERENCES };
	}
}

/** Persist preferences and notify listeners in the same tab. */
export function writeUserPreferences(preferences: UserPreferences): void {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
	window.dispatchEvent(new Event(USER_PREFERENCES_CHANGED_EVENT));
}

export function resetUserPreferences(): UserPreferences {
	writeUserPreferences({ ...DEFAULT_PREFERENCES });
	return { ...DEFAULT_PREFERENCES };
}
