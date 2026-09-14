import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('perfil obligatorio y cálculo fiscal reactivo', async ({ page }) => {
  await page.getByRole('button', { name: 'Mi perfil', exact: true }).click()
  await page.getByRole('button', { name: 'Guardar perfil' }).click()
  await expect(page.getByText('Escribe tu nombre completo.')).toBeVisible()
  await expect(page.getByText('Escribe tu RFC.')).toBeVisible()

  await page.getByLabel('Nombre completo').fill('Ana López')
  await page.getByLabel('RFC').fill('LOPA900101AA1')
  await page.getByLabel('Régimen fiscal').selectOption('RESICO')
  await page.getByRole('button', { name: 'Guardar perfil' }).click()
  await page.getByRole('button', { name: 'Presupuestos' }).click()
  await page.getByRole('button', { name: 'Crear presupuesto' }).click()
  await page.getByLabel('Nombre o razón social').fill('Agencia Norte')

  await page.getByRole('button', { name: 'Agregar concepto' }).click()
  const cards = page.locator('.line-card')
  await cards.nth(0).getByLabel('Descripción').fill('Diseño')
  await cards.nth(0).getByLabel('Cantidad').fill('1')
  await cards.nth(0).getByLabel('Precio unitario').fill('1500')
  await page.getByRole('button', { name: 'Agregar concepto' }).click()
  await cards.nth(1).getByLabel('Descripción').fill('Fotografía')
  await cards.nth(1).getByLabel('Cantidad').fill('1')
  await cards.nth(1).getByLabel('Precio unitario').fill('500')

  await expect(page.getByTestId('total')).toContainText('2,081.67')
  await expect(page.getByText(/persona moral retiene IVA e ISR/i)).toBeVisible()
  await page.getByLabel('Tipo fiscal').selectOption('INDIVIDUAL')
  await expect(page.getByTestId('total')).toContainText('2,320.00')
  await expect(page.getByText(/persona física no aplica retenciones/i)).toBeVisible()

  await cards.nth(0).getByLabel('Cantidad').fill('0')
  await expect(cards.nth(0).getByText(/mayor que cero/i)).toBeVisible()
})
