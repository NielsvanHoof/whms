import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "Warehouse Management System",
	description: "Warehouse Management System",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className="h-full font-sans antialiased"
		>
			<body className="flex min-h-full flex-col">
				<QueryProvider>
					<AuthProvider>
						<ThemeProvider>
							<NuqsAdapter>
								<ReactQueryDevtools initialIsOpen={false} />
								{children}
								<Toaster />
							</NuqsAdapter>
						</ThemeProvider>
					</AuthProvider>
				</QueryProvider>
			</body>
		</html>
	);
}
