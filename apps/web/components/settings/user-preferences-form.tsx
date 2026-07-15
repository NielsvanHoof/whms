"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import {
	LIST_PER_PAGE_OPTIONS,
	normalizeListPerPage,
} from "@/lib/api/list-query-params";
import {
	LIST_PREFERENCE_LABELS,
	LIST_SORT_OPTIONS,
} from "@/lib/preferences/list-sort-options";
import type { ListPreferenceKey } from "@/lib/preferences/user-preferences";
import { toastSuccess } from "@/lib/toast";

const listPreferenceKeys = Object.keys(
	LIST_PREFERENCE_LABELS,
) as ListPreferenceKey[];

export function UserPreferencesForm() {
	const { preferences, resetPreferences, setListPerPage, setListSort } =
		useUserPreferences();

	return (
		<Card className="max-w-2xl">
			<CardHeader>
				<CardTitle>Preferences</CardTitle>
				<CardDescription>
					Defaults for this browser only. They apply when list pages open
					without sort or page-size query parameters.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<Label htmlFor="pref-list-per-page">Table page size</Label>
					<Select
						onValueChange={(value) => {
							const perPage = normalizeListPerPage(Number(value));
							setListPerPage(perPage);
							toastSuccess("Default page size saved");
						}}
						value={String(preferences.listPerPage)}
					>
						<SelectTrigger className="w-full max-w-xs" id="pref-list-per-page">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{LIST_PER_PAGE_OPTIONS.map((option) => (
								<SelectItem key={option} value={String(option)}>
									{option} rows
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-4">
					<p className="font-medium text-sm">Default list sort</p>
					{listPreferenceKeys.map((listKey) => (
						<div key={listKey} className="flex flex-col gap-2">
							<Label htmlFor={`pref-sort-${listKey}`}>
								{LIST_PREFERENCE_LABELS[listKey]}
							</Label>
							<Select
								onValueChange={(value) => {
									setListSort(listKey, value);
									toastSuccess("Default sort saved");
								}}
								value={preferences.listSort[listKey] ?? "__default__"}
							>
								<SelectTrigger className="w-full" id={`pref-sort-${listKey}`}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{LIST_SORT_OPTIONS[listKey].map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					))}
				</div>

				<Button
					className="w-fit"
					onClick={() => {
						resetPreferences();
						toastSuccess("Preferences reset to defaults");
					}}
					type="button"
					variant="outline"
				>
					Reset preferences
				</Button>
			</CardContent>
		</Card>
	);
}
