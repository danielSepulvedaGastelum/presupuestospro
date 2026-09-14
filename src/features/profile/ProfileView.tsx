import { useEffect, useRef, useState, type FormEvent } from 'react'
import { DomainValidationError, type LogoAsset, type ProfessionalProfile, type TaxRegime } from '../../domain/types'
import { saveProfile } from '../../persistence/database'

interface ProfileViewProps {
  profile?: ProfessionalProfile
  onSaved(profile: ProfessionalProfile): void
}

export default function ProfileView({ profile, onSaved }: ProfileViewProps) {
  const [fullName, setFullName] = useState(profile?.fullName ?? '')
  const [rfc, setRfc] = useState(profile?.rfc ?? '')
  const [email, setEmail] = useState(profile?.email ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [address, setAddress] = useState(profile?.address ?? '')
  const [taxRegime, setTaxRegime] = useState<TaxRegime | ''>(profile?.taxRegime ?? '')
  const [logo, setLogo] = useState<LogoAsset | undefined>(profile?.logo)
  const [logoPreview, setLogoPreview] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState('')
  const firstInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setFullName(profile?.fullName ?? '')
    setRfc(profile?.rfc ?? '')
    setEmail(profile?.email ?? '')
    setPhone(profile?.phone ?? '')
    setAddress(profile?.address ?? '')
    setTaxRegime(profile?.taxRegime ?? '')
    setLogo(profile?.logo)
  }, [profile])

  useEffect(() => {
    if (!logo) { setLogoPreview(''); return }
    const url = URL.createObjectURL(new Blob([logo.bytes], { type: logo.mimeType }))
    setLogoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [logo])

  async function chooseLogo(file?: File) {
    if (!file) return
    setStatus('')
    try {
      const inputUrl = URL.createObjectURL(file)
      const image = new Image()
      const loaded = new Promise<void>((resolve, reject) => {
        image.onload = () => resolve()
        image.onerror = () => reject(new Error('No se pudo leer la imagen.'))
      })
      image.src = inputUrl
      await loaded
      URL.revokeObjectURL(inputUrl)
      const maxSide = 800
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
      const width = Math.max(1, Math.round(image.naturalWidth * scale))
      const height = Math.max(1, Math.round(image.naturalHeight * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')?.drawImage(image, 0, 0, width, height)
      const mimeType: LogoAsset['mimeType'] = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/png'
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, .9))
      if (!blob) throw new Error('No se pudo preparar el logo.')
      setLogo({ mimeType, bytes: new Uint8Array(await blob.arrayBuffer()), width, height })
    } catch {
      setStatus('Elige una imagen PNG o JPEG que el navegador pueda abrir.')
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setStatus('')
    setErrors({})
    try {
      const saved = await saveProfile({ fullName, rfc, email, phone, address, taxRegime: taxRegime || undefined, logo })
      onSaved(saved)
      setStatus('Perfil guardado. Se usará en presupuestos nuevos; los ya guardados conservarán sus datos.')
    } catch (error) {
      if (error instanceof DomainValidationError) {
        setErrors(error.fieldErrors)
        queueMicrotask(() => firstInput.current?.focus())
      } else setStatus(error instanceof Error ? error.message : 'No fue posible guardar el perfil.')
    }
  }

  return (
    <section aria-labelledby="profile-title" className="stack">
      <div>
        <h1 id="profile-title">Mi perfil</h1>
        <p className="muted">Estos datos identifican al profesional que emite cada presupuesto.</p>
      </div>
      <form className="card stack" onSubmit={submit} noValidate>
        <p><strong>Los campos con * son obligatorios.</strong></p>
        <div className="form-grid two-columns">
          <label>Nombre completo *
            <input ref={firstInput} value={fullName} onChange={(event) => setFullName(event.target.value)} aria-invalid={Boolean(errors.fullName)} aria-describedby={errors.fullName ? 'fullName-error' : undefined} />
            {errors.fullName && <span className="error" id="fullName-error">{errors.fullName}</span>}
          </label>
          <label>RFC *
            <input value={rfc} onChange={(event) => setRfc(event.target.value)} autoCapitalize="characters" aria-invalid={Boolean(errors.rfc)} />
            {errors.rfc && <span className="error">{errors.rfc}</span>}
          </label>
          <label>Régimen fiscal *
            <select value={taxRegime} onChange={(event) => setTaxRegime(event.target.value as TaxRegime | '')} aria-invalid={Boolean(errors.taxRegime)}>
              <option value="">Selecciona una opción</option>
              <option value="RESICO">RESICO</option>
              <option value="PROFESSIONAL_SERVICES">Servicios Profesionales</option>
            </select>
            {errors.taxRegime && <span className="error">{errors.taxRegime}</span>}
          </label>
          <label>Correo electrónico
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>Teléfono
            <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label>Domicilio
            <textarea value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
          <div className="stack logo-field">
            <label>Logo (opcional)
              <input type="file" accept="image/png,image/jpeg" onChange={(event) => void chooseLogo(event.target.files?.[0])} />
            </label>
            {logoPreview && <img className="logo-preview" src={logoPreview} alt="Vista previa del logo" />}
            {logo && <button className="secondary" type="button" onClick={() => setLogo(undefined)}>Quitar logo</button>}
          </div>
        </div>
        <div className="actions"><button className="primary" type="submit">Guardar perfil</button></div>
        <p aria-live="polite" className={status.startsWith('Perfil guardado') ? 'success' : 'error'}>{status}</p>
      </form>
    </section>
  )
}
