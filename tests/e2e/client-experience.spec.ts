import { expect, test } from '@playwright/test'

test('a visitor can build and compare a mortgage plan on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /feel good about/i })).toBeVisible()
  await page.getByLabel('Household income').fill('125000')
  await page.getByLabel('Home price').fill('750000')
  await page.getByLabel('Down payment').fill('150000')
  await page.getByRole('button', { name: /see my buying power/i }).click()

  await expect(page.getByText('Estimated monthly payment')).toBeVisible()
  await page.getByRole('button', { name: 'Compare' }).click()
  await expect(page.getByRole('heading', { name: 'Two ways forward' })).toBeVisible()
  await expect(page.getByText('More predictable')).toBeVisible()
})
