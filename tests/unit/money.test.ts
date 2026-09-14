import { describe, expect, it } from 'vitest'
import { formatMoney, normalizeDecimal, toCents } from '../../src/domain/money'

describe('dinero', () => {
  it('normaliza decimales finitos sin perder precisión', () => {
    expect(normalizeDecimal(' 001.2300 ')).toBe('1.23')
    expect(normalizeDecimal('1,25')).toBe('1.25')
    expect(() => normalizeDecimal('Infinity')).toThrow(/decimal/i)
  })

  it('redondea medios centavos con ROUND_HALF_UP', () => {
    expect(toCents('1.005')).toBe(101)
    expect(toCents('2.004')).toBe(200)
    expect(toCents('-1.005')).toBe(-101)
  })

  it('presenta centavos como MXN en es-MX', () => {
    const result = formatMoney(208167)
    expect(result).toContain('2,081.67')
    expect(result).toContain('MXN')
  })
})

