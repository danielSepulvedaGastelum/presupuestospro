import Decimal from 'decimal.js'
import { centsFromProduct, decimal, normalizeDecimal, toCents } from './money'
import {
  DomainValidationError,
  type FrozenTaxRules,
  type QuoteLine,
  type QuoteLineInput,
  type QuoteTotals,
  type TaxPersonType,
  type TaxRegime,
} from './types'

export interface QuoteCalculationInput {
  taxPersonType: TaxPersonType
  lines: QuoteLineInput[]
}

export interface QuoteCalculation {
  lines: QuoteLine[]
  totals: QuoteTotals
}

export function taxRulesFor(taxRegime: TaxRegime, capturedAt = new Date().toISOString()): FrozenTaxRules {
  return {
    taxRegime,
    vatRate: '0.16',
    incomeTaxWithholdingRate: taxRegime === 'RESICO' ? '0.0125' : '0.10',
    vatWithholdingNumerator: 2,
    vatWithholdingDenominator: 3,
    capturedAt,
  }
}

function validateAndCalculateLine(line: QuoteLineInput, index: number): QuoteLine {
  const errors: Record<string, string> = {}
  const prefix = `lines.${index}`
  if (!line.description.trim()) errors[`${prefix}.description`] = 'Escribe la descripción del concepto.'

  let quantity = line.quantity
  let unitPrice = line.unitPrice
  try {
    quantity = normalizeDecimal(line.quantity)
    if (decimal(quantity).lte(0)) errors[`${prefix}.quantity`] = 'La cantidad debe ser mayor que cero.'
  } catch {
    errors[`${prefix}.quantity`] = 'Escribe una cantidad decimal válida.'
  }
  try {
    unitPrice = normalizeDecimal(line.unitPrice)
    if (decimal(unitPrice).lt(0)) errors[`${prefix}.unitPrice`] = 'El precio no puede ser negativo.'
  } catch {
    errors[`${prefix}.unitPrice`] = 'Escribe un precio decimal válido.'
  }
  if (Object.keys(errors).length) {
    throw new DomainValidationError(Object.values(errors)[0], errors)
  }
  return {
    id: line.id,
    ...(line.sourceServiceId ? { sourceServiceId: line.sourceServiceId } : {}),
    description: line.description.trim(),
    quantity,
    unitPrice,
    amountCents: centsFromProduct(quantity, unitPrice),
  }
}

export function calculateQuote(input: QuoteCalculationInput, rules: FrozenTaxRules): QuoteCalculation {
  const lines: QuoteLine[] = []
  const fieldErrors: Record<string, string> = {}
  input.lines.forEach((line, index) => {
    try {
      lines.push(validateAndCalculateLine(line, index))
    } catch (error) {
      if (error instanceof DomainValidationError) Object.assign(fieldErrors, error.fieldErrors)
      else throw error
    }
  })
  if (Object.keys(fieldErrors).length) {
    throw new DomainValidationError(Object.values(fieldErrors)[0], fieldErrors)
  }

  const subtotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0)
  const vatCents = toCents(new Decimal(subtotalCents).div(100).mul(rules.vatRate))
  const withhold = input.taxPersonType === 'LEGAL_ENTITY'
  const incomeTaxWithholdingCents = withhold
    ? toCents(new Decimal(subtotalCents).div(100).mul(rules.incomeTaxWithholdingRate))
    : 0
  const vatWithholdingCents = withhold
    ? new Decimal(vatCents).mul(rules.vatWithholdingNumerator).div(rules.vatWithholdingDenominator)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber()
    : 0
  return {
    lines,
    totals: {
      subtotalCents,
      vatCents,
      incomeTaxWithholdingCents,
      vatWithholdingCents,
      totalCents: subtotalCents + vatCents - incomeTaxWithholdingCents - vatWithholdingCents,
      currency: 'MXN',
    },
  }
}

export function emptyTotals(): QuoteTotals {
  return { subtotalCents: 0, vatCents: 0, incomeTaxWithholdingCents: 0, vatWithholdingCents: 0, totalCents: 0, currency: 'MXN' }
}

