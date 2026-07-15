"use client";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import type * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/** Global toast host (shadcn uses Sonner). */
function Toaster({ ...props }: ToasterProps) {
	const { resolvedTheme } = useTheme();

	return (
		<Sonner
			className="toaster group"
			closeButton
			icons={{
				success: <CircleCheckIcon aria-hidden className="size-4" />,
				info: <InfoIcon aria-hidden className="size-4" />,
				warning: <TriangleAlertIcon aria-hidden className="size-4" />,
				error: <OctagonXIcon aria-hidden className="size-4" />,
				loading: <Loader2Icon aria-hidden className="size-4 animate-spin" />,
			}}
			position="top-right"
			richColors
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			theme={resolvedTheme === "dark" ? "dark" : "light"}
			toastOptions={{
				classNames: {
					toast: "cn-toast",
				},
			}}
			{...props}
		/>
	);
}

export { Toaster };
