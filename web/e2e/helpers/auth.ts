import { expect, type Page } from "@playwright/test";

const email = process.env.E2E_USER_EMAIL ?? "test@example.com";
const password = process.env.E2E_USER_PASSWORD ?? "password";

/** Signs in with the seeded demo tenant owner and waits for the dashboard. */
export async function loginAsDemoUser(page: Page): Promise<void> {
	await page.goto("/login");
	await page.waitForLoadState("networkidle");
	await page.getByLabel("Email").fill(email);
	await page.getByLabel("Password").fill(password);
	await page.getByRole("button", { name: "Sign in" }).click();
	await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}
