import { useEffect, useRef, useState, type FormEvent } from 'react'
import { formatMoney, toCents } from '../../domain/money'
import { DomainValidationError, type CatalogService } from '../../domain/types'
import { createService, deleteService, updateService } from '../../persistence/database'

interface Props { services: CatalogService[]; onChanged(): Promise<void> }

export default function ServiceCatalogView({ services, onChanged }: Props) {
  const [editing, setEditing] = useState<CatalogService>()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('0')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState('')
  const [pendingDelete, setPendingDelete] = useState<CatalogService>()
  const nameInput = useRef<HTMLInputElement>(null)
  useEffect(() => { setName(editing?.name ?? ''); setPrice(editing?.defaultUnitPrice ?? '0'); setErrors({}) }, [editing])

  async function submit(event: FormEvent) {
    event.preventDefault(); setErrors({}); setStatus('')
    try {
      if (editing) await updateService(editing.id, { name, defaultUnitPrice: price })
      else await createService({ name, defaultUnitPrice: price })
      setEditing(undefined); setName(''); setPrice('0'); await onChanged(); setStatus('Servicio guardado.')
    } catch (error) {
      if (error instanceof DomainValidationError) { setErrors(error.fieldErrors); queueMicrotask(() => nameInput.current?.focus()) }
      setStatus(error instanceof Error ? error.message : 'No fue posible guardar el servicio.')
    }
  }
  async function confirmDelete() {
    if (!pendingDelete) return
    try { await deleteService(pendingDelete.id); setPendingDelete(undefined); await onChanged(); setStatus('Servicio eliminado. Los presupuestos existentes conservaron sus conceptos.') }
    catch (error) { setStatus(error instanceof Error ? error.message : 'No fue posible eliminar el servicio.') }
  }

  return <section className="stack" aria-labelledby="services-title">
    <div><h1 tabIndex={-1} id="services-title">Servicios</h1><p className="muted">Guarda plantillas para capturar conceptos con menos escritura.</p></div>
    <form className="card stack" onSubmit={submit} noValidate>
      <h2>{editing ? 'Editar servicio' : 'Nuevo servicio'}</h2>
      <div className="form-grid two-columns">
        <label>Nombre del servicio<input ref={nameInput} value={name} onChange={(event) => setName(event.target.value)} aria-invalid={Boolean(errors.serviceName)} />{errors.serviceName && <span className="error">{errors.serviceName}</span>}</label>
        <label>Precio predeterminado (MXN)<input inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} aria-invalid={Boolean(errors.defaultUnitPrice)} />{errors.defaultUnitPrice && <span className="error">{errors.defaultUnitPrice}</span>}</label>
      </div>
      <div className="actions"><button className="primary" type="submit">Guardar servicio</button>{editing && <button className="secondary" type="button" onClick={() => setEditing(undefined)}>Cancelar edición</button>}</div>
    </form>
    {services.length === 0 ? <p className="card muted">Aún no hay servicios. Siempre puedes escribir conceptos manualmente.</p> : <div className="service-list">{services.map((service) => <article className="card service-row" key={service.id}><div><h2>{service.name}</h2><p>{formatMoney(toCents(service.defaultUnitPrice))}</p></div><div className="actions"><button className="secondary" type="button" aria-label={`Editar ${service.name}`} onClick={() => setEditing(service)}>Editar</button><button className="danger" type="button" aria-label={`Eliminar ${service.name}`} onClick={() => setPendingDelete(service)}>Eliminar</button></div></article>)}</div>}
    {pendingDelete && <div className="confirm-panel" role="alertdialog" aria-labelledby="delete-title"><div className="card stack"><h2 id="delete-title">¿Eliminar {pendingDelete.name}?</h2><p>Se quitará del catálogo. Los presupuestos existentes no cambiarán porque sus conceptos son copias independientes.</p><div className="actions"><button className="danger" type="button" onClick={() => void confirmDelete()}>Confirmar eliminación</button><button className="secondary" type="button" onClick={() => setPendingDelete(undefined)}>Cancelar</button></div></div></div>}
    <p aria-live="polite" className={status.includes('guardado') || status.includes('eliminado') ? 'success' : 'error'}>{status}</p>
  </section>
}

