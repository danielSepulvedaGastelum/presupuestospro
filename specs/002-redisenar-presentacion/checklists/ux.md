# UX Checklist: Rediseñar presentación

**Purpose**: Revisar que los requisitos de experiencia, presentación, accesibilidad y coherencia del PDF sean completos, claros y verificables antes de implementar.
**Created**: 2026-09-11
**Feature**: [spec.md](../spec.md)

**Note**: Esta checklist personalizada se genera a partir del contexto de la feature.
**Review Ownership**: Es un artefacto de revisión de calidad de requisitos. Marcar `[x]` únicamente cuando quien revisa determine que el criterio de calidad de los requisitos está satisfecho.
**Marker Semantics**: `[x]` indica calidad de requisitos revisada, no trabajo de implementación terminado.

## Completitud de navegación e Inicio

- [ ] CHK001 ¿Están definidos los contenidos mínimos y la prioridad visual de Inicio, además de sus accesos y cinco contadores? [Completitud, Spec §User Story 1, FR-001--FR-003]
- [ ] CHK002 ¿Se especifica qué información contextual acompaña a cada contador para que su significado no dependa solo del color o de un número aislado? [Claridad, Spec §FR-003, FR-011]
- [ ] CHK003 ¿Son consistentes los requisitos sobre los cuatro destinos entre la navegación común, la página de Inicio y los criterios de éxito? [Consistencia, Spec §FR-002--FR-005, SC-001--SC-003]
- [ ] CHK004 ¿Están definidos los requisitos de primer foco, título anunciado y retorno de foco al cambiar de sección? [Cobertura de accesibilidad, Gap]
- [ ] CHK005 ¿Se define cómo debe distinguirse el destino activo sin depender únicamente del color, tanto en móvil como en escritorio? [Claridad, Spec §FR-005, FR-012]

## Jerarquía e identidad visual

- [ ] CHK006 ¿Está cuantificada o acotada la expresión «profesional y sobria» mediante atributos observables de tipografía, colores, superficies, espaciado y jerarquía? [Claridad, Spec §FR-007, FR-010]
- [ ] CHK007 ¿Se especifican las relaciones de jerarquía requeridas entre título de página, título de tarjeta, etiquetas de formulario, tablas, acciones y total? [Completitud, Spec §FR-010]
- [ ] CHK008 ¿Se definen criterios perceptibles para que inputs, selects y áreas de texto se distingan del fondo en superficies claras? [Claridad, Spec §FR-009]
- [ ] CHK009 ¿Son coherentes los requisitos de paleta única entre la interfaz y el PDF, incluida la definición de qué atributos deben compartir? [Consistencia, Spec §FR-008, FR-013]
- [ ] CHK010 ¿Se documentan los estados visuales necesarios de los controles interactivos —reposo, foco, error, deshabilitado y selección— o se indica explícitamente cuáles quedan fuera de alcance? [Cobertura, Gap]

## Estados de presupuesto

- [ ] CHK011 ¿Está definida una terminología única y visible para Borrador, Enviado, Aceptado, Rechazado y Caducado en la interfaz, Inicio y PDF? [Consistencia, Spec §FR-003, FR-011, FR-013]
- [ ] CHK012 ¿Queda claro qué estado se comunica si un presupuesto Borrador o Enviado vence el mismo día frente a un día posterior? [Claridad, Spec §FR-017; Data model §Estado efectivo]
- [ ] CHK013 ¿Son consistentes las reglas de precedencia de Caducado respecto de Aceptado y Rechazado entre requisitos, supuestos, modelo y criterios de éxito? [Consistencia, Spec §FR-017; Spec §Assumptions; Data model §Estado efectivo]
- [ ] CHK014 ¿Se especifican requisitos de texto alternativo o explicación no cromática para que las cinco etiquetas sigan siendo distinguibles en condiciones de visión reducida? [Cobertura de accesibilidad, Spec §FR-011]
- [ ] CHK015 ¿Está definido qué debe comunicar la interfaz cuando el cambio persistente de estado no puede guardarse, sin confundirlo con el estado ya confirmado? [Flujo de excepción, Gap]

## Responsive y accesibilidad

- [ ] CHK016 ¿Se especifica cómo debe reordenarse o ajustarse la navegación de cuatro destinos a 320 px, en vez de limitarse a exigir que sea operable? [Claridad, Spec §FR-012, SC-005]
- [ ] CHK017 ¿Cubren los requisitos el uso por teclado de navegación, selectores de estado, formularios, tablas y acciones de PDF? [Completitud, Spec §FR-012]
- [ ] CHK018 ¿Se definen criterios de lectura, orden de foco y alternativas para tablas o listas densas a 200 % de zoom? [Cobertura, Spec §FR-012, SC-005]
- [ ] CHK019 ¿Son medibles los criterios «visible y operable» y «sin acciones inaccesibles» para viewport móvil y zoom? [Medibilidad, Spec §FR-012, SC-005]
- [ ] CHK020 ¿Se documenta el comportamiento requerido de la interfaz mientras se cargan los presupuestos locales, evitando que un resumen temporal de cero se interprete como dato definitivo? [Flujo de excepción, Gap]

## PDF y contenido en español

- [ ] CHK021 ¿Se detalla qué partes del PDF deben reflejar la nueva jerarquía visual, además de indicar que ha de ser coherente con la aplicación? [Completitud, Spec §FR-013]
- [ ] CHK022 ¿Está definida la ubicación y prioridad de la etiqueta de estado en PDF para que no compita con número, fechas, cliente ni total? [Claridad, Spec §FR-013; UI flow §PDF]
- [ ] CHK023 ¿Son compatibles los requisitos de la nueva identidad PDF con las reglas existentes de logo opcional, tabla multipágina y totales tras la última línea? [Consistencia, Spec §FR-014; Spec §Edge Cases]
- [ ] CHK024 ¿Delimita la especificación que todos los textos deben usar español de México y conservar la terminología fiscal y monetaria vigente? [Claridad, Spec §FR-015; Spec §Assumptions]
- [ ] CHK025 ¿Es consistente el requisito de español de México entre la especificación, el plan, el contrato de experiencia y la constitución? [Consistencia, Spec §FR-015; Plan §Constitution Check]

## Escenarios límite y criterios de aceptación

- [ ] CHK026 ¿Están cubiertos los estados de lista vacía, contador sin presupuestos y presupuesto heredado sin estado sin introducir datos ficticios? [Cobertura, Spec §Edge Cases; Data model §Compatibilidad]
- [ ] CHK027 ¿Se especifica qué debe ocurrir visualmente cuando el estado almacenado sea inválido o no se pueda clasificar? [Flujo de excepción, Gap]
- [ ] CHK028 ¿Los criterios de éxito permiten distinguir una revisión de coherencia visual de una mera comprobación subjetiva de «buen aspecto»? [Medibilidad, Spec §SC-004, SC-007]
- [ ] CHK029 ¿Se mantienen trazables los requisitos de experiencia a recorridos de aceptación que no requieran inspeccionar código o IndexedDB? [Trazabilidad, Spec §SC-001--SC-007; Quickstart]

## Notes

- Marcar elementos `[x]` solo tras revisar la calidad de los requisitos.
- Dejar elementos sin marcar cuando requieran aclaración, corrección o decisión de quien revisa.
- `$speckit-implement` puede leer los marcadores como puerta de calidad, pero no debe modificarlos.
- `checklists/requirements.md` tiene un ciclo independiente gestionado por `$speckit-specify` y `$speckit-clarify`.
