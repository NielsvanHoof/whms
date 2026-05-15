"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useMemo } from "react";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { breadcrumbsFromPathname } from "@/lib/navigation/breadcrumbs";

export function AppBreadcrumbs() {
	const pathname = usePathname();
	const entries = useMemo(() => breadcrumbsFromPathname(pathname), [pathname]);

	if (entries.length === 0) {
		return null;
	}

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{entries.map((entry, index) => {
					const isLast = index === entries.length - 1;
					const key = entry.href ?? `current:${entry.label}`;

					return (
						<Fragment key={key}>
							{index > 0 ? <BreadcrumbSeparator /> : null}
							<BreadcrumbItem>
								{isLast || !entry.href ? (
									<BreadcrumbPage>{entry.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={entry.href}>{entry.label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
						</Fragment>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
