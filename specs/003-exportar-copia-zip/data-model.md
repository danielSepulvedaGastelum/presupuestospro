# Data Model: Exportar copia completa en ZIP

## 1. ExportSnapshot

Instantánea inmutable leída en una transacción `readonly` de IndexedDB.

| Campo | Tipo | Reglas |
|---|---|---|
| `capturedAt` | string ISO 8601 | Se fija una vez al comenzar; también alimenta `exportedAt`. |
| `localDate` | `AAAA-MM-DD` | Fecha civil local fijada al comenzar; alimenta el nombre del ZIP. |
| `profile` | `ProfessionalProfile \| null` | `null` si no existe; no se inventan valores. |
| `services` | `CatalogService[]` | Todos los registros, sin filtros. |
| `quotes` | `SavedQuote[]` | Todos los estados y valores guardados, incluidos legados. |
| `annualSequences` | `AnnualSequence[]` | Todos los años disponibles. |

La entidad existe solo en memoria y no se persiste. Sus colecciones se obtienen en la
misma transacción para que escrituras posteriores no alteren ninguna parte de la copia.

## 2. BackupDocumentV1

Representación JSON autónoma descrita en [contracts/export-archive.md](contracts/export-archive.md).

| Campo | Tipo | Reglas |
|---|---|---|
| `format` | literal `presupuestospro-backup` | Identidad estable del formato. |
| `formatVersion` | literal `1` | Versión independiente de la versión de la app. |
| `exportedAt` | string ISO 8601 | Igual al instante fijado en `ExportSnapshot`. |
| `data.profile` | `BackupProfileV1 \| null` | Perfil completo o ausencia explícita. |
| `data.services` | `CatalogService[]` | Valores guardados sin recalcular. |
| `data.quotes` | `SavedQuote[]` serializables | Conserva opcionales ausentes; no completa estados heredados. |
| `data.annualSequences` | `AnnualSequence[]` | Estado completo de numeración. |

### BackupProfileV1 y logo

Todos los campos del perfil se conservan. Si existe logo, su forma JSON es:

| Campo | Tipo | Reglas |
|---|---|---|
| `mimeType` | `image/png \| image/jpeg` | Se conserva exactamente. |
| `width` | entero positivo | Se conserva exactamente. |
| `height` | entero positivo | Se conserva exactamente. |
| `contentBase64` | string Base64 | Decodifica a los mismos bytes del `Uint8Array`. |

`bytes` no aparece en el JSON: `contentBase64` es su representación reversible v1.

## 3. ExportedPdf

| Campo | Tipo | Reglas |
|---|---|---|
| `quoteId` | string | Referencia al presupuesto de la instantánea. |
| `quoteNumber` | string | Identificador presentado al usuario. |
| `filename` | string | `<número> - <cliente-seguro>.pdf`. |
| `content` | `Uint8Array` | Bytes del Blob producido por pdfmake. |

No se persiste. El documento se construye exclusivamente desde `SavedQuote` capturado.

## 4. PdfExportFailure

| Campo | Tipo | Reglas |
|---|---|---|
| `quoteId` | string | Referencia interna para pruebas y trazabilidad local. |
| `quoteNumber` | string | Valor que se muestra y escribe en el reporte. |
| `message` | string | Mensaje no técnico; no incluye stack ni secretos. |

Un fallo se agrega cuando un presupuesto no puede convertirse en PDF. No elimina ni
modifica su registro dentro de `BackupDocumentV1`.

## 5. ExportResult

Unión discriminada que regresa el coordinador a la interfaz:

- `complete`: ZIP descargado, `pdfCount === quoteCount`, sin reporte de errores.
- `partial`: ZIP descargado, `failures.length > 0`, con `errores-exportacion.txt`.
- El error fatal se representa mediante excepción y no produce descarga.

## Relaciones

```text
ExportSnapshot
├── serializa 1 ──> BackupDocumentV1 ──> presupuestospro-datos.json
└── quotes 1..N
    ├── genera 0..1 ──> ExportedPdf
    └── genera 0..1 ──> PdfExportFailure

BackupDocumentV1 + ExportedPdf[] + PdfExportFailure[]
└── forman 1 ──> ExportArchive
```

## Transiciones de estado de la interfaz

```text
idle ── iniciar con datos ──> reading ──> generating-pdfs
                                      └──> building-zip ──> downloading
                                                               ├──> complete ──> idle
                                                               └──> partial  ──> idle
cualquier estado activo ── error fatal ──> failed ── reintentar ──> reading
idle ── iniciar sin presupuestos ──> empty (sin descarga) ──> idle
```

Mientras el estado no sea `idle`, `complete`, `partial`, `failed` o `empty`, la acción
de exportación permanece deshabilitada.
