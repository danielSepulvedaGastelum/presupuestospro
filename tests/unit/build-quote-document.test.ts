import { describe, expect, it } from 'vitest'
import { buildQuoteDocument } from '../../src/pdf/build-quote-document'
import { designTokens } from '../../src/presentation/design-tokens'
import type { SavedQuote } from '../../src/domain/types'

const quote = (status: SavedQuote['status'] = 'DRAFT', validUntil = '2026-09-10') => ({
  id: '1', number: '2026-001', sequenceYear: 2026, sequenceNumber: 1, issuedOn: '2026-08-11', validUntil, status,
  client: { name: 'Cliente', taxPersonType: 'LEGAL_ENTITY' }, lines: [], createdAt: '2026-08-11T00:00:00.000Z', updatedAt: '2026-08-11T00:00:00.000Z',
  professionalSnapshot: { fullName: 'Ana', rfc: 'AAAA000000AAA', taxRegime: 'RESICO', capturedAt: '2026-08-11T00:00:00.000Z' },
  taxSnapshot: { taxRegime: 'RESICO', vatRate: '0.16', incomeTaxWithholdingRate: '0.0125', vatWithholdingNumerator: 2, vatWithholdingDenominator: 3, capturedAt: '2026-08-11T00:00:00.000Z' },
  totals: { subtotalCents: 0, vatCents: 0, incomeTaxWithholdingCents: 0, vatWithholdingCents: 0, totalCents: 0, currency: 'MXN' },
} as SavedQuote)

describe('buildQuoteDocument', () => {
  it('uses the effective state and shared visual tokens', () => {
    const document = buildQuoteDocument(quote('SENT'))
    expect(JSON.stringify(document.content)).toContain('Caducado')
    expect(JSON.stringify(document)).toContain(designTokens.color.brand)
  })
  it('keeps accepted state final after expiry', () => expect(JSON.stringify(buildQuoteDocument(quote('ACCEPTED')))).toContain('Aceptado'))
})
