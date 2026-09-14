export type TaxRegime = 'RESICO' | 'PROFESSIONAL_SERVICES'
export type TaxPersonType = 'INDIVIDUAL' | 'LEGAL_ENTITY'
export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED'

export interface LogoAsset {
  mimeType: 'image/png' | 'image/jpeg'
  /** Bytes binarios: IndexedDB de WebKit puede fallar al clonar Blob dentro de objetos. */
  bytes: Uint8Array<ArrayBuffer>
  width: number
  height: number
}

export interface ProfessionalProfile {
  id: 'current'
  fullName: string
  rfc: string
  email?: string
  phone?: string
  address?: string
  logo?: LogoAsset
  taxRegime: TaxRegime
  updatedAt: string
}

export type ProfileInput = Omit<ProfessionalProfile, 'id' | 'updatedAt'>

export interface CatalogService {
  id: string
  name: string
  defaultUnitPrice: string
  createdAt: string
  updatedAt: string
}

export interface QuoteClient {
  name: string
  taxPersonType: TaxPersonType
  rfc?: string
  email?: string
  phone?: string
  address?: string
}

export interface QuoteLine {
  id: string
  sourceServiceId?: string
  description: string
  quantity: string
  unitPrice: string
  amountCents: number
}

export interface QuoteLineInput extends Omit<QuoteLine, 'amountCents'> {
  amountCents?: number
}

export interface FrozenProfessionalProfile extends Omit<ProfessionalProfile, 'id' | 'updatedAt'> {
  capturedAt: string
}

export interface FrozenTaxRules {
  taxRegime: TaxRegime
  vatRate: string
  incomeTaxWithholdingRate: string
  vatWithholdingNumerator: number
  vatWithholdingDenominator: number
  capturedAt: string
}

export interface QuoteTotals {
  subtotalCents: number
  vatCents: number
  incomeTaxWithholdingCents: number
  vatWithholdingCents: number
  totalCents: number
  currency: 'MXN'
}

export interface QuoteDraft {
  issuedOn: string
  client: QuoteClient
  lines: QuoteLineInput[]
}

export interface SavedQuote {
  id: string
  number: string
  sequenceYear: number
  sequenceNumber: number
  issuedOn: string
  validUntil: string
  client: QuoteClient
  lines: QuoteLine[]
  professionalSnapshot: FrozenProfessionalProfile
  taxSnapshot: FrozenTaxRules
  totals: QuoteTotals
  createdAt: string
  updatedAt: string
  /** Ausente en presupuestos heredados: se interpreta como Borrador. */
  status?: QuoteStatus
}

export interface AnnualSequence {
  year: number
  lastAssigned: number
  updatedAt: string
}

export class DomainValidationError extends Error {
  readonly fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message)
    this.name = 'DomainValidationError'
    this.fieldErrors = fieldErrors
  }
}

export class LocalStorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'LocalStorageError'
  }
}
