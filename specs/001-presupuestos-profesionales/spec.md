# Feature Specification: PresupuestosPro v0

**Feature Branch**: `N/A (proyecto sin repositorio Git)`

**Created**: 2026-09-09

**Status**: Draft

**Input**: Herramienta local en español de México para que un profesional independiente cree, conserve y descargue presupuestos profesionales en MXN con su marca, catálogo de servicios, reutilización de clientes y cálculo fiscal para RESICO o Servicios Profesionales.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un presupuesto correcto (Priority: P1)

Como profesional independiente, quiero registrar los datos de un cliente y agregar conceptos de servicio para obtener de inmediato un total correcto, sin hacer cálculos fiscales manuales.

**Why this priority**: Es el valor principal del producto y permite sustituir la hoja de cálculo incluso antes de incorporar la presentación final en PDF.

**Independent Test**: Se puede probar creando un presupuesto con líneas manuales, cambiando el tipo fiscal del cliente y el régimen del profesional, y comprobando que importes y retenciones coinciden al centavo con los ejemplos definidos.

**Acceptance Scenarios**:

1. **Given** un perfil en RESICO, un cliente persona moral y conceptos por $2,000.00, **When** se calcula el presupuesto, **Then** se muestran base de $2,000.00, IVA de $320.00, retención de ISR de $25.00, retención de IVA de $213.33 y total de $2,081.67.
2. **Given** un perfil en Servicios Profesionales, un cliente persona moral y conceptos por $2,000.00, **When** se calcula el presupuesto, **Then** se muestran base de $2,000.00, IVA de $320.00, retención de ISR de $200.00, retención de IVA de $213.33 y total de $1,906.67.
3. **Given** cualquiera de los dos regímenes y un cliente persona física, con conceptos por $2,000.00, **When** se calcula el presupuesto, **Then** no se aplica ninguna retención y el total es $2,320.00.
4. **Given** un presupuesto con conceptos, **When** el usuario cambia el régimen del perfil o el tipo fiscal del cliente, **Then** las retenciones y el total se actualizan automáticamente.
5. **Given** un presupuesto con varias líneas, **When** el usuario edita o elimina una línea, **Then** todos los importes se recalculan automáticamente.

---

### User Story 2 - Descargar un PDF profesional (Priority: P2)

Como profesional independiente, quiero descargar el presupuesto en PDF con mi identidad y todos sus datos para enviarlo directamente a mi cliente.

**Why this priority**: Convierte el cálculo en un documento presentable y utilizable en el flujo real de venta.

**Independent Test**: Se puede probar configurando un perfil con logo, guardando un presupuesto con al menos una línea y verificando visualmente el contenido del PDF descargado.

**Acceptance Scenarios**:

1. **Given** un perfil con logo y un presupuesto guardado con al menos una línea, **When** se descarga el PDF, **Then** el documento muestra el logo, los datos de ambas partes, el número, las fechas, las líneas, los impuestos, las retenciones aplicables y el total.
2. **Given** un presupuesto sin líneas, **When** se intenta descargar el PDF, **Then** no se genera el documento y se informa claramente que debe agregarse al menos una línea.
3. **Given** un presupuesto guardado y posteriormente editado, **When** se vuelve a descargar, **Then** el nuevo PDF conserva el mismo número y refleja la información vigente.

---

### User Story 3 - Numerar y conservar presupuestos (Priority: P3)

Como profesional independiente, quiero que cada presupuesto reciba un número único al guardarlo y siga disponible al volver a abrir la aplicación.

**Why this priority**: Evita duplicados y pérdidas de información, y permite mantener continuidad entre sesiones de trabajo.

**Independent Test**: Se puede probar guardando varios presupuestos, cerrando y abriendo de nuevo la aplicación y comprobando sus números, contenido y orden anual.

**Acceptance Scenarios**:

1. **Given** que no existen presupuestos del año 2026, **When** se guarda por primera vez un presupuesto con fecha de emisión de 2026, **Then** recibe el número `2026-001`.
2. **Given** que `2026-001` ya fue asignado, **When** se guarda otro presupuesto de 2026, **Then** recibe `2026-002`.
3. **Given** que existen presupuestos de 2026, **When** se guarda el primer presupuesto de 2027, **Then** recibe `2027-001`.
4. **Given** un presupuesto numerado, **When** se edita o se vuelve a descargar, **Then** conserva su número original.
5. **Given** datos previamente guardados, **When** se cierra y vuelve a abrir la aplicación en el mismo equipo y entorno local, **Then** el perfil, los servicios y los presupuestos continúan disponibles.

---

### User Story 4 - Reutilizar información habitual (Priority: P4)

Como profesional independiente, quiero reutilizar servicios y datos de clientes anteriores para preparar nuevos presupuestos con menos escritura repetitiva.

**Why this priority**: Reduce el tiempo de preparación después de que el flujo esencial de creación y descarga ya funciona.

**Independent Test**: Se puede probar creando un servicio y un presupuesto previo, y después incorporando ambos datos en un presupuesto nuevo sin volver a capturarlos completos.

**Acceptance Scenarios**:

1. **Given** un servicio guardado con precio predeterminado, **When** se selecciona al agregar una línea, **Then** su descripción y precio se copian a la nueva línea y pueden ajustarse sin modificar el catálogo.
2. **Given** un cliente utilizado en un presupuesto anterior, **When** se elige para un presupuesto nuevo, **Then** sus datos se copian al nuevo presupuesto sin crear un catálogo independiente de clientes.
3. **Given** datos de cliente copiados desde un presupuesto anterior, **When** se editan en el presupuesto nuevo, **Then** el presupuesto anterior permanece sin cambios.
4. **Given** el catálogo de servicios, **When** el usuario crea, edita o elimina un servicio, **Then** los presupuestos ya guardados conservan las líneas que habían copiado de ese servicio.

### Edge Cases

- Un presupuesto vacío se puede conservar como borrador, pero no puede descargarse en PDF.
- Una línea puede escribirse manualmente aunque no exista en el catálogo.
- La cantidad debe ser mayor que cero; el precio unitario puede ser cero, pero no negativo.
- Una línea cuyo cálculo produzca fracciones de centavo se redondea antes de incorporarse a la base.
- Si el cliente cambia de persona moral a persona física, ambas retenciones desaparecen automáticamente.
- Si el cliente cambia de persona física a persona moral, las retenciones correspondientes al régimen activo aparecen automáticamente.
- Si un presupuesto ya numerado deja de utilizarse, su número no se reutiliza y puede quedar un hueco en la secuencia.
- Los presupuestos de años distintos mantienen secuencias independientes.
- Si no se configuró un logo, el PDF se genera sin logo y conserva correctamente el resto del diseño e información.
- Si se selecciona un cliente previo con datos desactualizados, el usuario puede corregir la copia sin alterar presupuestos históricos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema debe permitir guardar y editar un perfil con nombre completo, RFC, correo electrónico, teléfono, domicilio, logo y régimen fiscal.
- **FR-002**: El nombre completo, el RFC y el régimen fiscal son obligatorios para descargar un presupuesto; los demás datos del perfil son opcionales.
- **FR-003**: El régimen fiscal del perfil debe poder ser `RESICO` o `Servicios Profesionales`.
- **FR-004**: El sistema debe permitir crear, editar y eliminar servicios del catálogo, cada uno con nombre y precio unitario predeterminado en MXN.
- **FR-005**: El sistema debe permitir crear un presupuesto con nombre o razón social del cliente, tipo fiscal y, opcionalmente, RFC y datos de contacto.
- **FR-006**: El tipo fiscal del cliente debe poder ser `persona moral` o `persona física`; esta última incluye tanto particulares como personas físicas con actividad económica para el alcance de la v0.
- **FR-007**: El usuario debe poder reutilizar en un presupuesto nuevo los datos de clientes presentes en presupuestos anteriores, sin mantener un catálogo independiente de clientes.
- **FR-008**: Los datos reutilizados deben copiarse al nuevo presupuesto; modificarlos no debe alterar presupuestos anteriores.
- **FR-009**: Cada línea debe poder originarse en el catálogo o capturarse manualmente, y debe contener descripción, cantidad y precio unitario.
- **FR-010**: Al elegir un servicio del catálogo, su nombre y precio deben copiarse a la línea y poder editarse sin modificar el servicio original.
- **FR-011**: El sistema debe permitir agregar, editar y eliminar líneas antes y después de guardar un presupuesto.
- **FR-012**: El sistema debe rechazar líneas sin descripción, con cantidad menor o igual que cero o con precio unitario negativo, mostrando una explicación comprensible.
- **FR-013**: El importe de cada línea debe ser cantidad por precio unitario, redondeado al centavo más cercano; la base debe ser la suma de los importes de línea ya redondeados.
- **FR-014**: El IVA trasladado debe ser el 16 % de la base, redondeado al centavo más cercano.
- **FR-015**: Para un cliente persona moral y un perfil RESICO, la retención de ISR debe ser el 1.25 % de la base.
- **FR-016**: Para un cliente persona moral y un perfil en Servicios Profesionales, la retención de ISR debe ser el 10 % de la base.
- **FR-017**: Para un cliente persona moral, la retención de IVA debe ser dos terceras partes del IVA trasladado.
- **FR-018**: Para un cliente persona física no debe aplicarse retención de ISR ni de IVA, con independencia del régimen del perfil.
- **FR-019**: Cada impuesto o retención debe redondearse por separado al centavo más cercano antes de calcular el total.
- **FR-020**: El total debe ser base más IVA trasladado, menos ISR retenido y menos IVA retenido.
- **FR-021**: Los cálculos deben actualizarse automáticamente al cambiar líneas, tipo de cliente o régimen fiscal.
- **FR-022**: Todos los importes deben mostrarse en pesos mexicanos con dos decimales y una identificación visible de la moneda MXN.
- **FR-023**: Al guardar un presupuesto por primera vez, el sistema debe asignar un número con formato `AAAA-NNN`, usando el año de la fecha de emisión y el siguiente consecutivo disponible para ese año.
- **FR-024**: La fecha de emisión debe proponerse como la fecha actual y poder ajustarse antes del primer guardado; al guardarse por primera vez, la fecha de emisión y el número quedan fijos.
- **FR-025**: Los números asignados deben ser únicos, no deben cambiar ni reutilizarse, incluso si queda un hueco porque un presupuesto numerado deja de utilizarse.
- **FR-026**: La secuencia debe reiniciarse en `001` al cambiar el año de emisión.
- **FR-027**: La fecha de vencimiento debe calcularse como 30 días naturales después de la fecha de emisión.
- **FR-028**: El sistema debe impedir la descarga en PDF cuando el presupuesto no tenga líneas y debe explicar cómo corregirlo.
- **FR-029**: El PDF debe incluir, cuando estén disponibles, logo y datos del profesional; además debe incluir los datos del cliente, número, fecha de emisión, fecha de vencimiento, tabla de líneas, base, IVA, cada retención aplicable y total.
- **FR-030**: Cuando no aplique ninguna retención, el PDF debe indicarlo claramente sin restar importe alguno.
- **FR-031**: El perfil, el logo, el catálogo de servicios, los presupuestos, sus clientes copiados y las secuencias anuales deben permanecer disponibles tras cerrar y volver a abrir la aplicación en el mismo equipo y entorno local.
- **FR-032**: La aplicación debe funcionar sin cuenta de usuario, contraseña ni almacenamiento en la nube.
- **FR-033**: La aplicación debe presentar textos y mensajes en español de México y evitar terminología fiscal española como NIF, autónomo o IRPF.

### Business Rules and Calculation Examples

- Para una base de $2,000.00, el IVA trasladado es $320.00.
- En RESICO ante persona moral: ISR retenido $25.00, IVA retenido $213.33 y total $2,081.67.
- En Servicios Profesionales ante persona moral: ISR retenido $200.00, IVA retenido $213.33 y total $1,906.67.
- Ante persona física: ISR retenido $0.00, IVA retenido $0.00 y total $2,320.00.
- Las reglas fiscales quedan fijadas para esta versión de la especificación. Un cambio normativo requiere revisar y aprobar la especificación antes de modificar los cálculos.

### Scope Boundaries

- El producto genera presupuestos; no genera facturas, CFDI ni declaraciones fiscales.
- No cubre regímenes distintos de RESICO y Servicios Profesionales.
- No cubre tasas de IVA diferentes del 16 %, servicios exentos, tasa cero, estímulos fronterizos, plataformas digitales, arrendamiento, comisiones, operaciones internacionales ni otros supuestos especiales.
- No determina si una persona puede tributar en un régimen ni sustituye la revisión de un profesional fiscal.
- No incluye cuentas, autenticación, sincronización o respaldo en la nube.
- No incluye catálogo independiente de clientes, multidivisa, envío por correo, descuentos ni facturación electrónica.

### Key Entities

- **Perfil profesional**: Identidad y datos de contacto que aparecen en los presupuestos; contiene el RFC, logo y régimen fiscal que gobierna la retención de ISR.
- **Servicio de catálogo**: Servicio reutilizable con nombre y precio predeterminado; sirve como plantilla para nuevas líneas y no mantiene vínculo con ellas después de copiarse.
- **Presupuesto**: Documento de trabajo con número, fechas, cliente, líneas, importes calculados y estado de guardado; conserva una copia completa de la información usada.
- **Cliente del presupuesto**: Copia de nombre o razón social, tipo fiscal, RFC y contacto dentro de un presupuesto; puede reutilizarse en otro sin constituir un catálogo independiente.
- **Línea de presupuesto**: Concepto concreto con descripción, cantidad, precio unitario e importe calculado; puede proceder del catálogo o ser manual.
- **Secuencia anual**: Registro del último consecutivo asignado por año; garantiza números únicos e impide reutilizarlos.

### Assumptions and Dependencies

- El profesional es una persona física residente en México que presta servicios personales independientes gravados con IVA del 16 %.
- El cliente persona moral se encuentra en México y está obligado a efectuar las retenciones modeladas; el cliente persona física no las efectúa dentro del alcance de esta versión.
- Las tasas seleccionadas corresponden a los supuestos generales modelados: ISR del 1.25 % para RESICO, ISR del 10 % para Servicios Profesionales y retención de dos terceras partes del IVA ante persona moral.
- Los cálculos del presupuesto son una estimación comercial y fiscal; la aplicación no valida la situación tributaria real de las partes.
- El usuario es responsable de elegir el régimen y tipo fiscal correctos y de mantener una copia de seguridad de sus datos locales.
- Se usa redondeo monetario convencional al centavo más cercano; cuando una cantidad queda exactamente a medio centavo, se redondea alejándose de cero.
- La referencia normativa consultada para esta versión comprende los [artículos 1 y 1-A de la Ley del IVA](https://wwwmat.sat.gob.mx/articulo/19848/articulo-1), el [artículo 3 de su Reglamento](https://www.diputados.gob.mx/LeyesBiblio/regley/Reg_LIVA_250914.pdf) y los artículos [106](https://wwwmatnp.sat.gob.mx/articulo/36658/articulo-106) y [113-J](https://wwwmatnp.sat.gob.mx/articulo/59511/articulo-113-j) de la Ley del ISR, vigentes al redactar esta especificación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario no técnico puede configurar su perfil, crear un presupuesto de dos líneas y descargarlo en menos de 5 minutos en su primer intento guiado únicamente por los textos visibles.
- **SC-002**: El 100 % de los escenarios fiscales de referencia produce exactamente los totales $2,081.67, $1,906.67 y $2,320.00, según régimen y tipo de cliente.
- **SC-003**: En una prueba de 20 presupuestos distribuidos entre dos años, el 100 % recibe un número único, consecutivo dentro de su año y nunca reutilizado.
- **SC-004**: El 100 % de las ediciones y eliminaciones de líneas actualiza todos los importes visibles sin que el usuario tenga que solicitar un recálculo.
- **SC-005**: El 100 % de los PDF generados en los escenarios aceptados contiene número, fechas, ambas partes, líneas, moneda, base, IVA, retenciones aplicables y total; si existe un logo configurado, también lo contiene.
- **SC-006**: Después de cerrar y volver a abrir la aplicación en el mismo entorno local, el 100 % de los datos de una prueba con un perfil, cinco servicios y diez presupuestos continúa disponible y sin cambios.
- **SC-007**: Al menos 9 de cada 10 usuarios de una prueba de usabilidad completan un presupuesto válido y entienden por qué se aplican o no las retenciones sin ayuda externa.
- **SC-008**: Ningún intento de descargar un presupuesto vacío produce un PDF; el 100 % muestra una indicación clara para agregar una línea.
