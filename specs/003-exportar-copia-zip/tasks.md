# Tasks: Exportar copia completa en ZIP

**Input**: Design documents from `/specs/003-exportar-copia-zip/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/export-archive.md, quickstart.md

**Tests**: Se incluyen pruebas Vitest y Playwright porque la especificación define escenarios de prueba y las convenciones del proyecto exigen pruebas de dominio y flujos visibles.

**Organization**: Las tareas se agrupan por historia para entregar y validar cada incremento por prioridad.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede ejecutarse en paralelo porque trabaja en archivos distintos y no depende de una tarea incompleta.
- **[Story]**: Historia de usuario cubierta (`US1`, `US2` o `US3`).
- Todas las tareas indican rutas exactas.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar la única dependencia nueva y la estructura prevista por el plan.

- [X] T001 Instalar `fflate` como dependencia de producción y actualizar `package.json` y `package-lock.json`
- [X] T002 Crear el directorio y módulo base de coordinación de exportación en `src/export/export-all-quotes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Construir los componentes compartidos que bloquean las tres historias: instantánea consistente, formato JSON v1, nombres seguros y creación reutilizable de PDF.

**⚠️ CRITICAL**: Ninguna historia puede completarse hasta terminar esta fase.

- [X] T003 [P] Escribir pruebas unitarias fallidas del documento de copia v1, ausencia de opcionales y conversión Base64 reversible del logo en `tests/unit/export-backup.test.ts`
- [X] T004 [P] Escribir pruebas unitarias fallidas de sanitización, nombres reservados, sustituto `Cliente` y patrón único de PDF en `tests/unit/export-filenames.test.ts`
- [X] T005 Implementar tipos `ExportSnapshot` y `BackupDocumentV1`, serialización sin recálculo y conversión reversible del logo en `src/domain/export-backup.ts`
- [X] T006 Implementar nombres deterministas y seguros para ZIP y PDF con fecha civil local en `src/domain/export-filenames.ts`
- [X] T007 Añadir `readExportSnapshot()` con una sola transacción `readonly` sobre `profile`, `services`, `quotes` y `annualSequences` en `src/persistence/database.ts`
- [X] T008 Extraer `createQuotePdfBlob()` para reutilizar carga, validación y construcción de pdfmake en `src/pdf/create-quote-pdf.ts` y adaptar `src/pdf/download-quote-pdf.ts` para usarla
- [X] T009 Ejecutar `npm run test:unit` y `npm run typecheck` y corregir la infraestructura compartida en `src/domain/export-backup.ts`, `src/domain/export-filenames.ts`, `src/persistence/database.ts` y `src/pdf/create-quote-pdf.ts`

**Checkpoint**: La aplicación puede obtener una instantánea inmutable, serializarla y producir blobs PDF con las mismas reglas de la descarga individual.

---

## Phase 3: User Story 1 - Descargar una copia completa (Priority: P1) 🎯 MVP

**Goal**: Descargar mediante una sola acción un ZIP fechado con un PDF por presupuesto y `presupuestospro-datos.json`, sin modificar los datos guardados.

**Independent Test**: Guardar tres presupuestos, pulsar **Exportar todo (.zip)** y comprobar una sola descarga `presupuestospro-copia-AAAA-MM-DD.zip` con tres PDF y `presupuestospro-datos.json`; con cero presupuestos, comprobar que no hay descarga y aparece un aviso.

### Tests for User Story 1

- [X] T010 [P] [US1] Escribir la prueba E2E fallida de lista vacía, descarga única completa, nombre del ZIP y entradas esperadas en `tests/e2e/export-all.spec.ts`
- [ ] T011 [P] [US1] Ampliar la prueba de equivalencia visual y monetaria entre PDF individual y PDF exportado, incluido el total `$2,320.00`, en `tests/e2e/pdf.spec.ts`

### Implementation for User Story 1

- [X] T012 [US1] Implementar en `src/export/export-all-quotes.ts` la lectura de instantánea, serialización UTF-8, generación secuencial de PDF, importación dinámica de `fflate`, ZIP con PDF sin recompresión y una sola descarga con URL revocada
- [X] T013 [US1] Añadir la acción visible `Exportar todo (.zip)`, el rechazo de lista vacía y el manejo de éxito o error fatal en `src/features/quotes/QuoteListView.tsx`
- [ ] T014 [US1] Ejecutar las pruebas de `tests/e2e/export-all.spec.ts` y `tests/e2e/pdf.spec.ts` y corregir el flujo P1 en `src/export/export-all-quotes.ts` y `src/features/quotes/QuoteListView.tsx`

**Checkpoint**: US1 entrega el MVP completo y puede demostrarse sin implementar todavía los mensajes detallados de progreso o fallos parciales.

---

## Phase 4: User Story 2 - Conservar una copia restaurable de los datos (Priority: P2)

**Goal**: Garantizar que el JSON v1 contiene una representación fiel y autocontenida de perfil, logo, catálogo, presupuestos y numeraciones capturados en el mismo instante lógico.

**Independent Test**: Exportar un perfil con logo, servicios, presupuestos y numeraciones; inspeccionar el JSON y verificar identificador, versión, hora, bytes Base64, opcionales ausentes y valores guardados sin recálculo, incluso si otra pestaña guarda cambios durante la exportación.

### Tests for User Story 2

- [X] T015 [P] [US2] Ampliar las pruebas de contrato JSON con todos los almacenes, campos opcionales ausentes, tipos monetarios, fechas y bytes exactos del logo en `tests/unit/export-backup.test.ts`
- [ ] T016 [P] [US2] Escribir la prueba E2E de contenido restaurable y consistencia de la instantánea ante una escritura desde otra pestaña en `tests/e2e/export-all.spec.ts`

### Implementation for User Story 2

- [X] T017 [US2] Completar el mapeo exhaustivo del contrato `presupuestospro-backup` v1 sin rellenar opcionales ni recalcular valores en `src/domain/export-backup.ts`
- [X] T018 [US2] Asegurar que todas las lecturas se crean dentro de la misma transacción y que el coordinador consume exclusivamente la instantánea capturada en `src/persistence/database.ts` y `src/export/export-all-quotes.ts`
- [ ] T019 [US2] Ejecutar `tests/unit/export-backup.test.ts` y los escenarios de restaurabilidad de `tests/e2e/export-all.spec.ts` y corregir cualquier pérdida o mezcla temporal en `src/domain/export-backup.ts` y `src/persistence/database.ts`

**Checkpoint**: US2 conserva todos los datos de la instantánea conforme a `contracts/export-archive.md` y sigue siendo de solo lectura.

---

## Phase 5: User Story 3 - Entender el progreso y los fallos parciales (Priority: P3)

**Goal**: Mantener informado al usuario, impedir exportaciones simultáneas y entregar una copia útil con reporte cuando fallen uno o todos los PDF.

**Independent Test**: Exportar al menos 50 presupuestos con un fallo PDF inyectado; verificar estado visible, botón bloqueado, ZIP con JSON completo, PDF válidos y `errores-exportacion.txt`, y la misma lista de números omitidos en una alerta final.

### Tests for User Story 3

- [X] T020 [P] [US3] Escribir pruebas unitarias fallidas del reporte UTF-8 ordenado en `tests/unit/export-backup.test.ts` y del resultado `complete`/`partial` en `tests/unit/export-all-quotes.test.ts`
- [ ] T021 [P] [US3] Ampliar las pruebas E2E con doble pulsación, progreso accesible, fallo parcial, fallo de todos los PDF, ausencia de reporte sin fallos y error fatal sin descarga en `tests/e2e/export-all.spec.ts`, incluyendo una colección de 50 presupuestos y visibilidad del estado en menos de un segundo
- [ ] T022 [P] [US3] Añadir escenarios móvil y `prefers-reduced-motion` para el control de al menos 44 px y el estado legible desde 320 px en `tests/e2e/mobile.spec.ts`

### Implementation for User Story 3

- [X] T023 [US3] Implementar captura por presupuesto, continuación secuencial, resultado discriminado y creación condicional de `errores-exportacion.txt` en `src/export/export-all-quotes.ts`
- [X] T024 [US3] Implementar bloqueo contra doble activación, texto `Generando PDF X de N`, `role="status"`, alertas de resultado parcial/fatal y liberación segura del estado en `src/features/quotes/QuoteListView.tsx`
- [X] T025 [US3] Añadir indicador animado responsive, tamaño táctil mínimo y regla `prefers-reduced-motion` en `src/styles.css`
- [ ] T026 [US3] Ejecutar los escenarios de `tests/e2e/export-all.spec.ts` y `tests/e2e/mobile.spec.ts` y corregir progreso, accesibilidad y fallos parciales en `src/export/export-all-quotes.ts`, `src/features/quotes/QuoteListView.tsx` y `src/styles.css`

**Checkpoint**: Las tres historias funcionan; los fallos aislados no eliminan la copia de datos ni los PDF válidos y los errores fatales no producen descargas incompletas.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verificar volumen, compatibilidad, documentación y cumplimiento transversal.

- [ ] T027 [P] Añadir o ajustar datos de prueba para validar 200 presupuestos y confirmar que no existe truncamiento por encima de 200 en `tests/e2e/export-all.spec.ts`
- [ ] T028 Ejecutar `npm run check` y corregir regresiones de tipos, pruebas unitarias, build y pruebas E2E en `src/`, `tests/`, `package.json` y `package-lock.json`
- [ ] T029 Completar y documentar la comprobación manual reproducible de ZIP completo, fallo parcial, consistencia entre pestañas, accesibilidad, 320 px y volumen descrita en `specs/003-exportar-copia-zip/quickstart.md`
- [X] T030 Actualizar `AGENTS.md` solo con decisiones transversales y reutilizables de esta feature, una línea por decisión con referencia `[003]`, conforme al paso de mantenimiento de `specs/003-exportar-copia-zip/plan.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias; comienza de inmediato.
- **Foundational (Phase 2)**: Depende de Setup y bloquea todas las historias.
- **US1 (Phase 3)**: Depende de Foundational y entrega el MVP.
- **US2 (Phase 4)**: Depende de Foundational y se integra con el ZIP de US1; puede desarrollar y validar el contrato en paralelo con US1, pero T018-T019 requieren que T012 exista.
- **US3 (Phase 5)**: Depende del coordinador de US1; sus pruebas y estilos pueden prepararse después de Foundational, pero T023-T026 requieren T012-T013.
- **Polish (Phase 6)**: Depende de las historias incluidas en la entrega.

### User Story Dependencies

```text
Setup → Foundational → US1 (MVP) ─┬→ US2 ─┐
                                  └→ US3 ─┴→ Polish
```

- **US1 (P1)**: No depende de otra historia; usa únicamente la base compartida.
- **US2 (P2)**: Su serialización se puede probar independientemente, pero su validación E2E usa el coordinador entregado por US1.
- **US3 (P3)**: Extiende el coordinador y la interfaz de US1 con progreso y tolerancia a fallos; no depende de US2 para sus reglas de resultado.

### Within Each User Story

- Escribir las pruebas indicadas y confirmar que fallan antes de implementar.
- Implementar dominio/persistencia antes de coordinación e interfaz.
- Completar la integración antes del checkpoint de la historia.
- Ejecutar las pruebas específicas de la historia antes de avanzar.

### Parallel Opportunities

- T003 y T004 pueden escribirse en paralelo; T005 y T006 pueden implementarse en paralelo una vez definidos sus respectivos casos.
- T005, T006, T007 y T008 afectan archivos distintos y pueden dividirse, respetando que T009 espera a todos.
- En US1, T010 y T011 pueden escribirse en paralelo.
- Tras Foundational, las pruebas de contrato T015 y de interfaz T020-T022 pueden prepararse en paralelo con la implementación P1.
- En US2, T015 y T016 pueden escribirse en paralelo.
- En US3, T020, T021 y T022 pueden escribirse en paralelo; T025 puede avanzar en paralelo con T023 si ya está acordado el estado de la vista.

---

## Parallel Example: User Story 1

```text
Task T010: "Prueba E2E de lista vacía y descarga ZIP en tests/e2e/export-all.spec.ts"
Task T011: "Prueba de equivalencia del PDF exportado en tests/e2e/pdf.spec.ts"
```

## Parallel Example: User Story 2

```text
Task T015: "Pruebas unitarias exhaustivas del JSON v1 en tests/unit/export-backup.test.ts"
Task T016: "Prueba E2E de restaurabilidad y consistencia entre pestañas en tests/e2e/export-all.spec.ts"
```

## Parallel Example: User Story 3

```text
Task T020: "Pruebas unitarias del reporte y resultados en tests/unit/export-backup.test.ts"
Task T021: "Pruebas E2E de progreso y fallos en tests/e2e/export-all.spec.ts"
Task T022: "Pruebas responsive y reduced-motion en tests/e2e/mobile.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Setup.
2. Completar Foundational.
3. Completar US1.
4. Detenerse y validar de forma independiente la descarga con cero, uno y tres presupuestos.
5. Demostrar el MVP si está listo.

### Incremental Delivery

1. Setup + Foundational → componentes compartidos listos.
2. US1 → ZIP completo básico, probado y demostrable.
3. US2 → fidelidad restaurable y consistencia entre pestañas verificadas.
4. US3 → progreso accesible y fallos parciales tolerados.
5. Polish → volumen, comprobación completa y mantenimiento documental.

### Parallel Team Strategy

1. Completar Setup y coordinar Foundational.
2. Después de Foundational, una persona implementa US1 mientras otras preparan las pruebas independientes de US2 y US3.
3. Tras estabilizar el coordinador P1, integrar US2 y US3 en paralelo porque sus reglas principales están separadas.
4. Reunir las historias para `npm run check` y la validación manual final.

---

## Notes

- Las tareas `[P]` modifican archivos distintos o son pruebas que pueden prepararse sin depender de implementaciones incompletas.
- Cada tarea de historia lleva su etiqueta para trazabilidad.
- La exportación es de solo lectura, local y no incorpora importación, cifrado, nube ni límites artificiales.
- Los PDF se generan desde la última versión guardada de la instantánea y comparten el constructor de la descarga individual.
- Hacer commit después de cada tarea o grupo lógico facilita revertir y revisar el incremento.
