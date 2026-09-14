# Feature Specification: Rediseñar presentación

**Feature Branch**: `N/A (proyecto sin repositorio Git)`

**Created**: 2026-09-11

**Status**: Draft

**Input**: Mejorar la presentación de PresupuestosPro con una página de inicio, navegación común y un rediseño visual y de PDF, sin cambiar funcionalidad, cálculos ni datos.

## Clarifications

### Session 2026-09-11

- Q: ¿Cómo deben obtenerse los estados Enviado, Aceptado y Rechazado si la aplicación actual no los guarda ni tiene acciones para cambiarlos? → A: Añadir acciones y almacenamiento de estados, aceptando ampliar funcionalidad y datos.
- Q: ¿Debe un presupuesto Aceptado o Rechazado seguir mostrando ese estado después de que pase su fecha de vencimiento? → A: Solo Borrador y Enviado pasan a Caducado; Aceptado y Rechazado conservan su estado.
- Q: ¿La página de Inicio debe priorizar, de arriba abajo, bienvenida breve, resumen de cinco estados y accesos a Presupuestos/Servicios/Mi perfil? → A: Sí.
- Q: ¿Cada contador debe mostrar siempre el nombre del estado, su número y una frase breve que explique qué representa? → A: Sí.
- Q: ¿La navegación visible debe conservar exactamente el mismo orden en todas las pantallas: Inicio, Presupuestos, Servicios y Mi perfil? → A: Sí.
- Q: ¿Al cambiar de sección, el foco debe pasar al título principal de la página; y al cerrar el editor de un presupuesto, debe volver al botón que lo abrió o creó? → A: Sí.
- Q: ¿La sección activa debe distinguirse mediante texto en negritas, un indicador visible adicional —como subrayado o borde— y aria-current, además del color? → A: Sí.
- Q: ¿Quieres conservar además una paleta limitada a un color principal, un color de acento y colores semánticos de éxito, advertencia y error, más neutros de fondo, superficie y texto? → A: Sí.
- Q: ¿La jerarquía debe definir que el título de página es el nivel principal; los títulos de sección y tarjeta el segundo; y etiquetas, tablas y texto auxiliar el nivel base, reservando el mayor énfasis dentro de cada formulario para la acción principal y el total final? → A: Sí.
- Q: ¿Los campos editables deben usar una superficie neutra ligeramente teñida —no blanca—, un borde visible de al menos 1 px y un foco de alto contraste? → A: Sí.
- Q: ¿La fuente única de diseño debe definir, para la aplicación y el PDF, los mismos roles de color, tipografía, espaciado, bordes y jerarquía, aunque cada medio los aplique con su propia tecnología? → A: Sí.
- Q: ¿Todos los controles interactivos deben definir estados de reposo, foco, activo, deshabilitado y error cuando aplique; y el estado hover debe ser solo un complemento para puntero, nunca el único indicador? → A: Sí.
- Q: ¿Los únicos nombres visibles permitidos para los estados deben ser exactamente Borrador, Enviado, Aceptado, Rechazado y Caducado en Inicio, lista, editor y PDF? → A: Sí.
- Q: ¿Un presupuesto debe conservar Borrador o Enviado durante todo su día de vencimiento y pasar a Caducado a partir del día siguiente? → A: Sí.
- Q: ¿Confirmas que Aceptado y Rechazado siempre tienen prioridad visual y en los contadores sobre Caducado, aunque la fecha de vencimiento ya haya pasado? → A: Sí.
- Q: ¿Cada estado debe conservar siempre su etiqueta textual, y los iconos pueden usarse solo como apoyo opcional, nunca como único indicador? → A: Sí.
- Q: Si no se puede guardar un cambio de estado, ¿debe conservarse el estado anterior, mostrarse un mensaje junto al selector y ofrecer volver a intentarlo sin perder el resto del presupuesto? → A: Sí.
- Q: ¿A 320–719 px la navegación debe mostrarse en una cuadrícula de dos columnas y dos filas, y desde 720 px en una sola fila de cuatro destinos? → A: Sí.
- Q: ¿El orden de tabulación debe seguir el orden visual y de lectura: navegación, título principal, contenido, campos y acciones; y cada selector de estado debe anunciar su etiqueta y valor actual? → A: Sí.
- Q: ¿A 320 px o zoom del 200 %, las tablas y filas densas deben convertirse en tarjetas o filas apiladas con etiquetas, en lugar de requerir desplazamiento horizontal? → A: Sí.
- Q: ¿“Visible y operable” debe significar que ningún elemento supera el ancho de la ventana, todos los controles quedan alcanzables con teclado y táctil, y ningún dato o acción solo aparece tras desplazamiento horizontal? → A: Sí.
- Q: Mientras se leen los presupuestos guardados, ¿Inicio debe mostrar “Cargando tu información…” y marcadores de carga, sin presentar los contadores en cero hasta que los datos estén disponibles? → A: Sí.
- Q: ¿El PDF debe ordenar su información así: marca y profesional, título “Presupuesto”, número y estado, fechas, cliente, conceptos y, al final, desglose y total? → A: Sí.
- Q: ¿La etiqueta de estado debe ir inmediatamente después del número, en la misma línea o bloque visual, y debe usar el mismo texto canónico que la aplicación? → A: Sí.
- Q: ¿Confirmas que la nueva apariencia no debe modificar el tratamiento del logo opcional, la repetición de encabezados en páginas adicionales ni la posición final de los totales? → A: Sí.
- Q: ¿Todos los textos de presentación —incluidos Inicio, carga, estados, mensajes de error, botones y PDF— deben usar español de México, conservando MXN, RFC, IVA, ISR, persona física y persona moral? → A: Sí.
- Q: ¿Confirmas que español de México debe prevalecer en todos los textos de la feature, sin excepciones de presentación? → A: Sí.
- Q: ¿Cuando no haya presupuestos, Inicio debe conservar los cinco contadores en cero y sus explicaciones; y un presupuesto heredado sin estado debe aparecer como Borrador, sin modificar sus datos guardados? → A: Sí.
- Q: Si un presupuesto contiene un estado no reconocido, ¿debe mostrarse un aviso recuperable, conservarse el resto del presupuesto y bloquearse solo el cambio de estado hasta que el usuario lo seleccione de nuevo? → A: Sí.
- Q: ¿La aceptación visual debe incluir capturas de las cuatro secciones a 320 px y escritorio, mediciones de contraste registradas y la revisión de los diez PDFs definidos en SC-007? → A: Sí.
- Q: ¿La guía de validación debe identificar explícitamente qué FR y SC cubre cada recorrido, para que una persona no técnica pueda comprobarlos sin revisar código ni IndexedDB? → A: Sí.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Orientarse desde el inicio (Priority: P1)

Como profesional independiente, quiero llegar a una página de inicio clara al abrir la aplicación para ver un resumen de mis presupuestos y acceder directamente a cada sección de trabajo.

**Why this priority**: Facilita encontrar las funciones existentes sin depender del historial del navegador ni alterar el flujo de trabajo actual.

**Independent Test**: Con presupuestos existentes en varios estados, se abre la raíz de la aplicación y se comprueba el resumen y el acceso a cada sección desde inicio y desde las demás páginas.

**Acceptance Scenarios**:

1. **Given** la aplicación contiene presupuestos guardados, **When** el usuario accede a la raíz del servidor, **Then** ve una página de inicio con accesos visibles a Inicio, Presupuestos, Servicios y Mi perfil.
2. **Given** hay presupuestos en uno o varios estados, **When** el usuario ve la página de inicio, **Then** ve el número de presupuestos de cada estado aplicable sin que se modifique ningún presupuesto.
3. **Given** el usuario se encuentra en Inicio, Presupuestos, Servicios o Mi perfil, **When** selecciona otra sección de la navegación común, **Then** llega a esa sección sin usar el botón atrás del navegador.
4. **Given** la aplicación no contiene presupuestos, **When** el usuario abre Inicio, **Then** el resumen muestra cero de forma comprensible y conserva los accesos a las secciones.

---

### User Story 2 - Trabajar con una interfaz profesional (Priority: P1)

Como profesional independiente, quiero que todas las pantallas tengan una apariencia sobria, coherente y legible para preparar presupuestos con confianza en móvil y escritorio.

**Why this priority**: La presentación consistente mejora la comprensión de formularios, tablas y totales sin cambiar las tareas ya disponibles.

**Independent Test**: Se recorre cada sección y un presupuesto existente, verificando que los mismos elementos visuales se presentan de forma consistente y que se pueden completar las acciones actuales.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla de la aplicación, **When** el usuario consulta títulos, formularios, tablas y totales, **Then** identifica una jerarquía visual coherente entre ellos.
2. **Given** un formulario con campos editables, **When** el usuario lo visualiza, **Then** los campos se distinguen claramente del fondo de la página y disponen de espacio interior y separación uniformes.
3. **Given** un presupuesto en cualquier estado soportado, **When** se muestra su estado, **Then** el usuario puede distinguir visualmente Borrador, Enviado, Aceptado, Rechazado y Caducado sin confundirlos entre sí.
4. **Given** una pantalla de la aplicación a 320 px de ancho o con zoom del 200 %, **When** el usuario navega, consulta una tabla o rellena un formulario, **Then** no pierde controles, información ni acceso a los totales.

---

### User Story 3 - Enviar un PDF coherente con la aplicación (Priority: P2)

Como profesional independiente, quiero que el PDF conserve una imagen visual profesional y coherente con la aplicación para compartirlo con mis clientes.

**Why this priority**: El PDF es el documento externo del producto y debe transmitir la misma calidad visual sin perder información fiscal o comercial.

**Independent Test**: Se descarga un presupuesto válido con y sin logo y se compara visualmente con la aplicación, verificando toda la información existente.

**Acceptance Scenarios**:

1. **Given** un presupuesto válido listo para descargar, **When** el usuario genera su PDF, **Then** el documento usa una presentación sobria, legible y coherente con la identidad visual de la aplicación.
2. **Given** un PDF de presupuesto, **When** se revisan sus secciones y totales, **Then** se conserva toda la información, importes y comportamiento de paginación definidos para el documento actual.
3. **Given** un presupuesto con cualquiera de los estados visuales soportados, **When** su PDF muestra el estado, **Then** el estado se distingue de los demás sin reducir la legibilidad del documento.

### Edge Cases

- Si no existen presupuestos, el resumen de Inicio muestra todos los recuentos en cero y no presenta datos inexistentes.
- Si un estado no tiene presupuestos, su recuento se muestra como cero de forma consistente con los demás estados.
- Los presupuestos existentes que aún no tengan estado conservado se muestran inicialmente como Borrador, sin modificar ningún importe, dato fiscal ni regla de negocio.
- Si una tabla, un formulario o un bloque de totales no cabe horizontalmente en una pantalla pequeña, sigue siendo consultable y operable sin ocultar contenido ni acciones.
- Si el PDF se extiende a varias páginas o no hay logo, mantiene la nueva identidad visual y todas las reglas actuales de contenido y paginación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Al acceder a la raíz del servidor, el sistema debe mostrar una página de inicio como punto de entrada de PresupuestosPro.
- **FR-002**: La página de inicio debe ofrecer accesos claramente identificables a Inicio, Presupuestos, Servicios y Mi perfil.
- **FR-003**: La página de inicio debe mostrar un resumen de actividad con el número de presupuestos en cada uno de los estados Borrador, Enviado, Aceptado, Rechazado y Caducado.
- **FR-004**: Todas las páginas de Inicio, Presupuestos, Servicios y Mi perfil deben compartir una navegación visible que permita moverse entre ellas sin recurrir al historial del navegador.
- **FR-005**: La navegación común debe indicar de forma perceptible la sección actualmente activa.
- **FR-006**: El sistema debe conservar sin cambios los presupuestos, perfiles, servicios, datos de clientes, números, cálculos y reglas de negocio existentes al introducir Inicio y la navegación común. La única excepción autorizada es añadir y conservar el estado de cada presupuesto conforme a FR-017.
- **FR-007**: Toda la aplicación debe utilizar una identidad visual profesional y sobria, con una tipografía consistente, una paleta de colores limitada y reglas de espaciado uniformes.
- **FR-008**: Los colores de la identidad visual deben definirse en una única fuente de referencia de la aplicación para que se apliquen de forma consistente en todas las pantallas y en el PDF.
- **FR-009**: Los campos de entrada y demás controles editables deben diferenciarse visualmente del fondo de la página; no deben confundirse con una superficie blanca sin delimitación cuando el fondo también sea blanco.
- **FR-010**: La presentación debe establecer una jerarquía visual clara y coherente entre títulos, subtítulos, formularios, tablas, acciones y bloques de totales en todas las secciones existentes.
- **FR-011**: Cada estado Borrador, Enviado, Aceptado, Rechazado y Caducado debe tener un tratamiento visual consistente y distinguible de los otros cuatro estados, además de una etiqueta textual visible.
- **FR-012**: El diseño debe conservar el enfoque mobile-first existente y permitir consultar y operar la totalidad de las pantallas, navegación, formularios, tablas y totales desde 320 px de ancho y con zoom del 200 %.
- **FR-013**: El PDF debe adoptar la misma identidad visual sobria y profesional, incluyendo la tipografía, la paleta limitada, la jerarquía de información y la presentación distinguible del estado cuando éste se muestre.
- **FR-014**: El rediseño del PDF debe conservar sin cambios todos los datos, importes, reglas de contenido, validaciones y paginación definidos para el PDF actual.
- **FR-015**: Todos los textos de la interfaz y del PDF —incluidos Inicio, carga, estados, mensajes de error y botones— deben redactarse en español de México, manteniendo sin alteración MXN, RFC, IVA, ISR, persona física, persona moral, los términos fiscales y los datos existentes que formen parte de los presupuestos actuales.
- **FR-016**: Esta mejora no debe modificar resultados de cálculos, reglas fiscales, perfiles, servicios, datos de clientes, números ni datos existentes. Como excepción autorizada, puede añadir acciones, persistencia y un campo de estado de presupuesto conforme a FR-017.
- **FR-017**: El sistema debe permitir cambiar y conservar el estado de cada presupuesto entre Borrador, Enviado, Aceptado y Rechazado. Cuando la fecha de vencimiento haya pasado, Borrador y Enviado deben mostrarse y contarse como Caducado sin modificar su estado conservado; Aceptado y Rechazado deben seguir mostrándose y contándose con su propio estado.
- **FR-018**: El texto normal, los controles, sus bordes, los indicadores de foco y los estados visuales deben alcanzar como mínimo una relación de contraste de 4.5:1 para texto y de 3:1 para componentes no textuales frente a superficies adyacentes; ningún estado debe depender exclusivamente del color.
- **FR-019**: La jerarquía tipográfica debe usar como mínimo tres niveles distinguibles: título de página, título de sección y texto de contenido. El título de página debe tener un tamaño de al menos 1.5 veces el texto de contenido, y el título de sección de al menos 1.25 veces, sin reducir el texto de contenido por debajo de 16 px equivalentes.
- **FR-020**: Los márgenes, rellenos y separaciones de la interfaz deben seguir una escala uniforme de incrementos de 4 px; bloques independientes deben separarse al menos 16 px y una etiqueta de su control editable al menos 8 px.
- **FR-021**: El selector de estado de un presupuesto debe permanecer deshabilitado mientras el editor contenga cambios sin guardar y debe explicar mediante texto que primero se deben guardar o descartar esos cambios.
- **FR-022**: Inicio debe presentar, en este orden de lectura y prioridad vertical: una bienvenida breve, el resumen de los cinco estados y los accesos a Presupuestos, Servicios y Mi perfil. En móvil, los tres bloques deben permanecer visibles mediante desplazamiento vertical natural, sin alterar ese orden.
- **FR-023**: Cada contador de Inicio debe incluir la etiqueta textual del estado, el número de presupuestos y una explicación fija: Borrador, «Aún en preparación»; Enviado, «Pendiente de respuesta»; Aceptado, «Confirmado»; Rechazado, «No aceptado»; y Caducado, «Venció sin respuesta». El color solo complementa esta información.
- **FR-024**: La navegación común debe mostrar siempre los destinos en este orden: Inicio, Presupuestos, Servicios y Mi perfil. El orden debe ser el mismo en móvil, escritorio y navegación mediante teclado.
- **FR-025**: Al cambiar de sección mediante la navegación común, el foco debe trasladarse al título principal de la sección. Al cerrar el editor de un presupuesto, el foco debe volver al control que abrió un presupuesto existente o inició la creación de uno nuevo.
- **FR-026**: La sección activa de la navegación común debe usar simultáneamente `aria-current`, texto en negritas y un indicador visible no basado solo en color, como subrayado o borde.
- **FR-027**: La fuente única de tokens visuales debe limitar la paleta a los roles semánticos de color principal, acento, éxito, advertencia, error, fondo, superficie, texto principal, texto secundario y borde. No deben introducirse colores fuera de esos roles sin añadir un token semántico documentado.
- **FR-028**: La jerarquía visual debe asignar el nivel principal al título de página, el segundo nivel a títulos de sección y tarjeta, y el nivel base a etiquetas, tablas y texto auxiliar. Dentro de formularios y presupuestos, la acción principal y el total final deben tener el mayor énfasis visual después del título de página.
- **FR-029**: Inputs, selectores y áreas de texto deben usar una superficie neutra ligeramente teñida, distinta del blanco de tarjetas y fondos; un borde visible de al menos 1 px; y un indicador de foco de alto contraste que cumpla FR-018.
- **FR-030**: La fuente única de tokens debe definir roles de color, tipografía, espaciado, bordes y jerarquía para la aplicación y el PDF. Cada medio puede aplicarlos con su propia tecnología, pero debe conservar el mismo valor y significado semántico de cada rol.
- **FR-031**: Todo control interactivo debe definir presentación para reposo, foco y activo; y, cuando aplique, para deshabilitado y error. Hover solo complementa interacciones de puntero y no debe ser el único indicador de disponibilidad, selección o resultado.
- **FR-032**: Los únicos nombres visibles de estado permitidos en Inicio, lista, editor y PDF son Borrador, Enviado, Aceptado, Rechazado y Caducado. No deben usarse sinónimos para clasificar o contar presupuestos.
- **FR-033**: Un presupuesto Borrador o Enviado debe conservar su estado durante toda la fecha civil indicada en su vencimiento; solo debe mostrarse y contarse como Caducado a partir del día civil siguiente.
- **FR-034**: Cada presentación de estado debe incluir su etiqueta textual canónica. Los iconos son opcionales y, si se usan, solo complementan el texto y no comunican por sí mismos el estado.
- **FR-035**: Si no se puede guardar un cambio de estado, el presupuesto debe conservar el último estado confirmado, mostrar un mensaje recuperable junto al selector y permitir reintentar sin perder ningún otro dato o cambio del presupuesto.
- **FR-036**: Entre 320 y 719 px de ancho, la navegación común debe distribuir sus cuatro destinos en dos columnas y dos filas. Desde 720 px, debe mostrarlos en una sola fila de cuatro destinos, sin cambiar su orden ni reducir los controles por debajo de 44 px.
- **FR-037**: El orden de tabulación debe seguir el orden visual y de lectura: navegación, título principal, contenido, campos y acciones. Cada selector de estado debe exponer una etiqueta y su valor actual a tecnologías de asistencia.
- **FR-038**: A 320 px y con zoom del 200 %, tablas y filas de contenido denso deben presentarse como tarjetas o filas apiladas con etiquetas visibles para cada dato, sin requerir desplazamiento horizontal de la página ni ocultar acciones o totales.
- **FR-039**: Para los requisitos responsive, «visible y operable» significa que ningún elemento excede el ancho de la ventana; todos los controles son alcanzables mediante teclado y táctil; y ningún dato o acción requiere desplazamiento horizontal para consultarse o utilizarse.
- **FR-040**: Mientras se cargan los datos locales, Inicio debe mostrar el texto «Cargando tu información…» y marcadores de carga para el resumen. Los contadores en cero solo deben mostrarse después de que la lectura haya terminado y no existan presupuestos.
- **FR-041**: El PDF debe ordenar su contenido en este orden: marca y profesional; título «Presupuesto»; número y estado; fechas; cliente; conceptos; y, al final, desglose fiscal y total. El estado debe aparecer inmediatamente después del número, en la misma línea o bloque visual, y usar el nombre canónico definido en FR-032.
- **FR-042**: Si no existen presupuestos, Inicio debe mostrar los cinco contadores en cero con sus explicaciones. Un presupuesto heredado sin estado debe presentarse como Borrador sin modificar ningún dato persistido.
- **FR-043**: Si un presupuesto contiene un estado no reconocido, la aplicación debe mostrar un aviso recuperable, conservar accesibles todos los demás datos del presupuesto y bloquear solo su cambio de estado hasta que el usuario seleccione un estado válido.
- **FR-044**: La guía de validación debe identificar los FR y SC que cubre cada recorrido manual, de modo que una persona no técnica pueda comprobar la feature sin revisar código ni IndexedDB.

### Key Entities

- **Resumen de actividad**: Vista agregada y de solo lectura de los presupuestos existentes, agrupados por estado; no crea ni modifica presupuestos.
- **Navegación común**: Conjunto visible de accesos a Inicio, Presupuestos, Servicios y Mi perfil, con indicación de la sección activa.
- **Estado de presupuesto**: Valor conservado para clasificar un presupuesto como Borrador, Enviado, Aceptado o Rechazado; Caducado es una condición visual derivada de que la fecha de vencimiento ya haya pasado para un presupuesto Borrador o Enviado.
- **Estado visual de presupuesto**: Presentación con etiqueta y tratamiento visual del estado almacenado o de la condición Caducado.
- **Identidad visual**: Conjunto compartido de tipografía, colores, espaciado y jerarquía aplicable a las pantallas y al PDF.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las aperturas de la raíz de la aplicación muestran Inicio con accesos visibles a las cuatro secciones y un resumen de presupuestos por estado.
- **SC-002**: En una prueba con al menos un presupuesto en cada estado, el 100 % de los recuentos de Inicio coincide con los presupuestos almacenados, sin que la consulta modifique datos.
- **SC-003**: El 100 % de los recorridos entre Inicio, Presupuestos, Servicios y Mi perfil se completa desde la navegación común sin usar el botón atrás del navegador.
- **SC-004**: Al menos 9 de cada 10 usuarios no técnicos pueden identificar la sección activa, localizar los totales y distinguir correctamente los cinco estados de presupuesto en su primer recorrido sin ayuda verbal.
- **SC-005**: El 100 % de los formularios, tablas, totales y controles de las secciones existentes sigue siendo visible y operable a 320 px de ancho y con zoom del 200 %, sin desplazamiento horizontal de página ni acciones inaccesibles.
- **SC-006**: El 100 % de los escenarios de presupuesto y PDF ya definidos conserva los mismos datos, importes, cálculos y reglas de paginación después del rediseño, salvo la incorporación autorizada del estado de presupuesto.
- **SC-007**: En una revisión visual de diez PDFs de prueba, todos presentan una jerarquía legible y una identidad visual coherente con la aplicación, y todos conservan los datos obligatorios del PDF actual.
- **SC-008**: El 100 % de los textos, controles, indicadores de foco y estados incluidos en la revisión de las cuatro secciones cumple los umbrales de contraste de FR-018; la revisión documenta el valor de contraste de cada combinación de color evaluada.
- **SC-009**: En una revisión de las cuatro secciones, el 100 % de los títulos de página, títulos de sección, campos editables y bloques de contenido cumple las proporciones tipográficas y las separaciones mínimas definidas en FR-019 y FR-020.
- **SC-010**: La aceptación visual conserva capturas de las cuatro secciones a 320 px y escritorio, las mediciones de contraste de SC-008 y la revisión de los diez PDFs de SC-007 como evidencia verificable.

## Assumptions

- Las secciones existentes a las que se refiere la solicitud son Presupuestos, Servicios y Mi perfil; Inicio es la nueva cuarta sección de navegación.
- El resumen de Inicio se calcula a partir de los estados conservados de los presupuestos y de la condición Caducado derivada de la fecha de vencimiento para los presupuestos Borrador o Enviado.
- Borrador, Enviado, Aceptado y Rechazado son estados conservados; Caducado es una condición visual derivada de la fecha de vencimiento solo para Borrador y Enviado. Aceptado y Rechazado conservan su presentación y recuento aunque la fecha de vencimiento haya pasado. Los cinco deben contar con tratamiento visual específico.
- Español de México se aplica a todos los textos de la interfaz y el PDF. La moneda MXN, los cálculos y la información fiscal vigente se preservan para cumplir el alcance funcional existente.
- La mejora reutiliza la información que ya contiene cada presupuesto y no incorpora analítica, cuentas ni sincronización. Por la aclaración registrada, incorpora como excepción acciones y almacenamiento de estado de presupuesto.
