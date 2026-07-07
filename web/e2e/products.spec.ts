import { expect, test } from "@playwright/test";

import { loginAsDemoUser } from "./helpers/auth";

test.describe("product CRUD smoke", () => {
	test("login, create product, delete product", async ({ page }) => {
		const sku = `E2E-SKU-${Date.now()}`;
		const productName = `E2E Product ${Date.now()}`;

		await loginAsDemoUser(page);
		await page.goto("/products");

		await expect(
			page.getByRole("heading", { name: "Products", exact: true }),
		).toBeVisible();

		await page.getByRole("link", { name: "Create product" }).click();
		await expect(page).toHaveURL(/\/products\/create/);

		await page.getByLabel("SKU").fill(sku);
		await page.getByLabel("Name").fill(productName);
		await page.getByRole("button", { name: "Create product" }).click();

		await expect(page).toHaveURL(/\/products$/, { timeout: 15_000 });
		await expect(page.getByRole("link", { name: productName })).toBeVisible();

		const row = page.getByRole("row").filter({ hasText: sku });
		await row.getByRole("button", { name: "Delete" }).click();
		await page.getByRole("button", { name: "Delete" }).last().click();

		await expect(page.getByRole("link", { name: productName })).toHaveCount(0);
	});
});
