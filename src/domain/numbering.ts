export function nextSequenceNumber(lastAssigned?: number): number {
  if (lastAssigned !== undefined && (!Number.isSafeInteger(lastAssigned) || lastAssigned < 0)) {
    throw new Error('El último consecutivo no es válido.')
  }
  return (lastAssigned ?? 0) + 1
}

export function formatQuoteNumber(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 1000 || year > 9999) throw new Error('El año debe tener cuatro dígitos.')
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new Error('El consecutivo debe ser positivo.')
  return `${year}-${String(sequence).padStart(3, '0')}`
}

export function parseQuoteNumber(value: string): { year: number; sequence: number } {
  const match = /^(\d{4})-(\d{3,})$/.exec(value)
  if (!match) throw new Error('El número de presupuesto no es válido.')
  return { year: Number(match[1]), sequence: Number(match[2]) }
}

