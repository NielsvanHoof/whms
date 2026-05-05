"use client";

import { useEffect, useState } from "react";

type UseDelayedPendingOptions = {
	/** Wait this long before showing loading UI to avoid instant flashes. */
	delayMs?: number;
	/** Keep loading visible for this minimum time once shown. */
	minVisibleMs?: number;
};

/**
 * Anti-flicker loading state helper for fast queries.
 * It delays showing pending and enforces a minimum visible duration once shown.
 */
export function useDelayedPending(
	isPending: boolean,
	options?: UseDelayedPendingOptions,
) {
	const delayMs = options?.delayMs ?? 140;
	const minVisibleMs = options?.minVisibleMs ?? 220;
	const [visible, setVisible] = useState(false);
	const [shownAt, setShownAt] = useState<number | null>(null);

	useEffect(() => {
		if (isPending) {
			const timer = window.setTimeout(() => {
				setVisible(true);
				setShownAt(Date.now());
			}, delayMs);
			return () => window.clearTimeout(timer);
		}

		if (!visible) {
			return;
		}

		const elapsed = shownAt ? Date.now() - shownAt : 0;
		const remaining = Math.max(minVisibleMs - elapsed, 0);
		const timer = window.setTimeout(() => {
			setVisible(false);
			setShownAt(null);
		}, remaining);
		return () => window.clearTimeout(timer);
	}, [delayMs, isPending, minVisibleMs, shownAt, visible]);

	return visible;
}
