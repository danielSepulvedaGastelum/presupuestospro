import { describe, expect, it } from 'vitest'
import { formatQuoteNumber, nextSequenceNumber, parseQuoteNumber } from '../../src/domain/numbering'

describe('numeración anual', () => {
  it('usa un mínimo de tres dígitos', () => {
    expect(formatQuoteNumber(2026, 1)).toBe('2026-001')
    expect(formatQuoteNumber(2026, 999)).toBe('2026-999')
  })

  it('crece después de 999 sin truncar', () => {
    expect(nextSequenceNumber(999)).toBe(1000)
    expect(formatQuoteNumber(2026, 1000)).toBe('2026-1000')
  })

  it('reinicia por año y permite interpretar el número', () => {
    expect(nextSequenceNumber(undefined)).toBe(1)
    expect(parseQuoteNumber('2027-001')).toEqual({ year: 2027, sequence: 1 })
    expect(() => parseQuoteNumber('2027-00A')).toThrow()
  })
})
