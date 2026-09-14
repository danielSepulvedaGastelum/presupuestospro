import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { addCivilDays, isCivilDate, sequenceYear } from '../domain/dates'
import { decimal, normalizeDecimal } from '../domain/money'
import { formatQuoteNumber, nextSequenceNumber } from '../domain/numbering'
import { calculateQuote, taxRulesFor } from '../domain/quote-calculator'
import { DomainValidationError, LocalStorageError, type AnnualSequence, type CatalogService, type FrozenProfessionalProfile, type ProfessionalProfile, type ProfileInput, type QuoteClient, type QuoteDraft, type QuoteLineInput, type QuoteStatus, type SavedQuote } from '../domain/types'

interface PresupuestosProSchema extends DBSchema {
  profile: {
    key: 'current'
    value: ProfessionalProfile
  }
  services: {
    key: string
    value: CatalogService
    indexes: { updatedAt: string }
  }
  quotes: {
    key: string
    value: SavedQuote
    indexes: { number: string; sequenceYear: number; updatedAt: string }
  }
  annualSequences: {
    key: number
    value: AnnualSequence
  }
}

let databasePromise: Promise<IDBPDatabase<PresupuestosProSchema>> | undefined

export function getDatabase(): Promise<IDBPDatabase<PresupuestosProSchema>> {
  databasePromise ??= openDB<PresupuestosProSchema>('presupuestospro', 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('profile')) {
        database.createObjectStore('profile', { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains('services')) {
        const services = database.createObjectStore('services', { keyPath: 'id' })
        services.createIndex('updatedAt', 'updatedAt')
      }
      if (!database.objectStoreNames.contains('quotes')) {
        const quotes = database.createObjectStore('quotes', { keyPath: 'id' })
        quotes.createIndex('number', 'number', { unique: true })
        quotes.createIndex('sequenceYear', 'sequenceYear')
        quotes.createIndex('updatedAt', 'updatedAt')
      }
      if (!database.objectStoreNames.contains('annualSequences')) {
        database.createObjectStore('annualSequences', { keyPath: 'year' })
      }
    },
  })
  return databasePromise
}

function cleanOptional(value?: string): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function storageFailure(error: unknown): LocalStorageError {
  const cause = error instanceof Error ? error : undefined
  if (cause?.name === 'QuotaExceededError') {
    return new LocalStorageError('No hay espacio suficiente en este navegador. Libera almacenamiento e inténtalo de nuevo.', { cause })
  }
  return new LocalStorageError('No fue posible guardar los datos en este navegador. Inténtalo de nuevo sin cerrar la página.', { cause })
}

export function validateProfile(input: Partial<ProfileInput>): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!input.fullName?.trim()) errors.fullName = 'Escribe tu nombre completo.'
  if (!input.rfc?.trim()) errors.rfc = 'Escribe tu RFC.'
  if (!input.taxRegime) errors.taxRegime = 'Elige tu régimen fiscal.'
  return errors
}

export async function getProfile(): Promise<ProfessionalProfile | undefined> {
  try {
    return await (await getDatabase()).get('profile', 'current')
  } catch (error) {
    throw storageFailure(error)
  }
}

export async function saveProfile(input: Partial<ProfileInput>): Promise<ProfessionalProfile> {
  const errors = validateProfile(input)
  if (Object.keys(errors).length) throw new DomainValidationError('Revisa los datos obligatorios del perfil.', errors)
  const profile: ProfessionalProfile = {
    id: 'current',
    fullName: input.fullName!.trim(),
    rfc: input.rfc!.trim().toUpperCase(),
    ...(cleanOptional(input.email) ? { email: cleanOptional(input.email) } : {}),
    ...(cleanOptional(input.phone) ? { phone: cleanOptional(input.phone) } : {}),
    ...(cleanOptional(input.address) ? { address: cleanOptional(input.address) } : {}),
    ...(input.logo ? { logo: input.logo } : {}),
    taxRegime: input.taxRegime!,
    updatedAt: new Date().toISOString(),
  }
  try {
    await (await getDatabase()).put('profile', profile)
    return profile
  } catch (error) {
    throw storageFailure(error)
  }
}

function validateClient(client: QuoteClient): QuoteClient {
  if (!client.name.trim()) {
    throw new DomainValidationError('Escribe el nombre o razón social del cliente.', { clientName: 'Escribe el nombre o razón social del cliente.' })
  }
  const optional = (value?: string) => value?.trim() || undefined
  return {
    name: client.name.trim(),
    taxPersonType: client.taxPersonType,
    ...(optional(client.rfc) ? { rfc: optional(client.rfc)!.toUpperCase() } : {}),
    ...(optional(client.email) ? { email: optional(client.email) } : {}),
    ...(optional(client.phone) ? { phone: optional(client.phone) } : {}),
    ...(optional(client.address) ? { address: optional(client.address) } : {}),
  }
}

function frozenProfile(profile: ProfessionalProfile, capturedAt: string): FrozenProfessionalProfile {
  const { id: _id, updatedAt: _updatedAt, ...visible } = profile
  return { ...visible, capturedAt }
}

export async function saveNewQuote(draft: QuoteDraft): Promise<SavedQuote> {
  if (!isCivilDate(draft.issuedOn)) {
    throw new DomainValidationError('La fecha de emisión no es válida.', { issuedOn: 'Escribe una fecha de emisión válida.' })
  }
  const client = validateClient(draft.client)
  const database = await getDatabase()
  const transaction = database.transaction(['profile', 'annualSequences', 'quotes'], 'readwrite')
  try {
    const profile = await transaction.objectStore('profile').get('current')
    if (!profile) {
      throw new DomainValidationError('Completa tu perfil antes de guardar un presupuesto.', { profile: 'Completa nombre, RFC y régimen en Mi perfil.' })
    }
    const profileErrors = validateProfile(profile)
    if (Object.keys(profileErrors).length) throw new DomainValidationError('Completa tu perfil antes de guardar.', profileErrors)
    const year = sequenceYear(draft.issuedOn)
    const sequenceStore = transaction.objectStore('annualSequences')
    const previous = await sequenceStore.get(year)
    const sequenceNumber = nextSequenceNumber(previous?.lastAssigned)
    const now = new Date().toISOString()
    const rules = taxRulesFor(profile.taxRegime, now)
    const calculation = calculateQuote({ taxPersonType: client.taxPersonType, lines: draft.lines }, rules)
    const quote: SavedQuote = {
      id: crypto.randomUUID(),
      number: formatQuoteNumber(year, sequenceNumber),
      sequenceYear: year,
      sequenceNumber,
      issuedOn: draft.issuedOn,
      validUntil: addCivilDays(draft.issuedOn, 30),
      client,
      lines: calculation.lines,
      professionalSnapshot: frozenProfile(profile, now),
      taxSnapshot: rules,
      totals: calculation.totals,
      createdAt: now,
      updatedAt: now,
      status: 'DRAFT',
    }
    await transaction.objectStore('quotes').add(quote)
    await sequenceStore.put({ year, lastAssigned: sequenceNumber, updatedAt: now })
    await transaction.done
    return quote
  } catch (error) {
    try { transaction.abort() } catch { /* La transacción ya pudo abortarse por IndexedDB. */ }
    if (error instanceof DomainValidationError) throw error
    throw storageFailure(error)
  }
}

export async function updateQuote(id: string, changes: Pick<QuoteDraft, 'client' | 'lines'>): Promise<SavedQuote> {
  const database = await getDatabase()
  const transaction = database.transaction('quotes', 'readwrite')
  try {
    const existing = await transaction.store.get(id)
    if (!existing) throw new DomainValidationError('No se encontró el presupuesto.', { quote: 'Vuelve a la lista y ábrelo otra vez.' })
    const client = validateClient(changes.client)
    const calculation = calculateQuote({ taxPersonType: client.taxPersonType, lines: changes.lines }, existing.taxSnapshot)
    const updated: SavedQuote = {
      ...existing,
      client,
      lines: calculation.lines,
      totals: calculation.totals,
      updatedAt: new Date().toISOString(),
    }
    await transaction.store.put(updated)
    await transaction.done
    return updated
  } catch (error) {
    try { transaction.abort() } catch { /* La transacción ya pudo abortarse por IndexedDB. */ }
    if (error instanceof DomainValidationError) throw error
    throw storageFailure(error)
  }
}

export async function getQuote(id: string): Promise<SavedQuote | undefined> {
  try {
    return await (await getDatabase()).get('quotes', id)
  } catch (error) {
    throw storageFailure(error)
  }
}

export async function setQuoteStatus(id: string, status: QuoteStatus): Promise<SavedQuote> {
  const database = await getDatabase()
  try {
    const existing = await database.get('quotes', id)
    if (!existing) throw new DomainValidationError('No se encontró el presupuesto.', { quote: 'Actualiza la lista e inténtalo de nuevo.' })
    const updated: SavedQuote = { ...existing, status }
    await database.put('quotes', updated)
    return updated
  } catch (error) {
    if (error instanceof DomainValidationError) throw error
    throw storageFailure(error)
  }
}

export async function listQuotes(): Promise<SavedQuote[]> {
  try {
    const quotes = await (await getDatabase()).getAllFromIndex('quotes', 'updatedAt')
    return quotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } catch (error) {
    throw storageFailure(error)
  }
}

function validateService(input: { name?: string; defaultUnitPrice?: string }): { name: string; defaultUnitPrice: string } {
  const errors: Record<string, string> = {}
  if (!input.name?.trim()) errors.serviceName = 'Escribe el nombre del servicio.'
  let price = input.defaultUnitPrice ?? ''
  try {
    price = normalizeDecimal(price)
    if (decimal(price).lt(0)) errors.defaultUnitPrice = 'El precio no puede ser negativo.'
  } catch { errors.defaultUnitPrice = 'Escribe un precio decimal válido.' }
  if (Object.keys(errors).length) throw new DomainValidationError('Revisa los datos del servicio.', errors)
  return { name: input.name!.trim(), defaultUnitPrice: price }
}

export async function createService(input: { name: string; defaultUnitPrice: string }): Promise<CatalogService> {
  const valid = validateService(input)
  const now = new Date().toISOString()
  const service: CatalogService = { id: crypto.randomUUID(), ...valid, createdAt: now, updatedAt: now }
  try { await (await getDatabase()).add('services', service); return service }
  catch (error) { throw storageFailure(error) }
}

export async function updateService(id: string, input: { name: string; defaultUnitPrice: string }): Promise<CatalogService> {
  const valid = validateService(input)
  const database = await getDatabase()
  try {
    const previous = await database.get('services', id)
    if (!previous) throw new DomainValidationError('No se encontró el servicio.', { service: 'Actualiza la lista e inténtalo de nuevo.' })
    const updated = { ...previous, ...valid, updatedAt: new Date().toISOString() }
    await database.put('services', updated)
    return updated
  } catch (error) { if (error instanceof DomainValidationError) throw error; throw storageFailure(error) }
}

export async function deleteService(id: string): Promise<void> {
  try {
    const database = await getDatabase()
    if (!await database.get('services', id)) throw new DomainValidationError('No se encontró el servicio.', { service: 'Actualiza la lista e inténtalo de nuevo.' })
    await database.delete('services', id)
  } catch (error) { if (error instanceof DomainValidationError) throw error; throw storageFailure(error) }
}

export async function listServices(): Promise<CatalogService[]> {
  try {
    const services = await (await getDatabase()).getAll('services')
    return services.sort((a, b) => a.name.localeCompare(b.name, 'es-MX', { sensitivity: 'base' }))
  } catch (error) { throw storageFailure(error) }
}
