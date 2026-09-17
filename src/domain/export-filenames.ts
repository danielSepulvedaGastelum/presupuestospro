import { localToday } from './dates'
import type { SavedQuote } from './types'

const INVALID_FILENAME = /[<>:"/\\|?*\u0000-\u001F]/g
const REPLACEMENT_RUN = /[-\s]+/g
const WINDOWS_RESERVED = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\..*)?$/i

export function safeClientFilename(value: string): string {
  const cleaned = value
    .replace(INVALID_FILENAME, '-')
    .replace(REPLACEMENT_RUN, '-')
    .replace(/[.\s-]+$/g, '')
    .replace(/^-+/g, '')
  return cleaned && !WINDOWS_RESERVED.test(cleaned) ? cleaned : 'Cliente'
}

export function quotePdfFilename(quote: Pick<SavedQuote, 'number' | 'client'>): string {
  return `${quote.number} - ${safeClientFilename(quote.client.name)}.pdf`
}

export function exportArchiveFilename(localDate = localToday()): string {
  return `presupuestospro-copia-${localDate}.zip`
}
