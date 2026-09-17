# Implementation Plan: Exportar copia completa en ZIP

**Branch**: `003-exportar-copia-zip` | **Date**: 2026-09-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-exportar-copia-zip/spec.md`

## Summary

Añadir a la lista de presupuestos una exportación local que toma una instantánea
consistente de los cuatro almacenes de IndexedDB, serializa todos los datos en un JSON
versionado, genera cada PDF con el constructor existente y descarga un solo ZIP. La
generación tolera fallos individuales de PDF, agrega `errores-exportacion.txt` cuando
corresponde y mantiene un indicador animado y accesible durante todo el proceso.

## Technical Context

**Language/Version**: TypeScript 5.9 estricto sobre Node.js 24 LTS para desarrollo y build

**Primary Dependencies**: React 19, `idb` 8, `pdfmake` 0.3.x, `decimal.js` 10 y una nueva dependencia `fflate` cargada dinámicamente

**Storage**: IndexedDB `presupuestospro` v1; lectura coordinada de `profile`, `services`, `quotes` y `annualSequences`

**Testing**: Vitest 3 para reglas puras y Playwright 1.55 en Chromium escritorio/móvil y WebKit móvil

**Target Platform**: SPA estática para navegadores modernos desde 320 px, sin servidor

**Project Type**: Aplicación web SPA de un solo proyecto

**Performance Goals**: Mostrar el indicador en menos de un segundo; completar o informar error para 1–200 presupuestos; intentar todos los registros por encima de 200 sin truncarlos

**Constraints**: Procesamiento y descarga totalmente locales; una sola descarga; MXN; fechas civiles locales; sin recalcular datos guardados; controles de al menos 44 px; sin igualdad binaria obligatoria entre PDF individual y PDF exportado

**Scale/Scope**: Cuatro almacenes locales, un perfil opcional, un catálogo, numeraciones anuales y todos los presupuestos; 200 documentos como capacidad mínima garantizada

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación previa | Evaluación posterior al diseño |
|---|---|---|
| I. Simplicidad ante todo | PASS: un coordinador de exportación reutiliza persistencia y PDF existentes; solo se agrega una dependencia especializada. | PASS: no hay backend, workers propios, cola persistente ni abstracciones especulativas. |
| II. Español de México y MXN | PASS: mensajes, nombres y documentos conservan el idioma y moneda vigentes. | PASS: los contratos fijan nombres comprensibles y no transforman importes. |
| III. Cero alcance fantasma | PASS: el diseño se limita a exportar; no importa, cifra, sincroniza ni envía datos. | PASS: los artefactos no incorporan restauración ni servicios externos. |
| IV. Verificable por persona no técnica | PASS: ZIP, contenido, progreso y fallos se observan desde la aplicación. | PASS: `quickstart.md` ofrece comprobaciones manuales reproducibles. |
| V. Datos del usuario con respeto | PASS: solo se leen datos existentes y no se solicitan secretos. | PASS: todo permanece local y los objetos URL temporales se revocan. |

No existen violaciones de la constitución ni excepciones que justificar.

## Project Structure

### Documentation (this feature)

```text
specs/003-exportar-copia-zip/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── export-archive.md
└── tasks.md              # generado posteriormente por $speckit-tasks
```

### Source Code (repository root)

```text
src/
├── domain/
│   ├── export-backup.ts          # tipos y serialización pura del formato v1
│   └── export-filenames.ts       # nombres seguros, deterministas y únicos
├── persistence/
│   └── database.ts               # lectura transaccional de la instantánea completa
├── pdf/
│   ├── build-quote-document.ts   # constructor compartido sin cambios de reglas
│   ├── create-quote-pdf.ts       # blob reutilizable para descarga individual y ZIP
│   └── download-quote-pdf.ts
├── export/
│   └── export-all-quotes.ts      # orquestación, ZIP, fallos parciales y descarga
├── features/quotes/
│   └── QuoteListView.tsx         # acción, bloqueo, progreso y resultados
└── styles.css                         # indicador animado y preferencia reduced-motion

tests/
├── unit/
│   ├── export-backup.test.ts
│   └── export-filenames.test.ts
└── e2e/
    └── export-all.spec.ts
```

**Structure Decision**: Se conserva la organización vigente por capas. Las reglas puras
del formato y nombres viven en `domain`; la instantánea pertenece a `persistence`; la
creación binaria de PDF queda en `pdf`; y un módulo `export` coordina los componentes sin
acoplar la vista a IndexedDB, pdfmake o fflate.

## Design

### Flujo de exportación

1. `QuoteListView` rechaza la lista vacía, marca la operación activa y anuncia el estado mediante una región viva.
2. `readExportSnapshot()` abre una sola transacción `readonly` sobre los cuatro almacenes y lanza todas las lecturas antes de esperar `transaction.done`.
3. La instantánea se clona/serializa inmediatamente; el logo se transforma de `Uint8Array` a Base64 sin cambiar ningún otro valor.
4. Cada presupuesto se procesa secuencialmente para limitar picos de trabajo. `createQuotePdfBlob()` reutiliza `buildQuoteDocument()` y las mismas validaciones de la descarga individual.
5. Un fallo de PDF se captura por presupuesto; no detiene la cola. Se conservan el número omitido y un mensaje no técnico.
6. Se importa `fflate` solo al necesitarlo. El JSON y el TXT se comprimen; los PDF se agregan con nivel 0 porque ya son documentos comprimidos.
7. Se crea un `Blob` `application/zip`, se inicia una descarga mediante una URL temporal y se revoca la URL.
8. La vista presenta éxito o advertencia. El estado activo se libera también ante error fatal.

### Consistencia y fallos

- La frontera de instantánea es la transacción IndexedDB, no el arreglo `quotes` que React mantiene en memoria.
- El JSON se construye antes de generar PDF y es obligatorio; cualquier fallo suyo aborta la descarga.
- Los fallos individuales de PDF producen un resultado parcial válido; un fallo de ZIP o descarga produce cero descargas.
- No se agrega límite artificial por encima de 200. La operación sigue siendo de mejor esfuerzo conforme a memoria y capacidades del navegador.
- La animación es indeterminada, porque pdfmake no expone progreso fiable por documento; el texto puede mostrar `Generando PDF X de N`.

### Accesibilidad

- El botón queda deshabilitado durante la operación y mantiene un nombre accesible estable.
- El estado usa `role="status"`/`aria-live="polite"`; el error fatal y la advertencia final usan `role="alert"`.
- La animación visual respeta `prefers-reduced-motion: reduce` sin ocultar el texto de estado.
- El control conserva el mínimo táctil de 44 px y funciona desde 320 px.

### Fase final: verificación y mantenimiento

1. Ejecutar `npm run check` y corregir cualquier regresión de tipos, pruebas unitarias, build o pruebas E2E.
2. Completar la comprobación manual reproducible de `quickstart.md`, incluidos ZIP completo, fallo parcial, consistencia entre pestañas, accesibilidad y viewport de 320 px.
3. Actualizar `AGENTS.md` con las decisiones de diseño y convenciones nuevas de esta feature, una línea por decisión, con referencia a la spec (p. ej. `[003] ...`). No incluir entradas por incluir; asegurar siempre que sea información transversal y relevante para el proyecto que puedan aprovechar futuras features.

## Complexity Tracking

No aplica: el diseño supera todos los gates constitucionales.
