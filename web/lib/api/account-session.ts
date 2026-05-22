import type { AccountSession } from "@/lib/api/account";

/** Laravel may serialize booleans as strings in JSON resources. */
export function isCurrentAccountSession(
	value: AccountSession["is_current"],
): boolean {
	if (typeof value === "boolean") {
		return value;
	}
	const normalized = String(value).toLowerCase();
	return normalized === "1" || normalized === "true" || normalized === "yes";
}
