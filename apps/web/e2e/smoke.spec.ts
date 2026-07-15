import { expect, test } from "@playwright/test";

import { loginAsDemoUser } from "./helpers/auth";

test.describe("warehouse CRUD smoke", () => {
	test("login, create warehouse, delete warehouse", async ({ page }) => {
		const warehouseName = `E2E Warehouse ${Date.now()}`;
		const warehouseCode = `E2E-${Date.now()}`;

		await loginAsDemoUser(page);
		await page.goto("/warehouses");

		await expect(
			page.getByRole("heading", { name: "Warehouses", exact: true }),
		).toBeVisible();

		await page.getByRole("link", { name: "Create warehouse" }).click();
		await expect(page).toHaveURL(/\/warehouses\/create/);

		await page.getByLabel("Name").fill(warehouseName);
		await page.getByLabel("Code").fill(warehouseCode);
		await page.getByRole("button", { name: "Create warehouse" }).click();

		await expect(page).toHaveURL(/\/warehouses$/, { timeout: 15_000 });
		await expect(page.getByRole("link", { name: warehouseName })).toBeVisible();

		const row = page.getByRole("row").filter({ hasText: warehouseName });
		await row.getByRole("button", { name: "Delete" }).click();
		await page.getByRole("button", { name: "Delete" }).last().click();

		await expect(page.getByRole("link", { name: warehouseName })).toHaveCount(
			0,
		);
	});
});
