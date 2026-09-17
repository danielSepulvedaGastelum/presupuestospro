import type { AnnualSequence, CatalogService, FrozenProfessionalProfile, LogoAsset, ProfessionalProfile, SavedQuote } from './types'

export interface ExportSnapshot {
  capturedAt: string
  localDate: string
  profile: ProfessionalProfile | null
  services: CatalogService[]
  quotes: SavedQuote[]
  annualSequences: AnnualSequence[]
}

export interface BackupLogoV1 extends Omit<LogoAsset, 'bytes'> {
  contentBase64: string
}

export interface BackupProfileV1 extends Omit<ProfessionalProfile, 'logo'> {
  logo?: BackupLogoV1
}

export interface BackupFrozenProfessionalProfileV1 extends Omit<FrozenProfessionalProfile, 'logo'> {
  logo?: BackupLogoV1
}

export interface BackupSavedQuoteV1 extends Omit<SavedQuote, 'professionalSnapshot'> {
  professionalSnapshot: BackupFrozenProfessionalProfileV1
}

export interface BackupDocumentV1 {
  format: 'presupuestospro-backup'
  formatVersion: 1
  exportedAt: string
  data: {
    profile: BackupProfileV1 | null
    services: CatalogService[]
    quotes: BackupSavedQuoteV1[]
    annualSequences: AnnualSequence[]
  }
}

export interface PdfExportFailure {
  quoteId: string
  quoteNumber: string
  message: string
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

function backupLogo(logo: LogoAsset): BackupLogoV1 {
  return { mimeType: logo.mimeType, width: logo.width, height: logo.height, contentBase64: bytesToBase64(logo.bytes) }
}

function backupProfile(profile: ProfessionalProfile): BackupProfileV1 {
  const { logo, ...values } = profile
  return logo ? { ...values, logo: backupLogo(logo) } : values
}

function backupQuote(quote: SavedQuote): BackupSavedQuoteV1 {
  const { logo, ...professional } = quote.professionalSnapshot
  return { ...quote, professionalSnapshot: logo ? { ...professional, logo: backupLogo(logo) } : professional }
}

/** Builds the portable v1 document without recalculating or normalizing saved values. */
export function createBackupDocument(snapshot: ExportSnapshot): BackupDocumentV1 {
  return {
    format: 'presupuestospro-backup',
    formatVersion: 1,
    exportedAt: snapshot.capturedAt,
    data: {
      profile: snapshot.profile ? backupProfile(snapshot.profile) : null,
      services: snapshot.services,
      quotes: snapshot.quotes.map(backupQuote),
      annualSequences: snapshot.annualSequences,
    },
  }
}

export function createExportFailuresReport(failures: PdfExportFailure[]): string {
  const lines = [
    'PresupuestosPro no pudo incluir los siguientes presupuestos como PDF:',
    '',
    ...failures.map((failure) => `- ${failure.quoteNumber}: ${failure.message}`),
    '',
    'Los datos de estos presupuestos sí están incluidos en presupuestospro-datos.json.',
  ]
  return lines.join('\n')
}
