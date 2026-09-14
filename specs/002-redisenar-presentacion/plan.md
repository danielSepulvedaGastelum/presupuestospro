# Implementation Plan: Rediseñar presentación

**Branch**: `002-redisenar-presentacion` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)

**Input**: Añadir Inicio, navegación común, identidad visual y PDF coherentes, y los estados persistentes aclarados en la especificación.

## Summary

Se ampliará la SPA actual con Inicio como sección predeterminada y navegación de cuatro destinos, sin router ni backend. Los tokens de diseño vivirán en un módulo TypeScript compartido: se aplicarán como variables CSS al documento y se importarán en el generador `pdfmake`. La única evolución persistente autorizada es el estado del presupuesto. Los documentos existentes sin estado se interpretan como Borrador; Caducado se deriva al leer Borrador o Enviado cuyo vencimiento haya pasado. Cálculos, numeración, snapshots y datos de cliente no cambian.

## Technical Context

**Language/Version**: TypeScript 5.x; React 19; JavaScript de navegador en producción; Node.js 24 LTS para desarrollo y build.

**Primary Dependencies**: React 19 + React DOM, Vite, `idb`, `decimal.js` y `pdfmake` 0.3.x. No se añade router, UI kit ni gestor global.

**Storage**: IndexedDB local. Los objetos de `quotes` ganan un `status` opcional compatible con registros anteriores; no hay nuevos almacenes ni índices.

**Testing**: Vitest para funciones puras de estado; Playwright para Inicio, navegación, estado, móvil y PDF; revisión manual de PDF y teclado.

**Target Platform**: SPA estática HTTPS en navegadores modernos de escritorio, Chrome Android y Safari iOS; base desde 320 CSS px.

**Project Type**: SPA cliente, un paquete y salida estática `dist/`.

**Performance Goals**: Mantener mediana LCP móvil <= 2,5 s y no añadir dependencias runtime; conservar carga dinámica del PDF.

**Constraints**: Datos locales sin cuentas ni nube; MXN, cálculos y reglas fiscales inalterados; sin eliminar o archivar presupuestos; controles táctiles >= 44 px; PDF multipágina. Todos los textos usan español de México, incluida la terminología fiscal y monetaria vigente. El diseño debe satisfacer contraste mínimo 4.5:1 para texto y 3:1 para componentes no textuales, escala tipográfica de tres niveles y espaciado basado en 4 px.

**Scale/Scope**: Un perfil local; resumen sobre los presupuestos locales. Pruebas con cinco estados, documentos heredados sin estado y PDF de 50 líneas.

## Constitution Check

| Principio | Resultado previo | Evidencia |
|---|---|---|
| I. Simplicidad ante todo | PASS | Una SPA y dependencias existentes; no hay router, backend ni UI kit. |
| II. Español de México y MXN | PASS | La spec exige español de México, MXN y vocabulario fiscal mexicano en interfaz y PDF. |
| III. Cero alcance fantasma | PASS | Inicio, diseño, PDF y estado local se limitan a FR-001--FR-017. |
| IV. Verificable por persona no técnica | PASS | [quickstart.md](./quickstart.md) describe recorridos visibles. |
| V. Datos con respeto | PASS | El estado se guarda en IndexedDB existente y no se transmite por red. |

**Resultado previo**: PASS.

### Revisión posterior al diseño

| Principio | Resultado posterior | Comprobación |
|---|---|---|
| I | PASS | [research.md](./research.md) conserva una función pura de estado y arquitectura única. |
| II | PASS | [ui-flow.md](./contracts/ui-flow.md) exige español de México y conserva MXN, RFC, IVA e ISR. |
| III | PASS | [quote-status.md](./contracts/quote-status.md) no modela envío real, contratos ni historial. |
| IV | PASS | La guía permite validar desde interfaz y PDF. |
| V | PASS | [data-model.md](./data-model.md) no añade datos personales ni servicios. |

**Resultado posterior**: PASS.

## Project Structure

```text
specs/002-redisenar-presentacion/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── quote-status.md
│   └── ui-flow.md
└── tasks.md

src/
├── App.tsx
├── styles.css
├── presentation/design-tokens.ts
├── domain/
│   ├── types.ts
│   └── quote-status.ts
├── persistence/database.ts
├── pdf/build-quote-document.ts
└── features/
    ├── home/HomeView.tsx
    └── quotes/{QuoteListView,QuoteEditorView}.tsx

tests/
├── unit/quote-status.test.ts
└── e2e/{home-and-navigation,quote-status,mobile,pdf}.spec.ts
```

**Structure Decision**: `App.tsx` conserva carga y navegación local; `HomeView` recibe presupuestos de solo lectura. `quote-status.ts` es la única fuente de las reglas de estado. `design-tokens.ts` es la única fuente de valores de presentación, aplicada como variables CSS y reutilizada por PDF.
