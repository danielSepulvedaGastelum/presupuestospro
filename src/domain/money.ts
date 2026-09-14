import Decimal from 'decimal.js'

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP })

export function normalizeDecimal(value: string): string {
  const trimmed = value.trim()
  const normalizedSeparator = trimmed.includes('.') ? trimmed : trimmed.replace(',', '.')
  if (!normalizedSeparator || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalizedSeparator)) {
    throw new Error('Escribe un número decimal válido.')
  }
  const decimal = new Decimal(normalizedSeparator)
  if (!decimal.isFinite()) throw new Error('Escribe un número decimal finito.')
  return decimal.isZero() ? '0' : decimal.toString()
}

export function decimal(value: string | number): Decimal {
  return new Decimal(typeof value === 'string' ? normalizeDecimal(value) : value)
}

export function toCents(value: string | Decimal): number {
  const amount = value instanceof Decimal ? value : decimal(value)
  return amount.mul(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber()
}

export function centsFromProduct(quantity: string, unitPrice: string): number {
  return toCents(decimal(quantity).mul(decimal(unitPrice)))
}

const mxnFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatMoney(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new Error('El importe en centavos debe ser un entero seguro.')
  return mxnFormatter.format(cents / 100)
}

export function centsToDecimal(cents: number): string {
  return new Decimal(cents).div(100).toFixed(2)
}

