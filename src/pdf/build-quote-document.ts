import type { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces'
import { formatCivilDate } from '../domain/dates'
import { formatMoney, toCents } from '../domain/money'
import type { SavedQuote } from '../domain/types'
import { effectiveQuoteStatus, quoteStatusLabel } from '../domain/quote-status'
import { designTokens } from '../presentation/design-tokens'

function optionalLines(values: Array<[string, string | undefined]>): Content[] {
  return values.filter((entry): entry is [string, string] => Boolean(entry[1])).map(([label, value]) => ({ text: `${label}: ${value}`, marginBottom: 2 }))
}

export function buildQuoteDocument(quote: SavedQuote, logoDataUrl?: string): TDocumentDefinitions {
  const colors = designTokens.color
  const status = quoteStatusLabel[effectiveQuoteStatus(quote)]
  const professional = quote.professionalSnapshot
  const client = quote.client
  const headerCells: TableCell[] = [
    { text: 'Descripción', style: 'tableHeader' },
    { text: 'Cantidad', style: 'tableHeader', alignment: 'right' },
    { text: 'Precio unitario', style: 'tableHeader', alignment: 'right' },
    { text: 'Importe', style: 'tableHeader', alignment: 'right' },
  ]
  const lineRows: TableCell[][] = quote.lines.map((line) => [
    { text: line.description },
    { text: line.quantity, alignment: 'right' },
    { text: formatMoney(toCents(line.unitPrice)), alignment: 'right' },
    { text: formatMoney(line.amountCents), alignment: 'right' },
  ])
  const taxLegend = quote.client.taxPersonType === 'INDIVIDUAL'
    ? 'No aplican retenciones de ISR ni de IVA para este cliente persona física.'
    : `Retenciones aplicables a persona moral bajo el régimen ${quote.taxSnapshot.taxRegime === 'RESICO' ? 'RESICO' : 'Servicios Profesionales'}.`
  const content: Content[] = [
    {
      columns: [
        logoDataUrl ? { image: logoDataUrl, width: 110, height: 70, fit: [110, 70] } : { text: '' },
        { stack: [{ text: professional.fullName, style: 'professionalName' }, { text: `RFC: ${professional.rfc}` }, ...optionalLines([['Correo', professional.email], ['Teléfono', professional.phone], ['Domicilio', professional.address]])], alignment: 'right' },
      ],
      columnGap: 24,
      marginBottom: 24,
    },
    { text: 'PRESUPUESTO', style: 'title' },
    { columns: [{ text: quote.number, style: 'quoteNumber' }, { text: status, style: 'statusBadge', alignment: 'right' }], marginBottom: 16 },
    { columns: [{ text: `Emisión: ${formatCivilDate(quote.issuedOn)}` }, { text: `Válido hasta: ${formatCivilDate(quote.validUntil)}`, alignment: 'right' }], marginBottom: 20 },
    { text: 'Cliente', style: 'sectionTitle' },
    { text: client.name, bold: true },
    { text: client.taxPersonType === 'LEGAL_ENTITY' ? 'Persona moral' : 'Persona física' },
    ...optionalLines([['RFC', client.rfc], ['Correo', client.email], ['Teléfono', client.phone], ['Domicilio', client.address]]),
    { text: 'Conceptos', style: 'sectionTitle', marginTop: 20 },
    {
      table: { headerRows: 1, dontBreakRows: false, widths: ['*', 58, 92, 92], body: [headerCells, ...lineRows] },
      layout: {
        fillColor: (rowIndex: number) => rowIndex === 0 ? colors.brand : rowIndex % 2 === 0 ? colors.input : null,
        hLineColor: colors.border, vLineColor: colors.border, paddingLeft: () => 8, paddingRight: () => 8, paddingTop: () => 8, paddingBottom: () => 8,
      },
    },
    {
      unbreakable: true,
      marginTop: 18,
      stack: [
        { table: { widths: ['*', 115], body: [
          [{ text: 'Base' }, { text: formatMoney(quote.totals.subtotalCents), alignment: 'right' }],
          [{ text: 'IVA (16 %)' }, { text: formatMoney(quote.totals.vatCents), alignment: 'right' }],
          [{ text: 'ISR retenido' }, { text: `− ${formatMoney(quote.totals.incomeTaxWithholdingCents)}`, alignment: 'right' }],
          [{ text: 'IVA retenido' }, { text: `− ${formatMoney(quote.totals.vatWithholdingCents)}`, alignment: 'right' }],
          [{ text: 'Total', bold: true, fontSize: 13 }, { text: formatMoney(quote.totals.totalCents), bold: true, fontSize: 13, color: colors.brand, alignment: 'right' }],
        ] }, layout: 'lightHorizontalLines' },
        { text: taxLegend, italics: true, color: colors.muted, marginTop: 10 },
      ],
    },
  ]
  return {
    info: { title: `Presupuesto ${quote.number}`, author: professional.fullName, subject: 'Presupuesto profesional en MXN' },
    pageSize: 'LETTER', pageMargins: [42, 46, 42, 46], defaultStyle: { font: 'Roboto', fontSize: 9, color: colors.ink, lineHeight: 1.2 }, content,
    styles: {
      title: { fontSize: 23, bold: true, color: colors.brand }, quoteNumber: { fontSize: 12, bold: true }, statusBadge: { bold: true, color: colors.brand },
      professionalName: { fontSize: 13, bold: true, color: colors.brand, marginBottom: 4 }, sectionTitle: { fontSize: 12, bold: true, color: colors.brand, marginBottom: 7 },
      tableHeader: { bold: true, color: '#ffffff', fillColor: colors.brand },
    },
  }
}
