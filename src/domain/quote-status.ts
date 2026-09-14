import { localToday } from './dates'
import type { QuoteStatus, SavedQuote } from './types'

export type EffectiveQuoteStatus = QuoteStatus | 'EXPIRED'

export const quoteStatusLabel: Record<EffectiveQuoteStatus, string> = {
  DRAFT: 'Borrador', SENT: 'Enviado', ACCEPTED: 'Aceptado', REJECTED: 'Rechazado', EXPIRED: 'Caducado',
}

export const quoteStatusDescription: Record<EffectiveQuoteStatus, string> = {
  DRAFT: 'Aún en preparación', SENT: 'Pendiente de respuesta', ACCEPTED: 'Confirmado', REJECTED: 'No aceptado', EXPIRED: 'Venció sin respuesta',
}

export function storedQuoteStatus(quote: SavedQuote): QuoteStatus {
  if (!quote.status) return 'DRAFT'
  if (['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'].includes(quote.status)) return quote.status
  throw new Error('El estado guardado del presupuesto no es válido.')
}

export function effectiveQuoteStatus(quote: SavedQuote, today = localToday()): EffectiveQuoteStatus {
  const status = storedQuoteStatus(quote)
  return (status === 'DRAFT' || status === 'SENT') && quote.validUntil < today ? 'EXPIRED' : status
}
