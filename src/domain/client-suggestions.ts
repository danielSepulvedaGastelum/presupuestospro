import type { QuoteClient, SavedQuote } from './types'

export interface ClientSuggestion {
  key: string
  client: QuoteClient
  sourceQuoteId: string
  updatedAt: string
}

function normalizedName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-MX')
}

export function clientSuggestionKey(client: QuoteClient): string {
  const rfc = client.rfc?.trim().toUpperCase()
  return rfc ? `rfc:${rfc}` : `name:${normalizedName(client.name)}:${client.taxPersonType}`
}

export function deriveClientSuggestions(quotes: SavedQuote[]): ClientSuggestion[] {
  const byKey = new Map<string, ClientSuggestion>()
  for (const quote of quotes) {
    const key = clientSuggestionKey(quote.client)
    const current = byKey.get(key)
    if (!current || quote.updatedAt > current.updatedAt) {
      byKey.set(key, { key, client: structuredClone(quote.client), sourceQuoteId: quote.id, updatedAt: quote.updatedAt })
    }
  }
  return [...byKey.values()].sort((a, b) => a.client.name.localeCompare(b.client.name, 'es-MX', { sensitivity: 'base' }))
}

