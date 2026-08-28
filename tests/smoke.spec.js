import { test, expect } from '@playwright/test';

test('home exposes concerts and legal footer', async ({ page }) => {
  await page.goto('/index.html');
  await expect(page.getByRole('heading', { name: 'Musik, die bewegt.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Impressum' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Datenschutz' })).toBeVisible();
});

test('legal anchors exist', async ({ page }) => {
  await page.goto('/impressum.html#impressum');
  await expect(page.locator('#impressum')).toBeVisible();
  await page.goto('/impressum.html#datenschutz');
  await expect(page.locator('#datenschutz')).toBeVisible();
});

test('accordion opens one panel', async ({ page }) => {
  await page.goto('/index.html#orchester');
  const first = page.locator('#orchester details').first();
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
});

test('lightbox opens from gallery', async ({ page }) => {
  await page.goto('/index.html#orchester');
  await page.locator('.gallery a').first().click();
  const dialog = page.locator('dialog.lightbox');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('carousel buttons exist', async ({ page }) => {
  await page.goto('/index.html#vergangene');
  await expect(page.getByLabel('Weitere Konzerte')).toBeVisible();
  await page.getByLabel('Weitere Konzerte').click();
});
