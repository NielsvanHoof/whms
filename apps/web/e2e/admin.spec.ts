import { expect, test } from "@playwright/test";

import { loginAsDemoUser } from "./helpers/auth";

test.describe("admin user create smoke", () => {
	test("login, create user, see user in list", async ({ page }) => {
		const timestamp = Date.now();
		const displayName = `E2E User ${timestamp}`;
		const email = `e2e-user-${timestamp}@example.com`;

		await loginAsDemoUser(page);
		await page.goto("/admin/users/create");

		await expect(
			page.getByRole("heading", { name: "Create user", exact: true }),
		).toBeVisible();

		await page.getByLabel("Display name").fill(displayName);
		await page.getByLabel("Email").fill(email);
		await page.getByLabel("Password", { exact: true }).fill("password");
		await page.getByLabel("Confirm password").fill("password");
		await page.getByRole("button", { name: "Create user" }).click();

		await expect(page).toHaveURL(/\/admin\/users$/, { timeout: 15_000 });
		await expect(page.getByRole("cell", { name: email })).toBeVisible();
	});
});
