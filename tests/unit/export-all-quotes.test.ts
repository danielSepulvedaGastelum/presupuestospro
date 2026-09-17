import { describe, expect, it } from 'vitest'
import { unzipSync } from 'fflate'
import { exportAllQuotes } from '../../src/export/export-all-quotes'
import type { ExportSnapshot } from '../../src/domain/export-backup'
import type { SavedQuote } from '../../src/domain/types'

const quote = (number: string) => ({ id: number, number, client: { name: 'Cliente / Norte', taxPersonType: 'INDIVIDUAL' }, professionalSnapshot: { fullName: 'Ana', rfc: 'AAAA000000AAA', taxRegime: 'RESICO', capturedAt: '2026-09-17T18:00:00.000Z' } } as SavedQuote)
const snapshot = (quotes: SavedQuote[]): ExportSnapshot => ({ capturedAt: '2026-09-17T18:30:00.000Z', localDate: '2026-09-17', profile: null, services: [], quotes, annualSequences: [] })

describe('exportAllQuotes', () => {
  it('does not download an empty snapshot', async () => {
    let downloads = 0
    await expect(exportAllQuotes({ readSnapshot: async () => snapshot([]), download: () => { downloads += 1 } })).resolves.toEqual({ kind: 'empty' })
    expect(downloads).toBe(0)
  })

  it('downloads one archive with JSON, PDFs and no report on complete success', async () => {
    let received: Blob | undefined
    const result = await exportAllQuotes({
      readSnapshot: async () => snapshot([quote('2026-001')]),
      createPdf: async () => new Blob(['%PDF-ok']),
      download: (blob, filename) => { received = blob; expect(filename).toBe('presupuestospro-copia-2026-09-17.zip') },
    })
    expect(result).toMatchObject({ kind: 'complete', pdfCount: 1 })
    const files = unzipSync(new Uint8Array(await received!.arrayBuffer()))
    expect(Object.keys(files)).toEqual(['presupuestospro-datos.json', '2026-001 - Cliente-Norte.pdf'])
  })

  it('keeps data and valid PDFs when one PDF fails', async () => {
    let received: Blob | undefined
    const result = await exportAllQuotes({
      readSnapshot: async () => snapshot([quote('2026-001'), quote('2026-002')]),
      createPdf: async (value) => { if (value.number === '2026-002') throw new Error('bad'); return new Blob(['%PDF-ok']) },
      download: (blob) => { received = blob },
    })
    expect(result).toMatchObject({ kind: 'partial', pdfCount: 1 })
    const files = unzipSync(new Uint8Array(await received!.arrayBuffer()))
    expect(Object.keys(files)).toContain('errores-exportacion.txt')
    expect(new TextDecoder().decode(files['errores-exportacion.txt'])).toContain('2026-002')
  })
})
