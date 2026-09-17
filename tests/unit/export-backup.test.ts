import { describe, expect, it } from 'vitest'
import { createBackupDocument, createExportFailuresReport, type ExportSnapshot } from '../../src/domain/export-backup'

const snapshot = (): ExportSnapshot => ({
  capturedAt: '2026-09-17T18:30:00.000Z', localDate: '2026-09-17',
  profile: { id: 'current', fullName: 'Ada Lovelace', rfc: 'LOAA010101AAA', taxRegime: 'RESICO', updatedAt: '2026-09-17T18:00:00.000Z', logo: { mimeType: 'image/png', width: 1, height: 1, bytes: new Uint8Array([0, 1, 2, 255]) } },
  services: [{ id: 'service-1', name: 'Consultoría', defaultUnitPrice: '100.50', createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' }],
  quotes: [{ id: 'quote-1', number: '2026-001', sequenceYear: 2026, sequenceNumber: 1, issuedOn: '2026-09-17', validUntil: '2026-10-17', client: { name: 'Cliente', taxPersonType: 'INDIVIDUAL' }, lines: [], professionalSnapshot: { fullName: 'Ada Lovelace', rfc: 'LOAA010101AAA', taxRegime: 'RESICO', capturedAt: '2026-09-17T18:00:00.000Z', logo: { mimeType: 'image/png', width: 1, height: 1, bytes: new Uint8Array([0, 1, 2, 255]) } }, taxSnapshot: { taxRegime: 'RESICO', vatRate: '0.16', incomeTaxWithholdingRate: '0.0125', vatWithholdingNumerator: 2, vatWithholdingDenominator: 3, capturedAt: '2026-09-17T18:00:00.000Z' }, totals: { subtotalCents: 0, vatCents: 0, incomeTaxWithholdingCents: 0, vatWithholdingCents: 0, totalCents: 0, currency: 'MXN' }, createdAt: '2026-09-17T18:00:00.000Z', updatedAt: '2026-09-17T18:00:00.000Z' }], annualSequences: [{ year: 2026, lastAssigned: 3, updatedAt: '2026-09-17T00:00:00.000Z' }],
})

describe('backup export v1', () => {
  it('preserves saved values and encodes logo bytes reversibly', () => {
    const backup = createBackupDocument(snapshot())
    expect(backup).toMatchObject({ format: 'presupuestospro-backup', formatVersion: 1, exportedAt: '2026-09-17T18:30:00.000Z' })
    expect(backup.data.profile?.logo).toMatchObject({ mimeType: 'image/png', width: 1, height: 1, contentBase64: 'AAEC/w==' })
    expect(backup.data.quotes[0]?.professionalSnapshot.logo?.contentBase64).toBe('AAEC/w==')
    expect(backup.data.services[0]?.defaultUnitPrice).toBe('100.50')
    expect(backup.data.annualSequences[0]?.lastAssigned).toBe(3)
  })

  it('represents an absent profile without inventing optional values', () => {
    const value = snapshot()
    value.profile = null
    expect(createBackupDocument(value).data.profile).toBeNull()
  })

  it('formats the UTF-8 failure report in processing order', () => {
    expect(createExportFailuresReport([
      { quoteId: '1', quoteNumber: '2026-003', message: 'No fue posible generar el PDF.' },
      { quoteId: '2', quoteNumber: '2026-008', message: 'Faltan datos guardados necesarios para generar el PDF.' },
    ])).toBe('PresupuestosPro no pudo incluir los siguientes presupuestos como PDF:\n\n- 2026-003: No fue posible generar el PDF.\n- 2026-008: Faltan datos guardados necesarios para generar el PDF.\n\nLos datos de estos presupuestos sí están incluidos en presupuestospro-datos.json.')
  })
})
