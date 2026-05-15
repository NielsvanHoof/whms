import type { Metadata } from "next";

import { LoginForm } from "@/components/login-form";
import { ModeToggle } from "@/components/theme/mode-toggle";

export const metadata: Metadata = {
	title: "Sign in · Warehouse",
	description: "Sign in to the warehouse web app.",
};

/**
 * Login screen: full-viewport layout with a subtle industrial grid backdrop
 * and a centered sign-in card.
 */
export default function LoginPage() {
	return (
		<div className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-4 py-16">
			<div className="absolute top-4 right-4 z-10">
				<ModeToggle />
			</div>
			{/* Layered backdrop: soft gradient + fine grid (warehouse / floor-tile feel). */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 bg-linear-to-br from-muted/60 via-background to-background"
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 opacity-[0.12] [background-image:radial-gradient(var(--foreground)_0.55px,transparent_0.6px)] [background-size:26px_26px] dark:opacity-[0.18]"
			/>
			<LoginForm />
		</div>
	);
}
