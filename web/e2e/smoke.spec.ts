import { expect, test } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL ?? "test@example.com";
const password = process.env.E2E_USER_PASSWORD ?? "password";

test.describe("warehouse CRUD smoke", () => {
	test("login, create warehouse, delete warehouse", async ({ page }) => {
		const warehouseName = `E2E Warehouse ${Date.now()}`;
		const warehouseCode = `E2E-${Date.now()}`;

		await page.goto("/login");
		await page.waitForLoadState("networkidle");
		await page.getByLabel("Email").fill(email);
		await page.getByLabel("Password").fill(password);
		await page.getByRole("button", { name: "Sign in" }).click();

		await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
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
