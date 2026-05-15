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

type ModeToggleProps = {
	className?: string;
};

export function ModeToggle({ className }: ModeToggleProps) {
	const { setTheme, theme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button
				aria-label="Theme"
				className={cn("size-9", className)}
				disabled
				size="icon"
				type="button"
				variant="outline"
			/>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label="Toggle color theme"
					className={cn("relative size-9", className)}
					size="icon"
					type="button"
					variant="outline"
				>
					<SunIcon className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<MoonIcon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					<SunIcon aria-hidden data-icon="inline-start" />
					Light
					{theme === "light" ? (
						<span className="ml-auto text-muted-foreground text-xs">✓</span>
					) : null}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					<MoonIcon aria-hidden data-icon="inline-start" />
					Dark
					{theme === "dark" ? (
						<span className="ml-auto text-muted-foreground text-xs">✓</span>
					) : null}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					<MonitorIcon aria-hidden data-icon="inline-start" />
					System
					{theme === "system" || theme === undefined ? (
						<span className="ml-auto text-muted-foreground text-xs">✓</span>
					) : null}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
