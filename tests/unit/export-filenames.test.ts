import { describe, expect, it } from 'vitest'
import { exportArchiveFilename, quotePdfFilename, safeClientFilename } from '../../src/domain/export-filenames'

describe('export filenames', () => {
  it('creates deterministic safe client names without discarding accents', () => {
    expect(safeClientFilename('  Norte/Sur: Diseño  ')).toBe('Norte-Sur-Diseño')
    expect(safeClientFilename('...')).toBe('Cliente')
    expect(safeClientFilename('CON')).toBe('Cliente')
  })

  it('uses quote number and local civil date in archive entries', () => {
    expect(quotePdfFilename({ number: '2026-003', client: { name: 'Ana / Co.' } } as never)).toBe('2026-003 - Ana-Co.pdf')
    expect(exportArchiveFilename('2026-09-17')).toBe('presupuestospro-copia-2026-09-17.zip')
  })
})
