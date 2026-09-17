# Feature Specification: Exportar copia completa en ZIP

**Feature Branch**: `003-exportar-copia-zip`

**Created**: 2026-09-17

**Status**: Draft

**Input**: User description: "Exportar todos mis presupuestos en un único archivo .zip con un PDF por presupuesto y un archivo completo de datos para una futura restauración."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descargar una copia completa (Priority: P1)

Como freelancer, quiero exportar todos mis presupuestos en un solo archivo comprimido para conservar una copia fuera del navegador y poder archivarla donde quiera.

**Why this priority**: Es el valor principal de la funcionalidad y reduce el riesgo de perder todo el historial al cambiar de equipo o navegador, formatear el equipo o borrar sus datos.

**Independent Test**: Con tres presupuestos guardados, se pulsa "Exportar todo (.zip)", se abre el archivo descargado y se comprueba que contiene tres PDF y `presupuestospro-datos.json`.

**Acceptance Scenarios**:

1. **Given** que existen tres presupuestos guardados, **When** el usuario pulsa "Exportar todo (.zip)", **Then** se descarga un único archivo llamado `presupuestospro-copia-AAAA-MM-DD.zip` que contiene tres PDF y un archivo completo de datos.
2. **Given** que existe un presupuesto guardado, **When** el usuario realiza la exportación, **Then** el ZIP contiene un PDF llamado con el patrón `número - cliente.pdf` y el archivo de datos.
3. **Given** que la exportación termina correctamente, **When** el usuario vuelve a utilizar la aplicación, **Then** sus presupuestos, perfil, catálogo, numeración y estados permanecen sin cambios.

---

### User Story 2 - Conservar una copia restaurable de los datos (Priority: P2)

Como freelancer, quiero que la copia incluya toda la información que pertenece a mi aplicación para que una futura función de importación pueda reconstruirla sin perder datos relevantes.

**Why this priority**: Los PDF permiten archivar documentos, pero el archivo de datos es el que hace viable una restauración completa en el futuro.

**Independent Test**: Se exportan presupuestos junto con un perfil que tenga logo, un catálogo y numeraciones anuales; se inspecciona el archivo de datos y se comprueba que contiene todos los registros, sus identificadores, fechas, estados y valores sin pérdida.

**Acceptance Scenarios**:

1. **Given** que existen perfil, logo, servicios, presupuestos y estado de numeración anual, **When** se exporta la copia, **Then** `presupuestospro-datos.json` incluye esos datos, una versión de formato y la fecha y hora de exportación.
2. **Given** que algunos datos opcionales no existen, **When** se exporta la copia, **Then** el archivo identifica correctamente su ausencia sin inventar valores ni impedir la exportación.
3. **Given** que el archivo contiene importes, fechas, identificadores y referencias entre datos, **When** se compara con la información guardada, **Then** los valores se conservan sin recálculo, redondeo ni modificación.

---

### User Story 3 - Entender el progreso y los fallos parciales (Priority: P3)

Como usuario no técnico, quiero saber que una exportación grande sigue trabajando y conocer qué documentos no pudieron incluirse, sin perder la copia de los demás datos y PDF.

**Why this priority**: Generar decenas de PDF puede tardar y algunos datos heredados o dañados podrían impedir la creación de un documento concreto.

**Independent Test**: Se inicia una exportación de al menos 50 presupuestos, se observa un estado visible durante el proceso y se provoca el fallo de un PDF; al terminar se descarga el ZIP con el archivo de datos completo y los PDF válidos, y se identifica el presupuesto omitido.

**Acceptance Scenarios**:

1. **Given** que la aplicación está preparando la exportación, **When** el proceso aún no termina, **Then** se muestra un indicador visible de trabajo y se evita iniciar otra exportación simultánea.
2. **Given** que un presupuesto no puede convertirse en PDF, **When** termina la exportación, **Then** se descarga el ZIP con el archivo de datos completo y todos los PDF que sí pudieron generarse, y la interfaz advierte qué presupuesto o presupuestos no se incluyeron como PDF.
3. **Given** que todos los PDF se generan correctamente, **When** termina la exportación, **Then** la interfaz confirma la descarga sin mostrar advertencias de documentos omitidos.

### Edge Cases

- Si no existe ningún presupuesto, la aplicación muestra un aviso claro y no inicia ni descarga una exportación vacía.
- Los nombres de cliente con separadores de ruta, caracteres no admitidos, controles, puntos o espacios finales se convierten en nombres de archivo seguros sin alterar el nombre mostrado dentro del PDF.
- Si el nombre limpio del cliente queda vacío, se utiliza `Cliente` como sustituto en el nombre del PDF.
- El número único del presupuesto forma parte del nombre del PDF, por lo que dos clientes con el mismo nombre siguen produciendo archivos distintos.
- Los presupuestos de cualquier estado, incluidos borrador, enviado, aceptado y rechazado, se incluyen porque la acción exporta todos los presupuestos guardados.
- Si uno o varios PDF fallan, el archivo de datos sigue incluyendo también los presupuestos afectados; la advertencia enumera sus números para que el usuario sepa qué documentos faltan.
- Si fallan todos los PDF pero existe al menos un presupuesto, se descarga una copia con el archivo de datos completo y se advierte que ningún PDF pudo incluirse.
- Si no puede construirse el archivo de datos o no puede generarse o descargarse el ZIP, no se ofrece una copia incompleta y se muestra un error que permite volver a intentarlo.
- Una colección de 50 o más presupuestos mantiene visible el estado de trabajo hasta que finaliza o falla la exportación.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La lista de presupuestos MUST mostrar una acción visible denominada "Exportar todo (.zip)".
- **FR-002**: Al activar la acción, el sistema MUST leer todos los presupuestos guardados, sin filtrar por estado ni por lo que esté visible en la lista.
- **FR-003**: Si no hay presupuestos guardados, el sistema MUST mostrar un aviso de que no hay nada que exportar y MUST NOT descargar archivo alguno.
- **FR-004**: Cuando exista al menos un presupuesto, el sistema MUST producir una sola descarga ZIP llamada `presupuestospro-copia-AAAA-MM-DD.zip`, usando la fecha civil local del día en que comenzó la exportación.
- **FR-005**: El ZIP MUST incluir un PDF por cada presupuesto que pueda convertirse correctamente y un único archivo `presupuestospro-datos.json`.
- **FR-006**: Cada PDF MUST generarse a partir de la última versión guardada del presupuesto mediante las mismas reglas de contenido, cálculo y presentación que la descarga individual existente.
- **FR-007**: Para el mismo presupuesto guardado, el PDF exportado en el ZIP y el descargado individualmente MUST tener el mismo contenido y aspecto, incluidos importes, redondeos, logo y total al centavo; no se exige igualdad byte por byte de sus metadatos internos.
- **FR-008**: Cada PDF MUST llamarse `número - cliente.pdf`, conservando el número del presupuesto y usando una versión segura del nombre del cliente.
- **FR-009**: La limpieza del nombre MUST impedir rutas o nombres de archivo inválidos, MUST reemplazar los caracteres conflictivos de forma predecible y MUST usar `Cliente` cuando no quede texto útil.
- **FR-010**: El archivo de datos MUST ser un documento JSON autónomo con un identificador y versión explícita de su formato, además de la fecha y hora de exportación.
- **FR-011**: El archivo de datos MUST incluir todos los presupuestos, el perfil vigente, el logo con su tipo y contenido completos, todos los servicios del catálogo y todo el estado de numeración anual necesario para una restauración futura.
- **FR-012**: El archivo de datos MUST conservar los identificadores, referencias, estados, fechas, reglas fiscales congeladas, importes y demás valores guardados sin recalcularlos ni transformarlos de manera irreversible.
- **FR-013**: La exportación MUST ser de solo lectura y MUST NOT crear, actualizar ni eliminar presupuestos, servicios, perfil, numeraciones o cualquier otro dato de la aplicación.
- **FR-014**: Mientras se prepara el ZIP, el sistema MUST mostrar un estado de trabajo comprensible y MUST impedir exportaciones simultáneas iniciadas por pulsaciones repetidas.
- **FR-015**: Si falla la generación del PDF de un presupuesto, el sistema MUST continuar con los demás, MUST mantener ese presupuesto dentro del archivo de datos y MUST advertir al finalizar cuáles números de presupuesto no tienen PDF en el ZIP.
- **FR-016**: Si fallan todos los PDF, pero existe al menos un presupuesto y el archivo de datos es válido, el sistema MUST descargar el ZIP con el archivo de datos y MUST advertir que no se incluyó ningún PDF.
- **FR-017**: Si no puede generarse el archivo de datos o el ZIP descargable, el sistema MUST abortar la descarga y mostrar un mensaje claro para volver a intentarlo.
- **FR-018**: La funcionalidad MUST admitir desde 1 hasta 200 presupuestos en una sola exportación.
- **FR-019**: Los mensajes, indicadores, advertencias y nombres visibles relacionados con la exportación MUST estar en español de México y ser comprensibles para una persona no técnica.

### Key Entities

- **Copia de exportación**: Paquete fechado que reúne el archivo completo de datos y los PDF generados; registra qué presupuestos no pudieron representarse como PDF durante esa ejecución.
- **Archivo de datos versionado**: Representación autónoma de todos los datos restaurables, con identidad y versión de formato, momento de exportación, perfil, logo, catálogo, presupuestos y numeraciones anuales.
- **Presupuesto exportado**: Última versión guardada de un presupuesto y su PDF correspondiente cuando puede generarse; conserva número, cliente, conceptos, instantáneas fiscal y profesional, totales, fechas y estado.
- **Activo de logo**: Imagen del perfil conservada con su tipo, dimensiones y contenido completo para que pueda restaurarse sin depender de recursos externos.
- **Resultado parcial**: Relación de presupuestos cuyos datos sí están respaldados pero cuyo PDF no pudo incluirse, comunicada al usuario por número de presupuesto.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con tres presupuestos guardados, el usuario obtiene mediante una sola acción exactamente un ZIP con tres PDF y un archivo de datos.
- **SC-002**: El 100 % de los PDF generados dentro del ZIP coincide visualmente y en contenido monetario con la descarga individual del mismo presupuesto, incluido un caso de control con total de `$2,320.00`.
- **SC-003**: El archivo de datos contiene el 100 % de los presupuestos, servicios, datos del perfil, contenido del logo y registros de numeración presentes al comenzar la exportación.
- **SC-004**: Con entre 1 y 200 presupuestos, la exportación termina en una descarga o en un mensaje de error comprensible, sin modificar ningún dato guardado.
- **SC-005**: En exportaciones de 50 o más presupuestos, aparece un indicador de trabajo dentro del primer segundo y permanece visible hasta que el proceso termina.
- **SC-006**: Ante el fallo de uno o varios PDF, el 100 % de los PDF restantes y el archivo completo de datos se descargan, y todos los números omitidos se identifican en la advertencia final.
- **SC-007**: Con cero presupuestos, ninguna descarga se inicia y el usuario recibe un aviso claro después de una sola pulsación.
- **SC-008**: Una persona que sabe descargar y abrir un ZIP puede localizar el archivo de datos y asociar cada PDF con su número y cliente sin instrucciones técnicas adicionales.

## Assumptions

- La fecha del nombre del ZIP corresponde a la fecha civil local del dispositivo al iniciar la exportación, sin conversión de zona horaria.
- `presupuestospro-datos.json` se diseña para compatibilidad con una futura importación, pero leer, validar o restaurar esa copia queda fuera del alcance de esta funcionalidad.
- La versión inicial del formato de copia se identifica de forma explícita para que futuros cambios puedan distinguirse sin depender de la versión de la aplicación.
- El JSON puede representar datos binarios, como el logo, mediante una codificación textual reversible que conserve todos sus bytes y su tipo.
- La copia no se cifra ni se protege con contraseña; el usuario es responsable de custodiar el ZIP descargado.
- La exportación usa exclusivamente los datos que estaban guardados al comenzar; los cambios no guardados que pudiera haber en un editor abierto no forman parte de la copia.
- La aplicación conserva su comportamiento local y no envía el ZIP ni sus datos a servicios externos.
- Excel, CSV, copias automáticas, envío por correo, almacenamiento en nube e importación quedan fuera de alcance.
