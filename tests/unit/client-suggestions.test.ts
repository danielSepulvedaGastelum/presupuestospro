import { describe, expect, it } from 'vitest'
import { clientSuggestionKey, deriveClientSuggestions } from '../../src/domain/client-suggestions'
import type { SavedQuote } from '../../src/domain/types'

function quote(id: string, updatedAt: string, client: SavedQuote['client']): SavedQuote {
  return { id, number: `2026-00${id}`, sequenceYear: 2026, sequenceNumber: Number(id), issuedOn: '2026-01-01', validUntil: '2026-01-31', client, lines: [], professionalSnapshot: { fullName: 'A', rfc: 'AAA', taxRegime: 'RESICO', capturedAt: updatedAt }, taxSnapshot: { taxRegime: 'RESICO', vatRate: '0.16', incomeTaxWithholdingRate: '0.0125', vatWithholdingNumerator: 2, vatWithholdingDenominator: 3, capturedAt: updatedAt }, totals: { subtotalCents: 0, vatCents: 0, incomeTaxWithholdingCents: 0, vatWithholdingCents: 0, totalCents: 0, currency: 'MXN' }, createdAt: updatedAt, updatedAt }
}

describe('sugerencias de clientes', () => {
  it('agrupa por RFC normalizado y conserva el registro más reciente', () => {
    const suggestions = deriveClientSuggestions([
      quote('1', '2026-01-01T00:00:00Z', { name: 'Anterior', rfc: 'abc010101aa1', taxPersonType: 'LEGAL_ENTITY', phone: '1' }),
      quote('2', '2026-02-01T00:00:00Z', { name: 'Reciente', rfc: ' ABC010101AA1 ', taxPersonType: 'LEGAL_ENTITY', phone: '2' }),
    ])
    expect(suggestions).toHaveLength(1)
    expect(suggestions[0].client.phone).toBe('2')
  })

  it('sin RFC agrupa nombre normalizado y tipo fiscal', () => {
    expect(clientSuggestionKey({ name: '  Agencia   Norte ', taxPersonType: 'INDIVIDUAL' })).toBe('name:agencia norte:INDIVIDUAL')
    expect(clientSuggestionKey({ name: 'agencia norte', taxPersonType: 'LEGAL_ENTITY' })).not.toBe(clientSuggestionKey({ name: 'agencia norte', taxPersonType: 'INDIVIDUAL' }))
  })

  it('separa RFC distintos y entrega copias independientes', () => {
    const source = [quote('1', '2026-01-01T00:00:00Z', { name: 'A', rfc: 'AAA', taxPersonType: 'LEGAL_ENTITY' }), quote('2', '2026-01-02T00:00:00Z', { name: 'A', rfc: 'BBB', taxPersonType: 'LEGAL_ENTITY' })]
    const suggestions = deriveClientSuggestions(source)
    expect(suggestions).toHaveLength(2)
    suggestions[0].client.name = 'Cambio'
    expect(source.every(({ client }) => client.name === 'A')).toBe(true)
  })
})

