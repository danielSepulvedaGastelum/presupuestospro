import { useEffect, useRef, useState } from 'react'
import type { CatalogService, ProfessionalProfile, QuoteDraft, QuoteStatus, SavedQuote } from './domain/types'
import { deriveClientSuggestions } from './domain/client-suggestions'
import HomeView from './features/home/HomeView'
import ProfileView from './features/profile/ProfileView'
import QuoteEditorView from './features/quotes/QuoteEditorView'
import QuoteListView from './features/quotes/QuoteListView'
import ServiceCatalogView from './features/services/ServiceCatalogView'
import { getProfile, listQuotes, listServices, saveNewQuote, setQuoteStatus, updateQuote } from './persistence/database'

type Section = 'home' | 'quotes' | 'services' | 'profile'
const destinations: Array<[Section, string]> = [['home', 'Inicio'], ['quotes', 'Presupuestos'], ['services', 'Servicios'], ['profile', 'Mi perfil']]

export default function App() {
  const [section, setSection] = useState<Section>('home')
  const [profile, setProfile] = useState<ProfessionalProfile>()
  const [quotes, setQuotes] = useState<SavedQuote[]>([])
  const [services, setServices] = useState<CatalogService[]>([])
  const [selectedQuote, setSelectedQuote] = useState<SavedQuote>()
  const [editingQuote, setEditingQuote] = useState(false)
  const [storageMessage, setStorageMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const editorOrigin = useRef<HTMLElement | null>(null)

  useEffect(() => { Promise.all([getProfile(), listQuotes(), listServices()]).then(([savedProfile, savedQuotes, savedServices]) => { setProfile(savedProfile); setQuotes(savedQuotes); setServices(savedServices) }).catch((error: Error) => setStorageMessage(error.message)).finally(() => setLoading(false)) }, [])
  function focusTitle() { queueMicrotask(() => document.querySelector<HTMLElement>('main h1')?.focus()) }
  function navigate(next: Section) { setSection(next); setEditingQuote(false); setSelectedQuote(undefined); focusTitle() }
  function closeEditor() { setEditingQuote(false); setSelectedQuote(undefined); queueMicrotask(() => editorOrigin.current?.focus()) }
  function openNew(trigger: HTMLElement) { editorOrigin.current = trigger; setSelectedQuote(undefined); setEditingQuote(true) }
  function openQuote(quote: SavedQuote, trigger: HTMLElement) { editorOrigin.current = trigger; setSelectedQuote(quote); setEditingQuote(true) }
  async function refreshQuotes() { setQuotes(await listQuotes()) }
  async function persistQuote(draft: QuoteDraft, quoteId?: string): Promise<SavedQuote> { const saved = quoteId ? await updateQuote(quoteId, draft) : await saveNewQuote(draft); setSelectedQuote(saved); await refreshQuotes(); return saved }
  async function changeStatus(id: string, status: QuoteStatus): Promise<SavedQuote> { const saved = await setQuoteStatus(id, status); setSelectedQuote((current) => current?.id === id ? saved : current); await refreshQuotes(); return saved }

  return <div className="app-shell">
    <header className="site-header"><button className="brand" type="button" aria-label="Ir a Inicio" onClick={() => navigate('home')}>PresupuestosPro</button><p>Tus datos se guardan solo en este navegador y en esta dirección web.</p></header>
    <nav aria-label="Navegación principal" className="main-nav">{destinations.map(([key, label]) => <button key={key} aria-current={section === key ? 'page' : undefined} onClick={() => navigate(key)}>{label}</button>)}</nav>
    <main tabIndex={-1}>
      {storageMessage && <p role="alert" className="error">{storageMessage}</p>}
      {section === 'home' && <HomeView quotes={quotes} loading={loading} />}
      {section === 'profile' && <ProfileView profile={profile} onSaved={setProfile} />}
      {section === 'services' && <ServiceCatalogView services={services} onChanged={async () => setServices(await listServices())} />}
      {section === 'quotes' && (editingQuote ? <QuoteEditorView profile={profile} quote={selectedQuote} services={services} suggestions={deriveClientSuggestions(quotes)} onClose={closeEditor} onSave={persistQuote} onStatusChange={changeStatus} /> : <div className="stack">{!profile && <div className="notice"><p>Primero completa tu perfil para poder guardar.</p><button className="primary" type="button" onClick={(event) => { editorOrigin.current = event.currentTarget; navigate('profile') }}>Completar mi perfil</button></div>}<QuoteListView quotes={quotes} onCreate={openNew} onOpen={openQuote} onStatusChange={changeStatus} /></div>)}
    </main>
  </div>
}
