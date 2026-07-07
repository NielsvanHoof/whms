import { expect, test } from "@playwright/test";

import { loginAsDemoUser } from "./helpers/auth";

test.describe("inventory movement smoke", () => {
	test("login, record receipt movement", async ({ page }) => {
		const warehouseName = `E2E WH ${Date.now()}`;
		const warehouseCode = `E2E-WH-${Date.now()}`;
		const locationCode = `E2E-LOC-${Date.now()}`;
		const sku = `E2E-INV-${Date.now()}`;
		const productName = `E2E Inv Product ${Date.now()}`;

		await loginAsDemoUser(page);

		// Warehouse required for a location.
		await page.goto("/warehouses/create");
		await page.getByLabel("Name").fill(warehouseName);
		await page.getByLabel("Code").fill(warehouseCode);
		await page.getByRole("button", { name: "Create warehouse" }).click();
		await expect(page).toHaveURL(/\/warehouses$/, { timeout: 15_000 });

		await page.goto("/locations/create");
		await page.locator("#location-warehouse").click();
		await page.getByRole("option", { name: warehouseName }).click();
		await page.getByLabel("Code").fill(locationCode);
		await page.getByLabel("Type").fill("rack");
		await page.getByRole("button", { name: "Create location" }).click();
		await expect(page).toHaveURL(/\/locations$/, { timeout: 15_000 });

		await page.goto("/products/create");
		await page.getByLabel("SKU").fill(sku);
		await page.getByLabel("Name").fill(productName);
		await page.getByRole("button", { name: "Create product" }).click();
		await expect(page).toHaveURL(/\/products$/, { timeout: 15_000 });

		await page.goto("/inventory/movements");
		await expect(
			page.getByRole("heading", { name: "Movements", exact: true }),
		).toBeVisible();

		await page.locator("#location").click();
		await page.getByRole("option", { name: new RegExp(locationCode) }).click();

		await page.locator("#product").click();
		await page
			.getByRole("option", { name: new RegExp(`${sku} — ${productName}`) })
			.click();

		await page.getByLabel("Quantity").fill("10");
		await page.getByRole("button", { name: "Submit movement" }).click();

		await expect(page.getByText("Movement recorded")).toBeVisible({
			timeout: 15_000,
		});
	});
});
