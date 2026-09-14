# Implementation Plan: PresupuestosPro v0

**Branch**: `001-presupuestos-profesionales` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: especificación aprobada en `specs/001-presupuestos-profesionales/spec.md`, incluidos perfil obligatorio, numeración anual extensible, descarga solo desde cambios guardados, experiencia móvil/accesible, publicación HTTPS y persistencia local sin cuentas ni nube.

## Summary

PresupuestosPro v0 será una sola aplicación web estática, en español de México y adaptable desde 320 px. Permitirá configurar el perfil y catálogo, crear y conservar presupuestos localmente, calcular impuestos con precisión decimal y descargar un PDF multipágina profesional. TypeScript, React y Vite mantienen coordinados formularios y cálculos sin introducir backend; IndexedDB conserva los datos en el mismo navegador; `pdfmake` genera el documento en el dispositivo.

### Decisiones importantes en lenguaje de negocio

| Decisión | Beneficio para la v0 | Límite consciente |
|---|---|---|
| Sitio estático, sin servidor | Se puede publicar en minutos y no hay infraestructura que operar. | No hay cuentas, sincronización ni acceso desde otro equipo. |
| Datos en IndexedDB del navegador | La información no sale del dispositivo y admite logo/documentos sin depender de la nube. | Los datos pertenecen a ese navegador y dominio; borrar su almacenamiento puede perderlos. |
| React sin router, gestor global ni kit visual | Reduce estados inconsistentes en un formulario dinámico manteniendo pocas piezas. | Las tres áreas comparten una sola aplicación y no se crean rutas públicas independientes. |
| Aritmética decimal dedicada | Evita diferencias de centavos que dañan la confianza en el presupuesto. | Las tasas quedan fijas a los casos aprobados; cualquier regla nueva requiere cambiar la spec. |
| PDF declarativo generado localmente | Tablas largas, acentos, encabezados y totales se resuelven sin un servicio externo. | El módulo es más pesado y se carga solo al descargar para proteger la experiencia móvil. |
| Hosting estático con HTTPS | Salida online rápida y portable entre proveedores. | Debe elegirse una URL estable antes de acumular datos locales. |

## Technical Context

**Language/Version**: TypeScript 5.x; Node.js 24 LTS solo para herramientas de desarrollo y build; JavaScript de navegador como runtime.

**Primary Dependencies**: React 19 + React DOM; Vite; `idb` para IndexedDB; `decimal.js` para redondeo fiscal; `pdfmake` 0.3.x para PDF. CSS e `Intl` nativos. El módulo PDF se importa dinámicamente.

**Storage**: IndexedDB local con cuatro almacenes (`profile`, `services`, `quotes`, `annualSequences`). Sin API, base de datos cloud, cookies de sesión ni analítica.

**Testing**: Vitest para dominio puro; Playwright en Chromium de escritorio, perfil móvil Chromium y WebKit móvil para flujos reales, IndexedDB, descarga y auditoría de textos es-MX; validación manual reproducible de PDF, teclado, dispositivos físicos y protocolo de usabilidad con evidencia anónima.

**Target Platform**: hosting web estático HTTPS; Chrome Android actual, Safari iOS actual y una versión mayor anterior, y navegadores de escritorio modernos. Diseño base a 320 CSS px.

**Project Type**: SPA cliente, un solo paquete y una sola salida `dist/`; Node no se ejecuta en producción.

**Performance Goals**: mediana LCP objetivo ≤ 2.5 s en tres mediciones consecutivas con el perfil móvil documentado sobre la URL definitiva; edición y recálculo percibidos como inmediatos; `pdfmake` y sus fuentes fuera del paquete inicial. No se añade optimización que no responda a una medición real.

**Constraints**: español de México; MXN con dos decimales; redondeo `ROUND_HALF_UP`; perfil con nombre, RFC y régimen antes de guardar; consecutivo anual con mínimo tres dígitos y crecimiento después de 999; PDF solo desde la última versión guardada; sin cuenta, backend, nube, correo, factura, PWA ni historial; fechas civiles sin conversión UTC; almacenamiento aislado por origen; flujo completo de primer uso en menos de cinco minutos.

**Scale/Scope**: una persona por perfil de navegador. La validación cubre al menos 20 presupuestos en dos años, la transición unitaria `999 → 1000`, cinco servicios, diez registros persistidos y un PDF de 50 o más líneas. No se diseña para colaboración, multitenencia o volumen empresarial.

## Constitution Check

*Puerta previa a la investigación: debe aprobarse antes de Phase 0 y volver a comprobarse después de Phase 1.*

| Principio | Resultado previo | Evidencia del plan |
|---|---|---|
| I. Simplicidad ante todo | PASS | Un proyecto cliente, cinco paquetes runtime agrupados en cuatro capacidades justificadas y hosting estático. Se excluyen backend, router, estado global, UI kit, PWA y capas especulativas. |
| II. Español de México y MXN | PASS | `lang="es-MX"`, textos directos en es-MX, `Intl.NumberFormat` con MXN y PDF con etiqueta MXN. |
| III. Cero alcance fantasma | PASS | Los requisitos FR-039 a FR-041 y SC-009 a SC-011 incorporan explícitamente móvil, accesibilidad, rendimiento y publicación; los contratos niegan login, nube, facturas, correo, historial, archivo y borrado. |
| IV. Verificable por persona no técnica | PASS | [quickstart.md](./quickstart.md) traduce los once criterios a recorridos visibles, revisión de PDF, medición móvil y protocolo de usabilidad reproducible. |
| V. Datos con respeto | PASS | Solo se capturan los campos de la spec; datos y logo permanecen locales; no hay tokens, secretos ni analítica. |

**Resultado de puerta previa**: PASS. No hay violaciones que justificar ni incógnitas sin resolver.

### Revisión posterior al diseño

| Principio | Resultado posterior | Comprobación Phase 1 |
|---|---|---|
| I. Simplicidad ante todo | PASS | [data-model.md](./data-model.md) embebe cliente, líneas y snapshots en el presupuesto; solo existen cuatro almacenes y no hay catálogo de clientes. |
| II. Español de México y MXN | PASS | [ui-flow.md](./contracts/ui-flow.md) fija términos, mensajes, explicación fiscal y formato; la validación incluye una auditoría explícita de interfaz y PDF. |
| III. Cero alcance fantasma | PASS | [domain-operations.md](./contracts/domain-operations.md) enumera las únicas operaciones y las que deliberadamente no existen. |
| IV. Verificable por persona no técnica | PASS | La guía cubre cálculo, secuencia extensible, persistencia, snapshots, cambios sin guardar, reutilización, PDF multipágina, móvil, rendimiento y prueba de usabilidad. |
| V. Datos con respeto | PASS | IndexedDB y PDF funcionan sin red; el logo es un Blob local y no existen secretos de runtime. |

**Resultado posterior**: PASS. Phase 1 no introduce excepciones ni complejidad fuera de la spec.

## Project Structure

### Documentation (this feature)

```text
specs/001-presupuestos-profesionales/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── validation.md              # Se completa durante las tareas de cierre
├── contracts/
│   ├── domain-operations.md
│   └── ui-flow.md
└── tasks.md                 # Se generará con $speckit-tasks; no en esta fase
```

### Source Code (repository root)

```text
index.html
package.json
tsconfig.json
vite.config.ts
playwright.config.ts
src/
├── main.tsx
├── App.tsx
├── styles.css
├── domain/
│   ├── types.ts
│   ├── money.ts
│   ├── quote-calculator.ts
│   ├── numbering.ts
│   ├── dates.ts
│   └── client-suggestions.ts
├── persistence/
│   └── database.ts
├── pdf/
│   ├── build-quote-document.ts
│   └── download-quote-pdf.ts
└── features/
    ├── profile/ProfileView.tsx
    ├── services/ServiceCatalogView.tsx
    └── quotes/
        ├── QuoteListView.tsx
        └── QuoteEditorView.tsx
tests/
├── unit/
│   ├── money.test.ts
│   ├── quote-calculator.test.ts
│   ├── numbering.test.ts
│   ├── dates.test.ts
│   └── client-suggestions.test.ts
└── e2e/
    ├── critical-flow.spec.ts
    ├── persistence-and-numbering.spec.ts
    ├── mobile.spec.ts
    ├── pdf.spec.ts
    ├── reuse.spec.ts
    └── localization.spec.ts
```

**Structure Decision**: un solo frontend concentra lo necesario para entregar valor. `domain/` contiene reglas fiscales puras sin navegador; `persistence/` encapsula la única base local; `pdf/` transforma un presupuesto ya calculado; `features/` organiza únicamente las tres áreas visibles. No hay carpetas de backend, API, autenticación, infraestructura cloud ni abstracciones de repositorio duplicadas.

## Enfoque de construcción

1. **Fundamento publicable**: Vite, shell responsive, navegación entre las tres áreas, estilo es-MX y build estático.
2. **Valor P1**: perfil obligatorio, cliente, líneas, cálculo decimal, explicación visible de retenciones y errores comprensibles; primero se cierran los tres ejemplos fiscales exactos.
3. **Persistencia necesaria para el documento**: IndexedDB, logo local, primer guardado transaccional, secuencia anual extensible, snapshot de perfil/tasas y reapertura. Aunque la historia de negocio es P3, técnicamente precede al PDF porque este debe usar un presupuesto guardado y numerado.
4. **Valor P2**: plantilla `pdfmake`, texto Unicode, tabla multipágina, retenciones y descarga repetible con el mismo número; si hay cambios pendientes, se exige guardarlos antes de generar el documento.
5. **Valor P4**: CRUD de servicios y sugerencias de cliente derivadas de presupuestos, sin crear nuevas entidades.
6. **Salida online**: pruebas críticas y de idioma, validación manual en móvil y PDF, protocolo de diez usuarios, build `dist/`, Direct Upload estático bajo el dominio definitivo y tres mediciones móviles de LCP.

Cada paso termina en una comprobación visible descrita en [quickstart.md](./quickstart.md); no se agrega capacidad futura “por si acaso”.

## Artefactos de diseño

- [research.md](./research.md): decisiones, alternativas y riesgos; no quedan decisiones técnicas abiertas.
- [data-model.md](./data-model.md): entidades, validaciones, cálculo, snapshots, secuencia y transiciones.
- [domain-operations.md](./contracts/domain-operations.md): contrato local de operaciones, errores y garantías.
- [ui-flow.md](./contracts/ui-flow.md): flujo observable, experiencia móvil y contenido PDF.
- [quickstart.md](./quickstart.md): comandos y recorridos reproducibles para aceptación y publicación.
