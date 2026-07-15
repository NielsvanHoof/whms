"use client";

import { useEffect, useState } from "react";

/** Local form state synced from applied URL-backed filters (Apply / back-forward). */
export function useFilterDraft<T extends Record<string, string>>(
	applied: T,
): readonly [T, React.Dispatch<React.SetStateAction<T>>] {
	const [draft, setDraft] = useState(applied);

	useEffect(() => {
		setDraft(applied);
	}, [applied]);

	return [draft, setDraft] as const;
}
