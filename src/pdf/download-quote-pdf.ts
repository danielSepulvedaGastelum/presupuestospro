import type { SavedQuote } from '../domain/types'
import { createQuotePdfBlob } from './create-quote-pdf'

export async function downloadQuotePdf(quote: SavedQuote): Promise<void> {
  try {
    const blob = await createQuotePdfBlob(quote)
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${quote.number}.pdf`
    anchor.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('Agrega') || error.message.startsWith('Falta'))) throw error
    throw new Error('El navegador no permitió descargar el PDF. Revisa sus permisos e inténtalo de nuevo.', { cause: error })
  }
}
