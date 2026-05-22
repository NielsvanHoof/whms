"use client";

import { useQueryStates } from "nuqs";

import { parseAsOptionalString } from "./parsers";

const recordPrefillParsers = {
	prefill_kind: parseAsOptionalString,
	prefill_location_id: parseAsOptionalString,
	prefill_product_id: parseAsOptionalString,
} as const;

/** URL-backed prefill for the record movement form on the movements page. */
export function useRecordMovementPrefill() {
	const [state, setState] = useQueryStates(recordPrefillParsers, {
		history: "replace",
	});

	const hasPrefill = Boolean(
		state.prefill_location_id?.trim() && state.prefill_product_id?.trim(),
	);

	const clearPrefill = () => {
		void setState({
			prefill_kind: null,
			prefill_location_id: null,
			prefill_product_id: null,
		});
	};

	return {
		clearPrefill,
		hasPrefill,
		kind: state.prefill_kind?.trim() || "adjustment",
		locationId: state.prefill_location_id?.trim() ?? "",
		productId: state.prefill_product_id?.trim() ?? "",
	};
}
