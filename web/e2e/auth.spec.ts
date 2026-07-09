import { expect, test } from "@playwright/test";

import { loginAsDemoUser } from "./helpers/auth";

test.describe("auth session routing", () => {
	test("guest visiting dashboard is redirected to login", async ({ page }) => {
		await page.goto("/dashboard");
		await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
		await expect(page.url()).toContain("next=%2Fdashboard");
	});

	test("authenticated user visiting login is redirected to dashboard", async ({
		page,
	}) => {
		await loginAsDemoUser(page);
		await page.goto("/login");
		await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
	});

	test("sign out returns to login and blocks dashboard", async ({ page }) => {
		await loginAsDemoUser(page);
		await page.getByRole("button", { name: "Test User" }).click();
		await page.getByRole("menuitem", { name: "Sign out" }).click();
		await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

		await page.goto("/products");
		await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
	});
});
