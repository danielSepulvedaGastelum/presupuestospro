import { readFile } from 'node:fs/promises'
import { unzipSync } from 'fflate'
import { expect, test } from '@playwright/test'

async function createProfileAndQuote(page: import('@playwright/test').Page): Promise<void> {
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
  await page.getByRole('button', { name: 'Presupuestos', exact: true }).click()
  await page.getByRole('button', { name: 'Crear presupuesto' }).click()
  await page.getByLabel('Nombre o razón social').fill('Cliente / Norte')
  await page.getByRole('button', { name: 'Agregar concepto' }).click()
  const line = page.locator('.line-card').first()
  await line.getByLabel('Descripción').fill('Consultoría')
  await line.getByLabel('Cantidad').fill('1')
  await line.getByLabel('Precio unitario').fill('2320')
  await page.getByRole('button', { name: 'Guardar presupuesto' }).click()
}

test('avisa cuando no hay presupuestos y no inicia descarga', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Presupuestos', exact: true }).click()
  await page.getByRole('button', { name: 'Exportar todo (.zip)', exact: true }).click()
  await expect(page.getByText('No hay presupuestos guardados para exportar.')).toBeVisible()
})

test('descarga una única copia ZIP con PDF y JSON', async ({ page }) => {
  await createProfileAndQuote(page)
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar todo (.zip)', exact: true }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toMatch(/^presupuestospro-copia-\d{4}-\d{2}-\d{2}\.zip$/)
  const files = unzipSync(new Uint8Array(await readFile(await download.path() as string)))
  expect(Object.keys(files)).toEqual(['presupuestospro-datos.json', '2026-001 - Cliente-Norte.pdf'])
  expect(JSON.parse(new TextDecoder().decode(files['presupuestospro-datos.json']))).toMatchObject({ format: 'presupuestospro-backup', formatVersion: 1 })
  await expect(page.getByText('Copia descargada con 1 PDF.')).toBeVisible()
})

test('bloquea la segunda pulsación y conserva la copia ante un PDF inválido', async ({ page }) => {
  await createProfileAndQuote(page)
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('presupuestospro')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const database = request.result
        const transaction = database.transaction('quotes', 'readwrite')
        const store = transaction.objectStore('quotes')
        const get = store.getAll()
        get.onsuccess = () => { const quote = get.result[0]; quote.lines = []; store.put(quote) }
        transaction.oncomplete = () => { database.close(); resolve() }
        transaction.onerror = () => reject(transaction.error)
      }
    })
  })
  const exportButton = page.getByRole('button', { name: 'Exportar todo (.zip)', exact: true })
  const downloadPromise = page.waitForEvent('download')
  await exportButton.click()
  await expect(exportButton).toBeDisabled()
  const download = await downloadPromise
  const files = unzipSync(new Uint8Array(await readFile(await download.path() as string)))
  expect(Object.keys(files)).toContain('errores-exportacion.txt')
  expect(new TextDecoder().decode(files['errores-exportacion.txt'])).toContain('2026-001')
  await expect(page.getByRole('alert')).toContainText('No se incluyeron: 2026-001')
})
