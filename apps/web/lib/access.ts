type NamedLike = { name: string };

function isNamedLike(value: unknown): value is NamedLike {
	return (
		typeof value === "object" &&
		value !== null &&
		"name" in value &&
		typeof (value as { name: unknown }).name === "string"
	);
}

export function normalizeNameList(values: unknown[]): string[] {
	const names = values
		.map((value) => {
			if (typeof value === "string") {
				return value;
			}
			if (isNamedLike(value)) {
				return value.name;
			}
			return null;
		})
		.filter((value): value is string => Boolean(value));

	return Array.from(new Set(names));
}
