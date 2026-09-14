const CIVIL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function isCivilDate(value: string): boolean {
  const match = CIVIL_DATE.exec(value)
  if (!match) return false
  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(year, month - 1, day, 12)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

export function localToday(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function addCivilDays(value: string, days: number): string {
  if (!isCivilDate(value)) throw new Error('La fecha debe tener el formato AAAA-MM-DD.')
  const [year, month, day] = value.split('-').map(Number)
  const result = new Date(year, month - 1, day + days, 12)
  return `${result.getFullYear()}-${pad(result.getMonth() + 1)}-${pad(result.getDate())}`
}

export function sequenceYear(value: string): number {
  if (!isCivilDate(value)) throw new Error('La fecha de emisión no es válida.')
  return Number(value.slice(0, 4))
}

export function formatCivilDate(value: string): string {
  if (!isCivilDate(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(year, month - 1, day, 12))
}

