import { expect, test } from "@playwright/test";

import { loginAsDemoUser } from "./helpers/auth";

test.describe("reorder points and low stock", () => {
	test("create reorder point, see it in low stock, resolve with a receipt", async ({
		page,
	}) => {
		const warehouseName = `E2E RP WH ${Date.now()}`;
		const warehouseCode = `E2E-RP-WH-${Date.now()}`;
		const locationCode = `E2E-RP-LOC-${Date.now()}`;
		const sku = `E2E-RP-${Date.now()}`;
		const productName = `E2E Reorder Product ${Date.now()}`;

		await loginAsDemoUser(page);

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
		await page.getByLabel("Unit").fill("pcs");
		await page.getByRole("button", { name: "Create product" }).click();
		await expect(page).toHaveURL(/\/products$/, { timeout: 15_000 });

		await page.goto("/inventory/reorder-points/create");
		await page.locator("#reorder-point-product").click();
		await page
			.getByRole("option", { name: new RegExp(`${sku} — ${productName}`) })
			.click();
		await page.locator("#reorder-point-location").click();
		await page.getByRole("option", { name: new RegExp(locationCode) }).click();
		await page.getByLabel("Reorder threshold").fill("15");
		await page.getByRole("button", { name: "Create reorder point" }).click();
		await expect(page).toHaveURL(/\/inventory\/reorder-points$/, {
			timeout: 15_000,
		});
		await expect(page.getByText(sku)).toBeVisible();

		// No stock yet, so on-hand (0) is at or below the threshold (15).
		await page.goto("/inventory/low-stock");
		await expect(page.getByText(sku)).toBeVisible({ timeout: 15_000 });

		await page.goto("/inventory/movements");
		await page.locator("#location").click();
		await page.getByRole("option", { name: new RegExp(locationCode) }).click();
		await page.locator("#product").click();
		await page
			.getByRole("option", { name: new RegExp(`${sku} — ${productName}`) })
			.click();
		await page.getByLabel("Quantity").fill("30");
		await page.getByRole("button", { name: "Submit movement" }).click();
		await expect(page.getByText("Movement recorded")).toBeVisible({
			timeout: 15_000,
		});

		// 30 on hand is now above the threshold of 15.
		await page.goto("/inventory/low-stock");
		await expect(page.getByText(sku)).toHaveCount(0);
	});
});
