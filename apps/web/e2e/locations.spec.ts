import { expect, test } from "@playwright/test";

import { loginAsDemoUser } from "./helpers/auth";

test.describe("location CRUD smoke", () => {
	test("login, create location, delete location", async ({ page }) => {
		const warehouseName = `E2E WH ${Date.now()}`;
		const warehouseCode = `E2E-WH-${Date.now()}`;
		const locationCode = `E2E-LOC-${Date.now()}`;

		await loginAsDemoUser(page);

		await page.goto("/warehouses/create");
		await page.getByLabel("Name").fill(warehouseName);
		await page.getByLabel("Code").fill(warehouseCode);
		await page.getByRole("button", { name: "Create warehouse" }).click();
		await expect(page).toHaveURL(/\/warehouses$/, { timeout: 15_000 });

		await page.goto("/locations");
		await expect(
			page.getByRole("heading", { name: "Locations", exact: true }),
		).toBeVisible();

		await page.getByRole("link", { name: "Create location" }).click();
		await expect(page).toHaveURL(/\/locations\/create/);

		await page.locator("#location-warehouse").click();
		await page.getByRole("option", { name: warehouseName }).click();
		await page.getByLabel("Code").fill(locationCode);
		await page.getByLabel("Type").fill("rack");
		await page.getByRole("button", { name: "Create location" }).click();

		await expect(page).toHaveURL(/\/locations$/, { timeout: 15_000 });
		await expect(page.getByRole("link", { name: locationCode })).toBeVisible();

		const row = page.getByRole("row").filter({ hasText: locationCode });
		await row.getByRole("button", { name: "Delete" }).click();
		await page.getByRole("button", { name: "Delete" }).last().click();

		await expect(page.getByRole("link", { name: locationCode })).toHaveCount(0);
	});
});
