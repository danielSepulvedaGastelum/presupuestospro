import { useState } from 'react'
import { formatCivilDate } from '../../domain/dates'
import { formatMoney } from '../../domain/money'
import { effectiveQuoteStatus, quoteStatusLabel } from '../../domain/quote-status'
import type { QuoteStatus, SavedQuote } from '../../domain/types'
import { downloadQuotePdf } from '../../pdf/download-quote-pdf'

interface QuoteListViewProps { quotes: SavedQuote[]; onCreate(trigger: HTMLElement): void; onOpen(quote: SavedQuote, trigger: HTMLElement): void; onStatusChange(id: string, status: QuoteStatus): Promise<SavedQuote> }

export default function QuoteListView({ quotes, onCreate, onOpen, onStatusChange }: QuoteListViewProps) {
  const [message, setMessage] = useState('')
  async function download(quote: SavedQuote) { setMessage(''); try { await downloadQuotePdf(quote); setMessage(`PDF ${quote.number} descargado correctamente.`) } catch (error) { setMessage(error instanceof Error ? error.message : 'No fue posible descargar el PDF.') } }
  async function change(quote: SavedQuote, status: QuoteStatus) { setMessage(''); try { await onStatusChange(quote.id, status); setMessage('Estado actualizado.') } catch (error) { setMessage(error instanceof Error ? error.message : 'No fue posible actualizar el estado.') } }
  return <section className="stack" aria-labelledby="quotes-title">
    <div className="section-heading"><div><h1 tabIndex={-1} id="quotes-title">Presupuestos</h1><p className="muted">Crea y conserva documentos profesionales en MXN.</p></div><button className="primary" type="button" onClick={(event) => onCreate(event.currentTarget)}>Crear presupuesto</button></div>
    {quotes.length === 0 ? <div className="card empty-state"><h2>Tu lista está vacía</h2><p>El primer presupuesto recibirá un número al guardarlo.</p></div> : <div className="quote-list">{quotes.map((quote) => {
      let statusText = 'Estado no disponible'; let invalid = false
      try { statusText = quoteStatusLabel[effectiveQuoteStatus(quote)] } catch { invalid = true }
      return <article className="card quote-row" key={quote.id}>
        <div><h2>{quote.number}</h2><p>{quote.client.name}</p><span className={`status-badge status-${statusText.toLowerCase()}`}>{statusText}</span>{invalid && <p className="error">El estado guardado no es válido.</p>}</div>
        <dl><div><dt>Emisión</dt><dd>{formatCivilDate(quote.issuedOn)}</dd></div><div><dt>Total</dt><dd>{formatMoney(quote.totals.totalCents)}</dd></div><div><dt>Actualizado</dt><dd>{new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(quote.updatedAt))}</dd></div></dl>
        <div className="actions"><label className="status-select">Estado<select aria-label={`Estado de ${quote.number}`} value={quote.status ?? 'DRAFT'} disabled={invalid} onChange={(event) => void change(quote, event.target.value as QuoteStatus)}><option value="DRAFT">Borrador</option><option value="SENT">Enviado</option><option value="ACCEPTED">Aceptado</option><option value="REJECTED">Rechazado</option></select></label><button className="secondary" type="button" aria-label={`Abrir/editar ${quote.number}`} onClick={(event) => onOpen(quote, event.currentTarget)}>Abrir/editar</button><button className="secondary" type="button" aria-label={`Descargar PDF ${quote.number}`} onClick={() => void download(quote)}>Descargar PDF</button></div>
      </article>
    })}</div>}
    <p aria-live="polite" className={message.includes('actualizado') || message.includes('correctamente') ? 'success' : 'error'}>{message}</p>
  </section>
}
