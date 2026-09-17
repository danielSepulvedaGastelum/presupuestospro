import type { SavedQuote } from '../domain/types'
import { buildQuoteDocument } from './build-quote-document'

async function blobToDataUrl(blob: Blob): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('No fue posible leer el logo guardado.'))
    reader.readAsDataURL(blob)
  })
}

function validateQuoteForPdf(quote: SavedQuote): void {
  if (!quote.lines.length) throw new Error('Agrega al menos un concepto antes de descargar el PDF.')
  if (!quote.professionalSnapshot.fullName) throw new Error('Falta el nombre del perfil congelado en este presupuesto.')
  if (!quote.professionalSnapshot.rfc) throw new Error('Falta el RFC del perfil congelado en este presupuesto.')
  if (!quote.professionalSnapshot.taxRegime) throw new Error('Falta el régimen del perfil congelado en este presupuesto.')
}

/** Returns the exact browser PDF source used by individual downloads and ZIP exports. */
export async function createQuotePdfBlob(quote: SavedQuote): Promise<Blob> {
  validateQuoteForPdf(quote)
  try {
    const [{ default: pdfMake }, { default: vfs }] = await Promise.all([
      import('pdfmake/build/pdfmake'),
      import('pdfmake/build/vfs_fonts'),
    ])
    pdfMake.addVirtualFileSystem(vfs)
    const logo = quote.professionalSnapshot.logo
      ? await blobToDataUrl(new Blob([quote.professionalSnapshot.logo.bytes], { type: quote.professionalSnapshot.logo.mimeType }))
      : undefined
    return await pdfMake.createPdf(buildQuoteDocument(quote, logo)).getBlob()
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('Agrega') || error.message.startsWith('Falta'))) throw error
    throw new Error('No fue posible generar el PDF de este presupuesto.', { cause: error })
  }
}
