import { createBackupDocument, createExportFailuresReport, type ExportSnapshot, type PdfExportFailure } from '../domain/export-backup'
import { exportArchiveFilename, quotePdfFilename } from '../domain/export-filenames'
import type { SavedQuote } from '../domain/types'
import { readExportSnapshot } from '../persistence/database'
import { createQuotePdfBlob } from '../pdf/create-quote-pdf'

export type ExportProgress =
  | { stage: 'reading' }
  | { stage: 'generating-pdfs'; current: number; total: number }
  | { stage: 'building-zip' }
  | { stage: 'downloading' }

export type ExportResult =
  | { kind: 'empty' }
  | { kind: 'complete'; quoteCount: number; pdfCount: number }
  | { kind: 'partial'; quoteCount: number; pdfCount: number; failures: PdfExportFailure[] }

export interface ExportDependencies {
  readSnapshot?: () => Promise<ExportSnapshot>
  createPdf?: (quote: SavedQuote) => Promise<Blob>
  download?: (blob: Blob, filename: string) => void
}

export interface ExportAllQuotesOptions extends ExportDependencies {
  onProgress?: (progress: ExportProgress) => void
}

function failureFor(quote: SavedQuote, error: unknown): PdfExportFailure {
  const message = error instanceof Error && (error.message.startsWith('Agrega') || error.message.startsWith('Falta'))
    ? 'Faltan datos guardados necesarios para generar el PDF.'
    : 'No fue posible generar el PDF.'
  return { quoteId: quote.id, quoteNumber: quote.number, message }
}

async function blobBytes(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer())
}

async function makeZip(entries: Record<string, Uint8Array | [Uint8Array, { level: 0 }]>): Promise<Uint8Array> {
  const { zip } = await import('fflate')
  return await new Promise<Uint8Array>((resolve, reject) => {
    zip(entries, (error, data) => error ? reject(error) : resolve(data))
  })
}

function downloadArchive(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Builds one local ZIP from a single IndexedDB snapshot and triggers exactly one download. */
export async function exportAllQuotes(options: ExportAllQuotesOptions = {}): Promise<ExportResult> {
  const readSnapshot = options.readSnapshot ?? (() => readExportSnapshot())
  const createPdf = options.createPdf ?? createQuotePdfBlob
  const download = options.download ?? downloadArchive
  options.onProgress?.({ stage: 'reading' })
  const snapshot = await readSnapshot()
  if (!snapshot.quotes.length) return { kind: 'empty' }

  const backup = createBackupDocument(snapshot)
  const encoder = new TextEncoder()
  const entries: Record<string, Uint8Array | [Uint8Array, { level: 0 }]> = {
    'presupuestospro-datos.json': encoder.encode(JSON.stringify(backup, null, 2)),
  }
  const failures: PdfExportFailure[] = []

  for (const [index, quote] of snapshot.quotes.entries()) {
    options.onProgress?.({ stage: 'generating-pdfs', current: index + 1, total: snapshot.quotes.length })
    if (typeof requestAnimationFrame === 'function') await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    try {
      entries[quotePdfFilename(quote)] = [await blobBytes(await createPdf(quote)), { level: 0 }]
    } catch (error) {
      failures.push(failureFor(quote, error))
    }
  }

  if (failures.length) entries['errores-exportacion.txt'] = encoder.encode(createExportFailuresReport(failures))
  options.onProgress?.({ stage: 'building-zip' })
  let archive: Uint8Array
  try {
    archive = await makeZip(entries)
  } catch (error) {
    throw new Error('No fue posible preparar la copia descargable. Inténtalo de nuevo.', { cause: error })
  }
  options.onProgress?.({ stage: 'downloading' })
  try {
    download(new Blob([new Uint8Array(archive)], { type: 'application/zip' }), exportArchiveFilename(snapshot.localDate))
  } catch (error) {
    throw new Error('El navegador no permitió descargar la copia. Revisa sus permisos e inténtalo de nuevo.', { cause: error })
  }
  return failures.length
    ? { kind: 'partial', quoteCount: snapshot.quotes.length, pdfCount: snapshot.quotes.length - failures.length, failures }
    : { kind: 'complete', quoteCount: snapshot.quotes.length, pdfCount: snapshot.quotes.length }
}
