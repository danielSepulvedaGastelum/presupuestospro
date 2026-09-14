import { expect, test } from '@playwright/test'

test('interfaz y descarga usan español de México', async ({ page }) => {
  await page.goto('/')
  for (const name of ['Presupuestos', 'Servicios', 'Mi perfil']) {
    await page.getByRole('button', { name }).click()
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
    const visible = (await page.locator('body').innerText()).toLocaleLowerCase('es-MX')
    expect(visible).not.toMatch(/\bnif\b|autónomo|\birpf\b/)
  }
  await expect(page.locator('html')).toHaveAttribute('lang', 'es-MX')
  await page.getByRole('button', { name: 'Presupuestos' }).click()
  await page.getByRole('button', { name: 'Crear presupuesto' }).click()
  await expect(page.getByText('IVA (16 %)')).toBeVisible()
  await expect(page.getByText('ISR retenido')).toBeVisible()
  await expect(page.getByText(/MXN/).first()).toBeVisible()
})

