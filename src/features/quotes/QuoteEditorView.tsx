import { useEffect, useMemo, useRef, useState } from 'react'
import { addCivilDays, formatCivilDate, localToday } from '../../domain/dates'
import { formatMoney, toCents } from '../../domain/money'
import { calculateQuote, emptyTotals, taxRulesFor } from '../../domain/quote-calculator'
import { DomainValidationError, type ProfessionalProfile, type QuoteClient, type QuoteDraft, type QuoteLineInput, type QuoteStatus, type SavedQuote, type TaxPersonType } from '../../domain/types'
import type { CatalogService } from '../../domain/types'
import type { ClientSuggestion } from '../../domain/client-suggestions'
import { downloadQuotePdf } from '../../pdf/download-quote-pdf'

interface QuoteEditorViewProps {
  profile?: ProfessionalProfile
  quote?: SavedQuote
  onClose(): void
  onSave(draft: QuoteDraft, quoteId?: string): Promise<SavedQuote>
  onStatusChange(id: string, status: QuoteStatus): Promise<SavedQuote>
  services?: CatalogService[]
  suggestions?: ClientSuggestion[]
}

function newLine(): QuoteLineInput {
  return { id: crypto.randomUUID(), description: '', quantity: '1', unitPrice: '0' }
}

function editableLines(quote?: SavedQuote): QuoteLineInput[] {
  return quote?.lines.map(({ amountCents: _amount, ...line }) => line) ?? []
}

function fingerprint(issuedOn: string, client: QuoteClient, lines: QuoteLineInput[]): string {
  return JSON.stringify({ issuedOn, client, lines: lines.map(({ amountCents: _amount, ...line }) => line) })
}

export default function QuoteEditorView({ profile, quote, onClose, onSave, onStatusChange, services = [], suggestions = [] }: QuoteEditorViewProps) {
  const [currentQuote, setCurrentQuote] = useState(quote)
  const [issuedOn, setIssuedOn] = useState(quote?.issuedOn ?? localToday())
  const [client, setClient] = useState<QuoteClient>(quote?.client ?? { name: '', taxPersonType: 'LEGAL_ENTITY' })
  const [lines, setLines] = useState<QuoteLineInput[]>(editableLines(quote))
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState('')
  const [clientSearch, setClientSearch] = useState('')
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    setCurrentQuote(quote)
    setIssuedOn(quote?.issuedOn ?? localToday())
    setClient(quote?.client ?? { name: '', taxPersonType: 'LEGAL_ENTITY' })
    setLines(editableLines(quote))
    setSubmitted(false)
    setStatus('')
  }, [quote])

  const rules = currentQuote?.taxSnapshot ?? taxRulesFor(profile?.taxRegime ?? 'RESICO')
  const calculation = useMemo(() => {
    try {
      return { result: calculateQuote({ taxPersonType: client.taxPersonType, lines }, rules), errors: {} as Record<string, string> }
    } catch (error) {
      return { result: { lines: [], totals: emptyTotals() }, errors: error instanceof DomainValidationError ? error.fieldErrors : {} }
    }
  }, [client.taxPersonType, lines, rules])
  const baseline = currentQuote ? fingerprint(currentQuote.issuedOn, currentQuote.client, editableLines(currentQuote)) : ''
  const isDirty = currentQuote ? fingerprint(issuedOn, client, lines) !== baseline : true

  function updateClient<K extends keyof QuoteClient>(key: K, value: QuoteClient[K]) {
    setClient((current) => ({ ...current, [key]: value }))
  }
  function updateLine(id: string, key: keyof QuoteLineInput, value: string) {
    setLines((current) => current.map((line) => line.id === id ? { ...line, [key]: value } : line))
  }
  function addService(serviceId: string) {
    const service = services.find(({ id }) => id === serviceId)
    if (!service) return
    setLines((current) => [...current, { id: crypto.randomUUID(), sourceServiceId: service.id, description: service.name, quantity: '1', unitPrice: service.defaultUnitPrice }])
  }
  const visibleSuggestions = suggestions.filter(({ client: suggestion }) => !clientSearch.trim() || `${suggestion.name} ${suggestion.rfc ?? ''}`.toLocaleLowerCase('es-MX').includes(clientSearch.trim().toLocaleLowerCase('es-MX')))
  function focusFirstError() {
    queueMicrotask(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
  }

  async function save() {
    setSubmitted(true)
    setStatus('')
    if (!client.name.trim()) { focusFirstError(); return }
    if (Object.keys(calculation.errors).length) { focusFirstError(); return }
    if (!currentQuote && !profile) { setStatus('Completa nombre, RFC y régimen en Mi perfil antes de guardar.'); return }
    try {
      const wasSaved = Boolean(currentQuote)
      const saved = await onSave({ issuedOn, client, lines }, currentQuote?.id)
      setCurrentQuote(saved)
      setIssuedOn(saved.issuedOn)
      setClient(saved.client)
      setLines(editableLines(saved))
      setStatus(wasSaved ? 'Cambios guardados.' : `Presupuesto guardado con el número ${saved.number}.`)
      setSubmitted(false)
      queueMicrotask(() => titleRef.current?.focus())
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No fue posible guardar el presupuesto.')
    }
  }

  async function download() {
    if (!currentQuote) { setStatus('Guarda el presupuesto antes de descargar el PDF.'); return }
    if (!lines.length) { setStatus('Agrega al menos un concepto antes de descargar el PDF.'); return }
    if (isDirty) { setStatus('Guarda los cambios antes de descargar el PDF.'); return }
    setStatus('Preparando PDF…')
    try { await downloadQuotePdf(currentQuote); setStatus('PDF descargado correctamente.') }
    catch (error) { setStatus(error instanceof Error ? error.message : 'No fue posible descargar el PDF.') }
  }
  async function changeStatus(nextStatus: QuoteStatus) {
    if (!currentQuote || isDirty) return
    setStatus('')
    try { const saved = await onStatusChange(currentQuote.id, nextStatus); setCurrentQuote(saved); setStatus('Estado actualizado.') }
    catch (error) { setStatus(error instanceof Error ? error.message : 'No fue posible actualizar el estado.') }
  }

  return (
    <section className="stack" aria-labelledby="quote-editor-title">
      <div>
        <button className="back-link" type="button" onClick={onClose}>← Volver a presupuestos</button>
        <h1 ref={titleRef} tabIndex={-1} id="quote-editor-title">{currentQuote ? `Presupuesto ${currentQuote.number}` : 'Nuevo presupuesto'}</h1>
        {!profile && !currentQuote && <p className="notice">Completa Mi perfil antes de guardar un presupuesto.</p>}
        {currentQuote && <p className="muted">Perfil congelado: {currentQuote.professionalSnapshot.fullName} · RFC {currentQuote.professionalSnapshot.rfc} · régimen {currentQuote.taxSnapshot.taxRegime === 'RESICO' ? 'RESICO' : 'Servicios Profesionales'}.</p>}
        {currentQuote && <label className="status-select">Estado<select value={currentQuote.status ?? 'DRAFT'} disabled={isDirty} onChange={(event) => void changeStatus(event.target.value as QuoteStatus)}><option value="DRAFT">Borrador</option><option value="SENT">Enviado</option><option value="ACCEPTED">Aceptado</option><option value="REJECTED">Rechazado</option></select></label>}
        {currentQuote && isDirty && <p className="notice">Hay cambios sin guardar.</p>}
        {currentQuote && isDirty && <p className="muted">Guarda o descarta los cambios antes de cambiar el estado.</p>}
      </div>
      <section className="card stack" aria-labelledby="quote-data-title">
        <h2 id="quote-data-title">Datos del documento</h2>
        <div className="form-grid two-columns">
          <label>Fecha de emisión<input type="date" value={issuedOn} disabled={Boolean(currentQuote)} onChange={(event) => setIssuedOn(event.target.value)} /></label>
          <label>Fecha de vencimiento<input value={formatCivilDate(currentQuote?.validUntil ?? addCivilDays(issuedOn, 30))} disabled readOnly /></label>
        </div>
      </section>
      <section className="card stack" aria-labelledby="client-title">
        <h2 id="client-title">Cliente</h2>
        {suggestions.length > 0 && <div className="suggestions"><label>Buscar cliente anterior<input value={clientSearch} onChange={(event) => setClientSearch(event.target.value)} placeholder="Nombre o RFC" /></label><div className="suggestion-buttons">{visibleSuggestions.map((suggestion) => <button className="secondary" type="button" key={suggestion.key} onClick={() => setClient(structuredClone(suggestion.client))}>Usar {suggestion.client.name}</button>)}</div></div>}
        <div className="form-grid two-columns">
          <label>Nombre o razón social *<input value={client.name} onChange={(event) => updateClient('name', event.target.value)} aria-invalid={submitted && !client.name.trim()} />{submitted && !client.name.trim() && <span className="error">Escribe el nombre o razón social del cliente.</span>}</label>
          <label>Tipo fiscal<select value={client.taxPersonType} onChange={(event) => updateClient('taxPersonType', event.target.value as TaxPersonType)}><option value="LEGAL_ENTITY">Persona moral</option><option value="INDIVIDUAL">Persona física</option></select></label>
          <label>RFC<input value={client.rfc ?? ''} onChange={(event) => updateClient('rfc', event.target.value)} /></label>
          <label>Correo electrónico<input type="email" value={client.email ?? ''} onChange={(event) => updateClient('email', event.target.value)} /></label>
          <label>Teléfono<input type="tel" value={client.phone ?? ''} onChange={(event) => updateClient('phone', event.target.value)} /></label>
          <label>Domicilio<textarea value={client.address ?? ''} onChange={(event) => updateClient('address', event.target.value)} /></label>
        </div>
      </section>
      <section className="stack" aria-labelledby="lines-title">
        <div className="section-heading"><h2 id="lines-title">Conceptos</h2><button className="secondary" type="button" onClick={() => setLines((current) => [...current, newLine()])}>Agregar concepto</button></div>
        {services.length > 0 && <label>Agregar desde servicios<select defaultValue="" onChange={(event) => { addService(event.target.value); event.target.value = '' }}><option value="">Selecciona un servicio</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name} — {formatMoney(toCents(service.defaultUnitPrice))}</option>)}</select></label>}
        {lines.length === 0 && <p className="card muted">Todavía no hay conceptos. Puedes guardar un borrador vacío, pero necesitarás uno para descargar el PDF.</p>}
        {lines.map((line, index) => {
          const prefix = `lines.${index}`
          const calculated = calculation.result.lines.find(({ id }) => id === line.id)
          return <article className="card line-card stack" key={line.id}>
            <div className="section-heading"><h3>Concepto {index + 1}</h3><button type="button" className="danger" onClick={() => setLines((current) => current.filter(({ id }) => id !== line.id))}>Quitar concepto</button></div>
            <div className="form-grid line-grid">
              <label>Descripción<input value={line.description} onChange={(event) => updateLine(line.id, 'description', event.target.value)} aria-invalid={Boolean(calculation.errors[`${prefix}.description`])} />{calculation.errors[`${prefix}.description`] && <span className="error">{calculation.errors[`${prefix}.description`]}</span>}</label>
              <label>Cantidad<input inputMode="decimal" value={line.quantity} onChange={(event) => updateLine(line.id, 'quantity', event.target.value)} aria-invalid={Boolean(calculation.errors[`${prefix}.quantity`])} />{calculation.errors[`${prefix}.quantity`] && <span className="error">{calculation.errors[`${prefix}.quantity`]}</span>}</label>
              <label>Precio unitario<input inputMode="decimal" value={line.unitPrice} onChange={(event) => updateLine(line.id, 'unitPrice', event.target.value)} aria-invalid={Boolean(calculation.errors[`${prefix}.unitPrice`])} />{calculation.errors[`${prefix}.unitPrice`] && <span className="error">{calculation.errors[`${prefix}.unitPrice`]}</span>}</label>
              <p className="line-amount"><span>Importe</span><strong>{formatMoney(calculated?.amountCents ?? 0)}</strong></p>
            </div>
          </article>
        })}
      </section>
      <section className="card totals" aria-labelledby="totals-title">
        <h2 id="totals-title">Resumen</h2>
        <dl>
          <div><dt>Base</dt><dd>{formatMoney(calculation.result.totals.subtotalCents)}</dd></div><div><dt>IVA (16 %)</dt><dd>{formatMoney(calculation.result.totals.vatCents)}</dd></div><div><dt>ISR retenido</dt><dd>− {formatMoney(calculation.result.totals.incomeTaxWithholdingCents)}</dd></div><div><dt>IVA retenido</dt><dd>− {formatMoney(calculation.result.totals.vatWithholdingCents)}</dd></div><div className="grand-total"><dt>Total</dt><dd data-testid="total">{formatMoney(calculation.result.totals.totalCents)}</dd></div>
        </dl>
        <p className="tax-explanation">{client.taxPersonType === 'INDIVIDUAL' ? 'A una persona física no aplica retenciones de ISR ni de IVA.' : `Una persona moral retiene IVA e ISR. La tasa de ISR corresponde al régimen ${rules.taxRegime === 'PROFESSIONAL_SERVICES' ? 'Servicios Profesionales' : 'RESICO'} del profesional.`}</p>
      </section>
      <div className="actions"><button className="primary" type="button" onClick={() => void save()}>{currentQuote ? 'Guardar cambios' : 'Guardar presupuesto'}</button><button className="secondary" type="button" onClick={() => void download()}>Descargar PDF</button></div>
      <p aria-live="polite" className={status.includes('guardad') || status.includes('correctamente') ? 'success' : 'error'}>{status}</p>
    </section>
  )
}
