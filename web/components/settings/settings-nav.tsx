"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const settingsLinks = [
	{ href: "/settings", label: "Personal" },
	{ href: "/settings/workspace", label: "Workspace" },
] as const;

export function SettingsNav() {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Settings sections"
			className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1"
		>
			{settingsLinks.map((link) => {
				const active =
					link.href === "/settings"
						? pathname === "/settings"
						: pathname.startsWith(link.href);

				return (
					<Link
						key={link.href}
						className={cn(
							"rounded-md px-3 py-1.5 font-medium text-sm transition-colors",
							active
								? "bg-background text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground",
						)}
						href={link.href}
					>
						{link.label}
					</Link>
				);
			})}
		</nav>
	);
}
