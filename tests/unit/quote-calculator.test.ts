import { describe, expect, it } from 'vitest'
import { calculateQuote, taxRulesFor } from '../../src/domain/quote-calculator'
import { DomainValidationError, type QuoteLineInput } from '../../src/domain/types'

const lines: QuoteLineInput[] = [
  { id: '1', description: 'Diseño', quantity: '1', unitPrice: '1500' },
  { id: '2', description: 'Fotografía', quantity: '1', unitPrice: '500' },
]

describe('cálculo de presupuesto', () => {
  it('calcula RESICO ante persona moral', () => {
    const result = calculateQuote({ taxPersonType: 'LEGAL_ENTITY', lines }, taxRulesFor('RESICO'))
    expect(result.totals).toMatchObject({ subtotalCents: 200000, vatCents: 32000, incomeTaxWithholdingCents: 2500, vatWithholdingCents: 21333, totalCents: 208167 })
  })

  it('calcula Servicios Profesionales ante persona moral', () => {
    const result = calculateQuote({ taxPersonType: 'LEGAL_ENTITY', lines }, taxRulesFor('PROFESSIONAL_SERVICES'))
    expect(result.totals.totalCents).toBe(190667)
  })

  it('no retiene a persona física', () => {
    const result = calculateQuote({ taxPersonType: 'INDIVIDUAL', lines }, taxRulesFor('RESICO'))
    expect(result.totals).toMatchObject({ incomeTaxWithholdingCents: 0, vatWithholdingCents: 0, totalCents: 232000 })
  })

  it('redondea cada línea antes de sumar', () => {
    const result = calculateQuote({ taxPersonType: 'INDIVIDUAL', lines: [
      { id: '1', description: 'A', quantity: '1', unitPrice: '0.005' },
      { id: '2', description: 'B', quantity: '1', unitPrice: '0.005' },
    ] }, taxRulesFor('RESICO'))
    expect(result.totals.subtotalCents).toBe(2)
  })

  it.each([
    [{ id: '1', description: '', quantity: '1', unitPrice: '1' }, 'descripción'],
    [{ id: '1', description: 'A', quantity: '0', unitPrice: '1' }, 'cantidad'],
    [{ id: '1', description: 'A', quantity: '1', unitPrice: '-1' }, 'precio'],
    [{ id: '1', description: 'A', quantity: 'no', unitPrice: '1' }, 'decimal'],
  ])('rechaza una línea inválida', (line, expected) => {
    expect(() => calculateQuote({ taxPersonType: 'LEGAL_ENTITY', lines: [line] }, taxRulesFor('RESICO')))
      .toThrowError(DomainValidationError)
    try { calculateQuote({ taxPersonType: 'LEGAL_ENTITY', lines: [line] }, taxRulesFor('RESICO')) } catch (error) {
      expect((error as Error).message.toLocaleLowerCase('es-MX')).toContain(expected)
    }
  })
})

