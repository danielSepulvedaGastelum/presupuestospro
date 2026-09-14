# Tasks: PresupuestosPro v0

**Input**: Design documents from `/specs/001-presupuestos-profesionales/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: La especificación y el plan solicitan verificación con Vitest, Playwright y recorridos manuales reproducibles. En cada fase, las pruebas se escriben primero y deben fallar antes de implementar el comportamiento correspondiente.

**Organization**: Las tareas se agrupan por historia de usuario para conservar trazabilidad e incrementos comprobables. La secuencia técnica aprobada en `plan.md` adelanta US3 a US2 porque el PDF solo puede generarse desde un presupuesto guardado y numerado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque trabaja en archivos distintos y no depende de otra tarea incompleta del mismo grupo.
- **[Story]**: Historia de usuario cubierta por la tarea (`US1`, `US2`, `US3` o `US4`).
- Todas las tareas incluyen una ruta exacta de archivo o directorio.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar la SPA, sus dependencias y la infraestructura de pruebas.

- [X] T001 Inicializar React 19, Vite, TypeScript, `idb`, `decimal.js`, `pdfmake`, Vitest y Playwright; definir scripts `dev`, `build`, `preview`, `typecheck`, `test:unit`, `test:e2e` y `check`, haciendo que `check` ejecute tipos, unitarias, build y E2E, en `package.json` y generar `package-lock.json`
- [X] T002 [P] Configurar TypeScript estricto para código de navegador, JSX de React y tipos de pruebas en `tsconfig.json`
- [X] T003 [P] Configurar Vite, React, Vitest y la salida estática `dist/` en `vite.config.ts`
- [X] T004 [P] Crear el documento raíz con `lang="es-MX"`, viewport móvil y punto de montaje de React en `index.html`
- [X] T005 [P] Configurar proyectos Playwright para Chromium de escritorio, Chromium móvil y WebKit móvil, con datos aislados por prueba, en `playwright.config.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establecer tipos, utilidades deterministas, almacenamiento local y shell compartido antes de construir historias.

**⚠️ CRITICAL**: Ninguna historia de usuario comienza hasta completar esta fase.

- [X] T006 [P] Escribir pruebas fallidas de normalización decimal, redondeo `ROUND_HALF_UP`, conversión a centavos y formato `es-MX`/`MXN` en `tests/unit/money.test.ts`
- [X] T007 [P] Escribir pruebas fallidas para fechas civiles `AAAA-MM-DD`, fecha local actual y vencimiento a 30 días sin conversión UTC en `tests/unit/dates.test.ts`
- [X] T008 [P] Definir `PerfilProfesional`, `ServicioCatalogo`, `Presupuesto`, cliente, línea, snapshots, totales, secuencia y errores tipados conforme al modelo en `src/domain/types.ts`
- [X] T009 Implementar parseo decimal finito, validación, redondeo a centavos y presentación `MXN` usando `decimal.js` en `src/domain/money.ts`
- [X] T010 Implementar fechas civiles, año de secuencia y suma de 30 días naturales en `src/domain/dates.ts`
- [X] T011 [P] Crear y versionar la base IndexedDB con almacenes `profile`, `services`, `quotes` y `annualSequences`, incluidos sus índices mínimos, en `src/persistence/database.ts`
- [X] T012 Crear la entrada React y el shell sin login con navegación accesible entre Presupuestos, Servicios y Mi perfil en `src/main.tsx` y `src/App.tsx`
- [X] T013 [P] Crear estilos globales mobile-first, tokens visuales, foco visible, controles táctiles de 44 px y contenedor sin desbordamiento desde 320 px en `src/styles.css`

**Checkpoint**: La aplicación arranca, las utilidades base pasan sus pruebas y IndexedDB queda listo para operaciones de negocio.

---

## Phase 3: User Story 1 - Crear un presupuesto correcto (Priority: P1) 🎯 MVP

**Goal**: Capturar perfil, cliente y líneas manuales y mostrar de inmediato importes fiscales exactos en MXN.

**Independent Test**: Configurar un perfil, crear líneas por MXN 2,000.00, alternar régimen y tipo de cliente y comprobar los totales MXN 2,081.67, MXN 1,906.67 y MXN 2,320.00; editar o quitar líneas debe recalcular sin acción adicional.

### Tests for User Story 1

- [X] T014 [P] [US1] Escribir pruebas fallidas para importes de línea, suma de líneas redondeadas, IVA, ambas tasas ISR, retención de dos tercios de IVA, persona física y entradas inválidas en `tests/unit/quote-calculator.test.ts`
- [X] T015 [P] [US1] Escribir el recorrido Playwright fallido de perfil obligatorio, presupuesto manual de dos líneas, recálculo reactivo, explicación visible de por qué se aplican o no retenciones y errores junto al campo en `tests/e2e/critical-flow.spec.ts`

### Implementation for User Story 1

- [X] T016 [P] [US1] Implementar validación de líneas y `calculateQuote` con tasas actuales o congeladas y resultados enteros en centavos en `src/domain/quote-calculator.ts`
- [X] T017 [P] [US1] Implementar lectura y guardado del perfil único `current` con validación de nombre, RFC y régimen, sin modificar presupuestos existentes, en `src/persistence/database.ts`
- [X] T018 [US1] Implementar el formulario de nombre, RFC, contacto y régimen con validación en español que impida guardar si faltan nombre, RFC o régimen, persistencia y aviso de alcance local en `src/features/profile/ProfileView.tsx`
- [X] T019 [US1] Implementar el editor de presupuesto nuevo con fecha propuesta, cliente, líneas manuales en tarjetas, `inputmode="decimal"`, validación, resumen fiscal reactivo y explicación visible que relacione tipo de cliente, régimen y retenciones en `src/features/quotes/QuoteEditorView.tsx`
- [X] T020 [US1] Conectar carga de perfil, cambio de régimen previo al primer guardado y navegación hacia el editor en `src/App.tsx`

**Checkpoint**: US1 funciona y se prueba sin numeración, PDF ni datos reutilizables; este es el MVP calculador.

---

## Phase 4: User Story 3 - Numerar y conservar presupuestos (Priority: P3; prerequisite for US2)

**Goal**: Asignar una vez números anuales únicos, congelar perfil/tasas y reabrir presupuestos editables desde IndexedDB.

**Independent Test**: Configurar un perfil con logo, guardar presupuestos de 2026 y 2027, cerrar y reabrir la aplicación y comprobar secuencias independientes, datos conservados, campos inmutables y snapshots de perfil, logo, régimen y tasas que no cambian al editar el perfil global.

### Tests for User Story 3

- [X] T021 [P] [US3] Escribir pruebas fallidas del formato con mínimo tres dígitos, transición de `AAAA-999` a `AAAA-1000`, reinicio anual y preservación del número asignado en `tests/unit/numbering.test.ts`
- [X] T022 [P] [US3] Escribir pruebas Playwright fallidas de primer guardado transaccional con perfil completo, recarga, edición con mismo número, años independientes, congelación de nombre, RFC, contacto, logo, régimen y tasas, y ausencia de eliminar/archivar en `tests/e2e/persistence-and-numbering.spec.ts`

### Implementation for User Story 3

- [X] T023 [P] [US3] Implementar formato, parseo y siguiente consecutivo anual sin reutilización en `src/domain/numbering.ts`
- [X] T024 [US3] Implementar `saveNewQuote`, `updateQuote`, `getQuote` y `listQuotes` con validación de nombre, RFC y régimen del perfil vigente, transacción atómica de secuencia/presupuesto, snapshots del primer guardado y manejo recuperable de IndexedDB en `src/persistence/database.ts`
- [X] T025 [P] [US3] Añadir selección, validación, normalización local a PNG/JPEG, vista previa, reemplazo y retiro de logo en `src/features/profile/ProfileView.tsx`
- [X] T026 [P] [US3] Incorporar guardado inicial, actualización posterior, estado base para detectar cambios pendientes y bloqueo de número, emisión, vencimiento, perfil, logo y tasas congeladas en `src/features/quotes/QuoteEditorView.tsx`
- [X] T027 [P] [US3] Implementar la lista local con número, cliente, emisión, total, actualización y única acción Abrir/editar en `src/features/quotes/QuoteListView.tsx`
- [X] T028 [US3] Cargar presupuestos al iniciar, abrir existentes, crear nuevos y refrescar lista/editor después de cada guardado en `src/App.tsx`

**Checkpoint**: US1 y US3 forman un producto persistente; perfil, logo, régimen y tasas quedan congelados en cada presupuesto. Los presupuestos vacíos pueden guardarse, pero todavía no se ofrece PDF.

---

## Phase 5: User Story 2 - Descargar un PDF profesional (Priority: P2)

**Goal**: Descargar desde un presupuesto guardado un PDF profesional, repetible y multipágina que usa sus snapshots.

**Independent Test**: Guardar un presupuesto con logo y líneas, descargarlo, editarlo y comprobar que la descarga queda bloqueada hasta guardar; después volver a descargarlo con los cambios y el mismo número. Validar también presupuesto vacío, ausencia de logo, persona física y 50 líneas.

### Tests for User Story 2

- [X] T029 [US2] Escribir pruebas Playwright fallidas para bloqueo del presupuesto vacío y de cambios sin guardar, nombre `{number}.pdf`, firma PDF válida y descarga repetible después de guardar una edición en casos corto, sin logo, persona física y 50 líneas en `tests/e2e/pdf.spec.ts`

### Implementation for User Story 2

- [X] T030 [US2] Construir la definición pdfmake desde el presupuesto guardado con snapshot profesional, ambas partes, fechas, tabla con encabezado repetible, totales posteriores y leyenda sin retenciones en `src/pdf/build-quote-document.ts`
- [X] T031 [US2] Registrar Roboto localmente e implementar la importación dinámica de pdfmake y descarga `{number}.pdf` sin modificar el presupuesto en `src/pdf/download-quote-pdf.ts`
- [X] T032 [US2] Integrar Descargar PDF en editor y lista, bloquear cero líneas o cambios pendientes, pedir que se guarde antes de descargar, validar campos obligatorios del snapshot y anunciar éxito o error recuperable en `src/features/quotes/QuoteEditorView.tsx` y `src/features/quotes/QuoteListView.tsx`

**Checkpoint**: US2 puede validarse sobre cualquier presupuesto guardado de US3 y no crea versiones ni cambia el número.

---

## Phase 6: User Story 4 - Reutilizar información habitual (Priority: P4)

**Goal**: Administrar servicios reutilizables y copiar servicios o el cliente más reciente a presupuestos nuevos sin vínculos vivos.

**Independent Test**: Crear, editar y eliminar un servicio después de copiarlo a una línea; guardar variantes de un cliente y comprobar que un presupuesto nuevo recibe una copia de la variante más reciente sin alterar fuentes históricas.

### Tests for User Story 4

- [X] T033 [P] [US4] Escribir pruebas fallidas de claves por RFC, claves por nombre normalizado y tipo fiscal, separación de RFC distintos, selección por `updatedAt` y copias independientes en `tests/unit/client-suggestions.test.ts`
- [X] T034 [P] [US4] Escribir el recorrido Playwright fallido de CRUD de servicios, copia editable a línea, sugerencia única de cliente reciente y preservación de presupuestos fuente en `tests/e2e/reuse.spec.ts`

### Implementation for User Story 4

- [X] T035 [P] [US4] Implementar agrupación y orden de sugerencias derivadas únicamente de presupuestos guardados en `src/domain/client-suggestions.ts`
- [X] T036 [P] [US4] Implementar `createService`, `updateService`, `deleteService` y `listServices` con validación y marcas temporales en `src/persistence/database.ts`
- [X] T037 [US4] Implementar formulario y lista de servicios con precio MXN, edición y confirmación de borrado que explique la conservación de líneas copiadas en `src/features/services/ServiceCatalogView.tsx`
- [X] T038 [US4] Después de T032, integrar selector opcional de servicio que copie descripción, precio y `sourceServiceId` a una línea editable en `src/features/quotes/QuoteEditorView.tsx`
- [X] T039 [US4] Después de T032, integrar búsqueda de clientes previos y copia editable de la sugerencia más reciente en `src/features/quotes/QuoteEditorView.tsx`
- [X] T040 [US4] Cargar y refrescar catálogo y sugerencias después de cambios y guardados, sin crear catálogo de clientes, en `src/App.tsx`

**Checkpoint**: Las cuatro historias están implementadas; las copias permanecen independientes de sus orígenes.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cerrar experiencia móvil, accesibilidad, resiliencia local, rendimiento y evidencia de salida.

- [X] T041 [P] Escribir pruebas Playwright fallidas a 320/360 px y zoom 200 % para ausencia de desplazamiento horizontal, navegación alcanzable, orden de foco, foco en errores y controles táctiles en `tests/e2e/mobile.spec.ts`
- [X] T042 [P] Escribir una prueba Playwright inicialmente fallida que recorra todos los textos visibles y el PDF en español de México, incluida la ausencia de `NIF`, `autónomo` e `IRPF`, en `tests/e2e/localization.spec.ts`
- [X] T043 Ajustar tarjetas de conceptos, navegación, formularios, resumen, estados de foco y reflujo móvil en `src/styles.css`, `src/App.tsx`, `src/features/profile/ProfileView.tsx`, `src/features/services/ServiceCatalogView.tsx`, `src/features/quotes/QuoteListView.tsx` y `src/features/quotes/QuoteEditorView.tsx`
- [X] T044 Añadir mensajes accesibles para guardado/descarga, aviso de datos ligados al navegador y errores recuperables de cuota o almacenamiento en `src/App.tsx` y `src/persistence/database.ts`
- [X] T045 [P] Verificar que pdfmake y sus fuentes quedan fuera del paquete inicial y corregir únicamente regresiones medidas de carga en `vite.config.ts` y `src/pdf/download-quote-pdf.ts`
- [X] T046 Corregir cualquier incumplimiento de español de México detectado por T042 en `src/App.tsx`, `src/features/profile/ProfileView.tsx`, `src/features/services/ServiceCatalogView.tsx`, `src/features/quotes/QuoteListView.tsx`, `src/features/quotes/QuoteEditorView.tsx` y `src/pdf/build-quote-document.ts`
- [X] T047 Ejecutar `npm run check` y registrar resultados de tipos, unitarias, build y E2E en `specs/001-presupuestos-profesionales/validation.md`
- [ ] T048 Generar `dist/`, publicarlo en un origen HTTPS estático definitivo sin Functions/Workers y registrar URL, persistencia por origen y la mediana LCP de tres mediciones móviles consecutivas en `specs/001-presupuestos-profesionales/validation.md`
- [ ] T049 Ejecutar las cinco validaciones manuales de `quickstart.md` sobre la entrega, incluidos teclado, el protocolo de 10 usuarios con evidencia anónima, Android, iPhone y PDF multipágina, y registrar evidencias en `specs/001-presupuestos-profesionales/validation.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; comienza de inmediato.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de Foundational y entrega el MVP calculador.
- **US3 (Phase 4)**: Depende de US1 porque persiste el editor y sus cálculos; habilita los presupuestos guardados que consume PDF.
- **US2 (Phase 5)**: Depende de US3 para descargar únicamente documentos guardados, numerados y con snapshots.
- **US4 (Phase 6)**: Depende de US3 para derivar clientes de presupuestos guardados. T033-T037 pueden avanzar en paralelo con US2, pero T038 y T039 comienzan después de T032 porque comparten `QuoteEditorView.tsx`.
- **Polish (Phase 7)**: Depende de todas las historias incluidas en la entrega.

### User Story Dependency Graph

```text
Setup → Foundational → US1 (P1/MVP) → US3 (P3/persistencia)
                                      ├─→ US2 (P2/PDF) ───────────────┐
                                      └─→ US4 base (T033-T037) ───────┤
US2 + US4 base → US4 integración (T038-T040) → Polish → Publicación
```

La prioridad de negocio sigue siendo P1, P2, P3 y P4. El orden técnico US1 → US3 → US2 evita duplicar una persistencia provisional; la base de US4 puede avanzar junto con US2, pero su integración en el editor espera a T032.

### Within Each User Story

- Escribir las pruebas de la fase y confirmar que fallan por el comportamiento aún ausente.
- Implementar reglas puras antes de las operaciones de persistencia.
- Implementar persistencia antes de conectar vistas que dependen de ella.
- Completar integración y ejecutar la prueba independiente antes de avanzar.

### Parallel Opportunities

- En Setup, T002-T005 pueden ejecutarse en paralelo después de acordar T001.
- En Foundational, T006-T008 pueden comenzar en paralelo; después T009, T010 y T011 trabajan en archivos separados.
- En US1, T014 y T015 pueden escribirse en paralelo; después T016 y T017 pueden implementarse en paralelo.
- En US3, T021 y T022 pueden escribirse en paralelo; después T023 y T025 pueden implementarse en paralelo, T024 sigue a T023, T026 y T027 siguen a T024 en paralelo y T028 cierra la integración.
- En US2, T029 precede a T030; T031 y T032 siguen sus dependencias de generación e integración, sin paralelismo interno útil.
- En US4, T033 y T034 pueden escribirse en paralelo; después T035 y T036 pueden implementarse en paralelo.
- Tras US3, US2 y las tareas T033-T037 de US4 pueden avanzar en paralelo; las integraciones T038 y T039 se realizan después de T032 para evitar cambios simultáneos en `QuoteEditorView.tsx`.
- En Polish, T041 y T042 pueden escribirse en paralelo; después T043 y T045 pueden avanzar en archivos distintos, T044 integra los mensajes compartidos y T046 cierra la auditoría de idioma antes de T047.

---

## Parallel Execution Examples

### User Story 1

```text
Task T014: "Pruebas fiscales y validación en tests/unit/quote-calculator.test.ts"
Task T015: "Recorrido crítico en tests/e2e/critical-flow.spec.ts"

Después de confirmar ambos fallos:
Task T016: "Cálculo fiscal en src/domain/quote-calculator.ts"
Task T017: "Persistencia de perfil en src/persistence/database.ts"
```

### User Story 3

```text
Task T021: "Pruebas de numeración en tests/unit/numbering.test.ts"
Task T022: "Pruebas de persistencia en tests/e2e/persistence-and-numbering.spec.ts"

Después de confirmar ambos fallos:
Task T023: "Numeración anual en src/domain/numbering.ts"
Task T025: "Logo local en src/features/profile/ProfileView.tsx"

Después de T023:
Task T024: "Guardado transaccional en src/persistence/database.ts"

Después de T024:
Task T026: "Ciclo guardado en src/features/quotes/QuoteEditorView.tsx"
Task T027: "Lista guardada en src/features/quotes/QuoteListView.tsx"

Después de integrar esas tareas:
Task T028: "Carga y navegación persistente en src/App.tsx"
```

### User Story 2

```text
Después de escribir T029:
Task T030: "Definición PDF en src/pdf/build-quote-document.ts"
```

### User Story 4

```text
Task T033: "Pruebas de sugerencias en tests/unit/client-suggestions.test.ts"
Task T034: "Recorrido de reutilización en tests/e2e/reuse.spec.ts"

Después de confirmar ambos fallos:
Task T035: "Agrupación de clientes en src/domain/client-suggestions.ts"
Task T036: "CRUD de servicios en src/persistence/database.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup.
2. Completar Foundational.
3. Completar US1.
4. Detenerse y ejecutar la prueba independiente de US1.
5. Demostrar el cálculo correcto como MVP antes de añadir persistencia o PDF.

### Incremental Delivery

1. Setup + Foundational → base ejecutable y comprobada.
2. US1 → calculador fiscal reactivo en MXN (MVP).
3. US3 → documentos numerados y persistentes.
4. US2 y la base de US4 → PDF profesional y reutilización en paralelo; integrar US4 en el editor después de T032.
5. Polish → evidencia completa, build estático y publicación bajo el origen definitivo.

### Validation Discipline

- Cada tarea de pruebas precede a su implementación y debe demostrar un fallo relevante, no un error de configuración.
- Cada checkpoint se valida desde la interfaz según `specs/001-presupuestos-profesionales/quickstart.md`.
- No se añaden backend, autenticación, nube, catálogo de clientes, historial, eliminación/archivo, factura, correo, PWA ni otras capacidades fuera de la especificación.
- Un cambio fiscal exige actualizar y aprobar la especificación antes de modificar las tasas congeladas.
