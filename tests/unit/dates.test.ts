import { describe, expect, it } from 'vitest'
import { addCivilDays, isCivilDate, localToday, sequenceYear } from '../../src/domain/dates'

describe('fechas civiles', () => {
  it('valida fechas reales con formato AAAA-MM-DD', () => {
    expect(isCivilDate('2026-02-28')).toBe(true)
    expect(isCivilDate('2026-02-29')).toBe(false)
    expect(isCivilDate('2026-2-8')).toBe(false)
  })

  it('suma 30 días sin convertir la fecha a UTC', () => {
    expect(addCivilDays('2026-12-15', 30)).toBe('2027-01-14')
    expect(sequenceYear('2026-12-15')).toBe(2026)
  })

  it('produce la fecha local actual', () => {
    expect(localToday()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

