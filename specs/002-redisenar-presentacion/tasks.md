---

description: "Lista de tareas para RediseÃ±ar presentaciÃ³n"
---

# Tasks: RediseÃ±ar presentaciÃ³n

**Input**: Artefactos de diseÃ±o de `/specs/002-redisenar-presentacion/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ y quickstart.md

**Tests**: Se incluyen porque los criterios de Ã©xito y la guÃ­a de validaciÃ³n exigen pruebas unitarias y E2E para estados, navegaciÃ³n, diseÃ±o responsive y PDF.

**Organization**: Las tareas se agrupan por historia de usuario para permitir incrementos verificables.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede realizarse en paralelo al trabajar archivos distintos y no tener dependencias pendientes.
- **[Story]**: Historia de usuario a la que pertenece la tarea.

## Phase 1: Setup

**Purpose**: Preparar una base de presentaciÃ³n compartida sin cambiar la arquitectura existente.

- [X] T001 Create the shared design-token module and CSS-variable application with the FR-027 semantic palette in src/presentation/design-tokens.ts and src/main.tsx
- [X] T002 [P] Create quote status types, legacy default handling, effective-status derivation, and FR-033 inclusive civil-date boundary rules in src/domain/types.ts and src/domain/quote-status.ts
- [X] T003 [P] Add unit coverage for legacy, current, expired, accepted, rejected, and date-boundary quote statuses in tests/unit/quote-status.test.ts

---

## Phase 2: Foundational

**Purpose**: Make local quote status persistence and shared presentation primitives available to all stories.

**âš ï¸ CRITICAL**: Complete this phase before implementing the user stories.

- [X] T004 Extend local quote creation and add the isolated setQuoteStatus operation with recoverable storage errors in src/persistence/database.ts
- [X] T005 [P] Add persistence coverage for new default statuses, legacy records without status, and state-only updates in tests/e2e/quote-status.spec.ts
- [X] T006 Refactor global presentation primitives to consume design tokens and provide FR-029 distinguishable input, FR-031 interaction states, error, button, card, table, total, and status-badge styles with FR-018--FR-020 thresholds in src/styles.css

**Checkpoint**: Estado local y sistema visual compartido disponibles; las historias pueden comenzar.

---

## Phase 3: User Story 1 - Orientarse desde el inicio (Priority: P1) ðŸŽ¯ MVP

**Goal**: Abrir Inicio en la raÃ­z, consultar el resumen por estado y desplazarse entre las cuatro secciones sin usar AtrÃ¡s.

**Independent Test**: Con datos vacÃ­os y con presupuestos de varios estados, abrir la raÃ­z y comprobar los cinco recuentos, los cuatro destinos y la indicaciÃ³n de destino activo.

### Tests for User Story 1

- [X] T007 [P] [US1] Add root-landing, FR-042 empty and legacy summary, status-count, active-navigation, and keyboard-focus E2E coverage in tests/e2e/home-and-navigation.spec.ts

### Implementation for User Story 1

- [X] T008 [P] [US1] Create the read-only activity summary and four-section entry view with FR-040 loading markers, welcome, ordered section access, and explanatory text for all five status counters in src/features/home/HomeView.tsx
- [X] T009 [US1] Extend section state, default root destination, shared navigation ordered Inicio/Presupuestos/Servicios/Mi perfil, FR-040 loading state, section-title focus, and editor-origin focus restoration in src/App.tsx
- [X] T010 [US1] Add FR-036 two-by-two mobile and four-item desktop navigation, non-color active-state indicator, and activity-summary layout rules in src/styles.css
- [X] T011 [US1] Update root-entry assumptions in existing E2E helpers and journeys in tests/e2e/critical-flow.spec.ts, tests/e2e/persistence-and-numbering.spec.ts, tests/e2e/pdf.spec.ts, tests/e2e/reuse.spec.ts, and tests/e2e/localization.spec.ts

**Checkpoint**: Inicio y navegaciÃ³n comÃºn funcionan independientemente con datos existentes y nuevos.

---

## Phase 4: User Story 2 - Trabajar con una interfaz profesional (Priority: P1)

**Goal**: Aplicar una identidad visual sobria, accesible y consistente a todas las secciones, y permitir clasificar presupuestos sin alterar cÃ¡lculos ni datos comerciales.

**Independent Test**: Recorrer las cuatro secciones, editar un presupuesto y cambiar sus estados; comprobar persistencia tras recargar, etiquetas no cromÃ¡ticas, contenido a 320 px y zoom 200 %.

### Tests for User Story 2

- [X] T012 [P] [US2] Extend mobile and zoom E2E assertions for FR-037 keyboard order, FR-039 viewport bounds, four-item navigation, visible controls, inputs, status labels, tables, totals, and documented FR-018--FR-020 visual thresholds in tests/e2e/mobile.spec.ts
- [X] T013 [P] [US2] Add E2E coverage for state selection, reload persistence, expiration precedence, and unchanged quote totals in tests/e2e/quote-status.spec.ts

### Implementation for User Story 2

- [X] T014 [US2] Add FR-032 canonical textual effective-status badges, optional supplementary icons, and state-change controls for saved quotes in src/features/quotes/QuoteListView.tsx
- [X] T015 [US2] Disable saved-quote status changes while the editor is dirty and show the FR-021 save-or-discard explanation in src/features/quotes/QuoteEditorView.tsx
- [X] T016 [US2] Wire refreshed quote state, the setQuoteStatus persistence operation, and FR-035/FR-043 recovery through src/App.tsx
- [X] T017 [US2] Apply the FR-028 shared hierarchy, spacing, FR-038 responsive table/card treatment, and distinguishable state styles across src/styles.css, src/features/profile/ProfileView.tsx, and src/features/services/ServiceCatalogView.tsx
- [X] T018 [US2] Audit and revise all presentation strings to Spanish of Mexico while preserving MXN, RFC, IVA, ISR, persona fÃ­sica, and persona moral in src/App.tsx, src/features/home/HomeView.tsx, src/features/quotes/QuoteListView.tsx, src/features/quotes/QuoteEditorView.tsx, src/features/profile/ProfileView.tsx, and src/features/services/ServiceCatalogView.tsx

**Checkpoint**: Todas las pantallas comparten identidad visual y los cinco estados se comunican y persisten conforme al contrato local.

---

## Phase 5: User Story 3 - Enviar un PDF coherente con la aplicaciÃ³n (Priority: P2)

**Goal**: Generar el mismo PDF completo de siempre con la identidad visual compartida y una etiqueta de estado legible.

**Independent Test**: Descargar presupuestos de distintos estados, con y sin logo y con 50 lÃ­neas; comprobar estado, datos, cabeceras repetidas y totales finales.

### Tests for User Story 3

- [X] T019 [P] [US3] Add PDF E2E assertions for the effective status text and regressions for empty, dirty, logo, no-logo, and long documents in tests/e2e/pdf.spec.ts
- [X] T020 [P] [US3] Add document-definition unit coverage for shared tokens and final-state expiration precedence in tests/unit/build-quote-document.test.ts

### Implementation for User Story 3

- [X] T021 [US3] Apply all FR-030 shared tokens and FR-041 PDF order with visible effective status beside the quote number while preserving table pagination and totals in src/pdf/build-quote-document.ts
- [X] T022 [US3] Pass the effective status to local PDF generation without changing download, dirty-state, or filename behavior in src/pdf/download-quote-pdf.ts and src/features/quotes/QuoteEditorView.tsx

**Checkpoint**: El PDF transmite la identidad visual de la aplicaciÃ³n y conserva todas las reglas del documento actual.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar la integridad de la feature y cerrar documentaciÃ³n de aceptaciÃ³n.

- [X] T023 [P] Reconcile Spanish-of-Mexico terminology and requirements references across specs/002-redisenar-presentacion/spec.md, plan.md, and contracts/ui-flow.md
- [X] T024 [P] Review and resolve applicable reviewer-owned UX requirements-quality findings in specs/002-redisenar-presentacion/checklists/ux.md
- [X] T025 Run the full automated quality gate defined in package.json and record any resolved regressions in specs/002-redisenar-presentacion/quickstart.md
- [ ] T026 Run the manual acceptance scenarios for root navigation, state counts, responsive keyboard use, and short/long PDFs in specs/002-redisenar-presentacion/quickstart.md
- [ ] T027 Run the SC-004 usability validation with 10 independent participants and an anonymous record of identifier, completion result, time, and observed confusion in specs/002-redisenar-presentacion/quickstart.md
- [ ] T028 Record SC-010 screenshots at 320 px and desktop, the FR-018--FR-020 contrast, typography, and spacing review, and the ten-PDF review in specs/002-redisenar-presentacion/quickstart.md
- [X] T029 Add FR/SC traceability for every manual validation route in specs/002-redisenar-presentacion/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias.
- **Foundational (Phase 2)**: Depende de T001--T003 y bloquea las historias.
- **US1 (Phase 3)**: Depende de la fase 2; entrega el MVP.
- **US2 (Phase 4)**: Depende de la fase 2 y se integra con la navegaciÃ³n y resumen de US1.
- **US3 (Phase 5)**: Depende de la clasificaciÃ³n de estado de la fase 2 y de los tokens de presentaciÃ³n; puede desarrollarse tras la fase 2, pero se integra despuÃ©s de US2.
- **Polish (Phase 6)**: Depende de las historias deseadas completas.

### User Story Dependencies

- **US1 (P1)**: Inicio y navegaciÃ³n; no requiere los controles visuales de cambio de estado de US2.
- **US2 (P1)**: Requiere los datos y clasificaciÃ³n de estado fundacionales y actualiza el resumen de US1 al cambiar un estado.
- **US3 (P2)**: Requiere la clasificaciÃ³n fundacional; solo comparte tokens y estado efectivo con US1/US2.

### Parallel Opportunities

- T002 y T003 se pueden realizar en paralelo con T001.
- T005 puede realizarse en paralelo con T006 despuÃ©s de T004.
- T007 y T008 se pueden realizar en paralelo tras la fase fundacional.
- T012 y T013 son paralelas; T019 y T020 son paralelas.
- T023 y T024 son paralelas al comienzo de la fase final.

## Parallel Example: User Story 2

```text
Task: "Add responsive UX coverage in tests/e2e/mobile.spec.ts"
Task: "Add quote-state coverage in tests/e2e/quote-status.spec.ts"
```

## Implementation Strategy

### MVP First

1. Completar fases 1 y 2.
2. Completar T007--T011 para entregar Inicio y navegaciÃ³n comÃºn.
3. Ejecutar la prueba independiente de US1 antes de continuar.

### Incremental Delivery

1. AÃ±adir US1 para orientar y resumir actividad.
2. AÃ±adir US2 para aplicar la identidad y los estados locales.
3. AÃ±adir US3 para alinear el PDF.
4. Ejecutar las comprobaciones automÃ¡ticas y manuales de cierre.

## Notes

- Todas las tareas siguen el formato de checklist requerido y contienen rutas concretas.
- Las tareas [P] evitan editar el mismo archivo de forma concurrente.
- Los cambios de estado son la Ãºnica evoluciÃ³n de persistencia autorizada; no se cambia cÃ¡lculo, nÃºmero, cliente ni snapshots.
