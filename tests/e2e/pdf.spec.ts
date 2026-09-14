import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase('presupuestospro')
    request.onsuccess = request.onerror = request.onblocked = () => resolve()
  }))
  await page.reload()
  await page.getByRole('button', { name: 'Mi perfil', exact: true }).click()
  await page.getByLabel('Nombre completo').fill('Ana López')
  await page.getByLabel('RFC').fill('LOPA900101AA1')
  await page.getByLabel('Régimen fiscal').selectOption('RESICO')
  await page.getByRole('button', { name: 'Guardar perfil' }).click()
  await page.getByRole('button', { name: 'Presupuestos' }).click()
  await page.getByRole('button', { name: 'Crear presupuesto' }).click()
  await page.getByLabel('Nombre o razón social').fill('Cliente PDF')
})

test('bloquea vacío y cambios pendientes; descarga un PDF válido y repetible', async ({ page }) => {
  await page.getByRole('button', { name: 'Mi perfil', exact: true }).click()
  await page.getByLabel('Logo (opcional)').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64') })
  await expect(page.getByAltText('Vista previa del logo')).toBeVisible()
  await page.getByRole('button', { name: 'Guardar perfil' }).click()
  await expect(page.getByText(/Perfil guardado\./)).toBeVisible()
  await page.getByRole('button', { name: 'Presupuestos' }).click()
  await page.getByRole('button', { name: 'Crear presupuesto' }).click()
  await page.getByLabel('Nombre o razón social').fill('Agencia con logo')
  await page.getByRole('button', { name: 'Guardar presupuesto' }).click()
  await page.getByRole('button', { name: 'Descargar PDF' }).click()
  await expect(page.getByText('Agrega al menos un concepto antes de descargar el PDF.')).toBeVisible()

  await page.getByRole('button', { name: 'Agregar concepto' }).click()
  await page.getByLabel('Tipo fiscal').selectOption('INDIVIDUAL')
  const card = page.locator('.line-card').first()
  await card.getByLabel('Descripción').fill('Consultoría')
  await card.getByLabel('Cantidad').fill('1')
  await card.getByLabel('Precio unitario').fill('800')
  await page.getByRole('button', { name: 'Descargar PDF' }).click()
  await expect(page.getByText('Guarda los cambios antes de descargar el PDF.')).toBeVisible()
  await page.getByRole('button', { name: 'Guardar cambios' }).click()

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar PDF' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('2026-001.pdf')
  const bytes = await readFile(await download.path() as string)
  expect(bytes.subarray(0, 4).toString()).toBe('%PDF')

  await expect(page.getByText('PDF descargado correctamente.')).toBeVisible()
  await expect(page.getByLabel('Estado')).toHaveValue('DRAFT')
})

test('construye un documento largo sin depender de logo', async ({ page }) => {
  for (let index = 1; index <= 50; index += 1) {
    await page.getByRole('button', { name: 'Agregar concepto' }).click()
    const card = page.locator('.line-card').nth(index - 1)
    await card.getByLabel('Descripción').fill(`Servicio detallado ${index}`)
    await card.getByLabel('Cantidad').fill('1')
    await card.getByLabel('Precio unitario').fill('10')
  }
  await page.getByRole('button', { name: 'Guardar presupuesto' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar PDF' }).click()
  expect((await downloadPromise).suggestedFilename()).toMatch(/^\d{4}-001\.pdf$/)
})
