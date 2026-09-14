import { expect, test } from '@playwright/test'

test('la raíz abre Inicio con resumen y navegación de cuatro destinos', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('button')).toHaveCount(4)
  await expect(page.getByText('Borrador')).toBeVisible()
  await page.getByRole('button', { name: 'Servicios', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Servicios' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Servicios', exact: true })).toHaveAttribute('aria-current', 'page')
})
