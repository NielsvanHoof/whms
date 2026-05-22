"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const themeOptions = [
	{ value: "light" as const, label: "Light", Icon: SunIcon },
	{ value: "dark" as const, label: "Dark", Icon: MoonIcon },
	{ value: "system" as const, label: "System", Icon: MonitorIcon },
];

type ModeToggleProps = {
	className?: string;
	/** Compact icon dropdown (header) vs labeled segmented control (settings). */
	layout?: "icon" | "group";
};

function isActiveTheme(current: string | undefined, option: string) {
	if (option === "system") {
		return current === "system" || current === undefined;
	}
	return current === option;
}

export function ModeToggle({ className, layout = "icon" }: ModeToggleProps) {
	const { setTheme, theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		if (layout === "group") {
			return (
				<div
					aria-hidden
					className={cn(
						"grid h-9 w-full max-w-sm grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1",
						className,
					)}
				/>
			);
		}

		return (
			<Button
				aria-label="Theme"
				className={cn("size-9 shrink-0", className)}
				disabled
				size="icon"
				type="button"
				variant="outline"
			/>
		);
	}

	if (layout === "group") {
		return (
			<fieldset
				aria-label="Color theme"
				className={cn(
					"m-0 inline-flex w-full max-w-sm gap-1 rounded-lg border border-border bg-muted/40 p-1",
					className,
				)}
			>
				{themeOptions.map(({ value, label, Icon }) => {
					const active = isActiveTheme(theme, value);
					return (
						<Button
							key={value}
							aria-pressed={active}
							className="min-w-0 flex-1"
							onClick={() => setTheme(value)}
							size="sm"
							type="button"
							variant={active ? "secondary" : "ghost"}
						>
							<Icon aria-hidden data-icon="inline-start" />
							{label}
						</Button>
					);
				})}
			</fieldset>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Toggle color theme"
					className={cn("relative size-9 shrink-0", className)}
					size="icon"
					type="button"
					variant="outline"
				>
					<SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{themeOptions.map(({ value, label, Icon }) => (
					<DropdownMenuItem key={value} onClick={() => setTheme(value)}>
						<Icon aria-hidden data-icon="inline-start" />
						{label}
						{isActiveTheme(theme, value) ? (
							<span className="ml-auto text-muted-foreground text-xs">✓</span>
						) : null}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
