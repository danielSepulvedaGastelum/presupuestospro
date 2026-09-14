import type { SavedQuote } from '../../domain/types'
import { effectiveQuoteStatus, quoteStatusDescription, quoteStatusLabel, type EffectiveQuoteStatus } from '../../domain/quote-status'

const statuses: EffectiveQuoteStatus[] = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']

export default function HomeView({ quotes, loading }: { quotes: SavedQuote[]; loading: boolean }) {
  if (loading) return <section className="stack" aria-live="polite"><h1 tabIndex={-1}>Inicio</h1><p className="card muted">Cargando tu información…</p></section>
  const counts = Object.fromEntries(statuses.map((status) => [status, 0])) as Record<EffectiveQuoteStatus, number>
  let invalid = false
  quotes.forEach((quote) => { try { counts[effectiveQuoteStatus(quote)] += 1 } catch { invalid = true } })
  return <section className="stack" aria-labelledby="home-title">
    <div><h1 tabIndex={-1} id="home-title">Inicio</h1><p className="muted">Organiza tus presupuestos profesionales desde un solo lugar.</p></div>
    {invalid && <p className="notice" role="alert">Hay un presupuesto con un estado no reconocido. Sus demás datos siguen disponibles.</p>}
    <section aria-label="Resumen de actividad" className="status-summary"><h2>Resumen de actividad</h2><div className="status-grid">{statuses.map((status) => <article className={`status-card status-${status.toLowerCase()}`} key={status}><strong>{quoteStatusLabel[status]}</strong><span className="status-count">{counts[status]}</span><span>{quoteStatusDescription[status]}</span></article>)}</div></section>
    <section className="card stack" aria-label="Accesos rápidos"><h2>Accesos rápidos</h2><p className="muted">Usa la navegación para crear presupuestos, administrar servicios o actualizar tu perfil.</p></section>
  </section>
}
