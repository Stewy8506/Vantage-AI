import { test, expect } from "@playwright/test";

test.describe("Vantage AI Smoke Tests", () => {
  test("should load the landing page successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Vantage AI/);
    const launchCta = page.getByRole("link", { name: "LAUNCH STUDIO", exact: true });
    await expect(launchCta).toBeVisible();
  });

  test("should navigate to workspace studio and load sidebar", async ({ page }) => {
    await page.goto("/workspace");
    const workspaceHeader = page.locator(".command-bar");
    await expect(workspaceHeader).toBeVisible();
    const sidebar = page.locator(".sidebar");
    await expect(sidebar).toBeVisible();
  });
});
