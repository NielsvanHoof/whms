import { expect, test } from "@playwright/test";

import { loginAsDemoUser } from "./helpers/auth";

test.describe("settings smoke", () => {
	test("login, change list preference, view sessions", async ({ page }) => {
		await loginAsDemoUser(page);
		await page.goto("/settings");

		await expect(
			page.getByRole("heading", { name: "Settings", exact: true }),
		).toBeVisible();

		await page.getByLabel("Table page size").click();
		await page.getByRole("option", { name: "25 rows" }).click();
		await expect(page.getByText("Default page size saved")).toBeVisible();

		await expect(page.getByRole("heading", { name: "Sessions" })).toBeVisible();
		await expect(page.getByText("This device")).toBeVisible();
	});
});
