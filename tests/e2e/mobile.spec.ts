import { expect, test } from '@playwright/test'

for (const width of [320, 360]) {
  test(`flujo accesible sin desbordamiento horizontal a ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 760 })
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
    const buttons = page.getByRole('button')
    for (let index = 0; index < await buttons.count(); index += 1) {
      const box = await buttons.nth(index).boundingBox()
      if (box) expect(box.height).toBeGreaterThanOrEqual(44)
    }
    await page.getByRole('button', { name: 'Mi perfil', exact: true }).focus()
    await expect(page.getByRole('button', { name: 'Mi perfil', exact: true })).toBeFocused()
    await page.getByRole('button', { name: 'Mi perfil', exact: true }).press('Enter')
    await page.getByRole('button', { name: 'Guardar perfil' }).click()
    await expect(page.getByLabel('Nombre completo')).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
}

test('con zoom de 200 % mantiene contenido y acciones', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
  await page.getByRole('button', { name: 'Presupuestos', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Crear presupuesto' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})
