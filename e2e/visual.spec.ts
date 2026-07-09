import { expect, test } from '@playwright/test';

/**
 * Visual smoke per mode × light/dark (the handoff's CI requirement): each
 * combination renders the editor with the sample image and is screenshot-
 * compared against the checked-in baseline.
 */

const MODES = ['viewer', 'basic', 'advanced', 'full'] as const;
const THEMES = ['light', 'dark'] as const;

for (const mode of MODES) {
  for (const theme of THEMES) {
    test(`${mode} × ${theme}`, async ({ page }) => {
      await page.goto(`/e2e?mode=${mode}&theme=${theme}`);
      await expect(page.getByTestId('stat-loaded')).not.toHaveText('0');
      const editor = page.locator('.asp-image-editor');
      await expect(editor).toBeVisible();
      // Let fonts/canvas settle before the shot.
      await page.waitForTimeout(500);
      await expect(editor).toHaveScreenshot(`${mode}-${theme}.png`);
    });
  }
}

test('docs shell renders the playground', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hdr')).toBeVisible();
  await expect(page.locator('.sidebar')).toContainText('Playground');
  await expect(page.locator('.asp-image-editor').first()).toBeVisible();
});
