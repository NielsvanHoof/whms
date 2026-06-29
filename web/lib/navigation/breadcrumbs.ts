export type BreadcrumbEntry = {
	label: string;
	href?: string;
};

const SEGMENT_LABELS: Record<string, string> = {
	dashboard: "Overview",
	warehouses: "Warehouses",
	locations: "Locations",
	products: "Products",
	inventory: "Inventory",
	balances: "Balances",
	movements: "Movements",
	admin: "Administration",
	users: "Users",
	roles: "Roles",
	permissions: "Permissions",
	settings: "Settings",
	create: "Create",
	edit: "Edit",
};

function labelForNumericSegment(
	segment: string,
	parentSegment: string | undefined,
): string {
	switch (parentSegment) {
		case "balances":
			return `Balance ${segment}`;
		case "warehouses":
			return `Warehouse ${segment}`;
		case "locations":
			return `Location ${segment}`;
		case "products":
			return `Product ${segment}`;
		default:
			return segment;
	}
}

function labelForSegment(
	segment: string,
	parentSegment: string | undefined,
): string {
	if (/^\d+$/.test(segment)) {
		return labelForNumericSegment(segment, parentSegment);
	}
	return (
		SEGMENT_LABELS[segment] ??
		segment.charAt(0).toUpperCase() + segment.slice(1).replaceAll("-", " ")
	);
}

/** Numeric IDs with dedicated show routes link to their detail page. */
function hrefForNumericSegment(
	segment: string,
	parentSegment: string | undefined,
): string | undefined {
	switch (parentSegment) {
		case "balances":
			return `/inventory/balances/${segment}`;
		case "warehouses":
			return `/warehouses/${segment}`;
		case "locations":
			return `/locations/${segment}`;
		case "products":
			return `/products/${segment}`;
		default:
			return undefined;
	}
}

/**
 * Builds breadcrumb entries from an app pathname (e.g. `/products/12/edit`).
 */
export function breadcrumbsFromPathname(pathname: string): BreadcrumbEntry[] {
	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) {
		return [{ label: "Overview", href: "/dashboard" }];
	}

	const entries: BreadcrumbEntry[] = [];
	let path = "";

	for (let index = 0; index < segments.length; index += 1) {
		const segment = segments[index];
		const parentSegment = index > 0 ? segments[index - 1] : undefined;
		path += `/${segment}`;
		const isLast = index === segments.length - 1;
		const label = labelForSegment(segment, parentSegment);

		if (isLast) {
			entries.push({ label });
			continue;
		}

		if (/^\d+$/.test(segment)) {
			const numericHref = hrefForNumericSegment(segment, parentSegment);
			if (numericHref) {
				entries.push({ label, href: numericHref });
				continue;
			}
			// Edit-only resources: link through to the edit page when "edit" follows.
			const next = segments[index + 1];
			if (next === "edit") {
				entries.push({ label, href: `${path}/edit` });
				continue;
			}
			entries.push({ label });
			continue;
		}

		entries.push({ label, href: path });
	}

	return entries;
}
