"use client";

import { useCallback, useState } from "react";

/**
 * Keeps a React Query `enabled` flag false until the user opens a control
 * (e.g. filter select). Pass `seedEnabled` when URL/applied state already
 * has a value so labels can resolve without waiting for interaction.
 */
export function useDeferredQueryEnabled(seedEnabled = false) {
	const [enabled, setEnabled] = useState(seedEnabled);

	const onOpenChange = useCallback((open: boolean) => {
		if (open) {
			setEnabled(true);
		}
	}, []);

	return { enabled, onOpenChange };
}
