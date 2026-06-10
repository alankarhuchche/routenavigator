import { test, expect } from '@playwright/test'

test.describe('Route Navigator — main flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ── app loads ──────────────────────────────────────────────────────────────

  test('app loads and shows the disclaimer banner', async ({ page }) => {
    await expect(page.getByText(/simulated demo/i).first()).toBeVisible()
  })

  test('step 1 is visible on load', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Analyse Route/i })).toBeVisible()
  })

  test('Authorise & Track is NOT visible on step 1', async ({ page }) => {
    await expect(page.getByText(/Authorise & Track/i)).not.toBeVisible()
  })

  // ── step 1 → 2: analyse ───────────────────────────────────────────────────

  test('clicking Analyse Route moves to step 2 and shows route comparison', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    await expect(page.getByText(/Route Comparison/i)).toBeVisible({ timeout: 10000 })
  })

  test('step 2 shows Authorise & Track button', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    await expect(page.getByText(/Authorise & Track/i)).toBeVisible({ timeout: 10000 })
  })

  test('step 2 shows the map', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    await expect(page.locator('.map-panel')).toBeVisible({ timeout: 10000 })
  })

  test('step 2 shows route table with multiple rows', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    // wait for route comparison panel, then check table has candidate rows
    await expect(page.getByText(/Route Comparison/i)).toBeVisible({ timeout: 10000 })
    const rows = page.locator('.route-row:not(.route-head)')
    await expect(rows).toHaveCount(await rows.count() > 0 ? await rows.count() : 1, { timeout: 5000 })
    expect(await rows.count()).toBeGreaterThan(0)
  })

  // ── step 2 → 3: authorise ─────────────────────────────────────────────────

  test('authorise moves to step 3 and shows payment tracker', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    await page.getByText(/Authorise & Track/i).click({ timeout: 10000 })
    await expect(page.getByText(/Payment state/i)).toBeVisible({ timeout: 10000 })
  })

  test('Authorise & Track button disappears after reaching step 3 (bug fix)', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    await expect(page.getByText(/Authorise & Track/i)).toBeVisible({ timeout: 10000 })
    await page.getByText(/Authorise & Track/i).click()
    await expect(page.getByText(/Authorise & Track/i)).not.toBeVisible({ timeout: 10000 })
  })

  // ── step 3: simulate ──────────────────────────────────────────────────────

  test('Simulate Next Step button is visible on step 3', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    await page.getByText(/Authorise & Track/i).click({ timeout: 10000 })
    await expect(page.getByText(/Simulate Next Step/i)).toBeVisible({ timeout: 10000 })
  })

  test('clicking Simulate Next Step progresses the payment state', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    await page.getByText(/Authorise & Track/i).click({ timeout: 10000 })

    const stateBadge = page.locator('.payment-state-badge')
    await expect(stateBadge).toContainText('AUTHORISED', { timeout: 10000 })

    await page.getByText(/Simulate Next Step/i).click()
    await expect(stateBadge).not.toContainText('AUTHORISED', { timeout: 10000 })
  })

  // ── map reframes on new scenario (bug fix) ────────────────────────────────

  test('map panel is visible after analyse', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    const map = page.locator('.map-panel')
    await expect(map).toBeVisible({ timeout: 10000 })
    // take a screenshot as evidence (saved to test-results/ on failure)
    await page.screenshot({ path: 'e2e/screenshots/map-visible.png', fullPage: false })
  })

  // ── control room ──────────────────────────────────────────────────────────

  test('control room is visible on step 3', async ({ page }) => {
    await page.getByRole('button', { name: /Analyse Route/i }).click()
    await page.getByText(/Authorise & Track/i).click({ timeout: 10000 })
    await expect(page.locator('.control-band')).toBeVisible({ timeout: 10000 })
  })

})
