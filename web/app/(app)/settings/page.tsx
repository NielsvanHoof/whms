import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
	return (
		<div className="flex flex-col gap-6 p-6">
			<div className="flex flex-col gap-2">
				<h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
				<p className="text-muted-foreground text-sm">
					Account and workspace settings will live here.
				</p>
			</div>
			<Card className="max-w-2xl">
				<CardHeader>
					<CardTitle>Coming soon</CardTitle>
				</CardHeader>
				<CardContent className="text-muted-foreground text-sm">
					This section is intentionally lightweight for now. Use Administration
					for role and permission management.
				</CardContent>
			</Card>
		</div>
	);
}
