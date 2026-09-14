# Contrato de experiencia y flujo

## Estructura visible

La aplicación ofrece tres áreas principales, sin pantalla de acceso:

1. **Presupuestos**: lista local, creación y edición.
2. **Servicios**: catálogo reutilizable.
3. **Mi perfil**: identidad, contacto, logo y régimen.

No se añade panel administrativo, ajustes técnicos ni navegación profunda. En móvil, la navegación permanece alcanzable y cada pantalla usa una sola columna; en anchos mayores puede aprovechar dos columnas sin cambiar el orden de lectura.

## Primer uso

- Se muestra una explicación breve: “Tus datos se guardan solo en este navegador”.
- La acción principal lleva a completar **Mi perfil**.
- Nombre completo, RFC y régimen muestran su obligatoriedad antes de guardar.
- Al terminar, la acción principal es **Crear presupuesto**; el catálogo vacío no impide escribir líneas manuales.

La aplicación no promete sincronización ni recuperación en otro navegador o dominio.

## Lista de presupuestos

Cada elemento muestra número, cliente, fecha de emisión, total en MXN y última actualización. Sus únicas acciones son **Abrir/editar** y **Descargar PDF** cuando procede.

- No aparece menú de eliminar o archivar.
- Un presupuesto vacío permanece visible como borrador numerado y su acción de PDF explica que debe añadirse una línea.
- Crear uno nuevo abre un formulario sin número; la fecha actual viene propuesta.

## Editor de presupuesto

Orden de lectura y teclado:

1. Cabecera con número si ya fue guardado, fecha de emisión y vencimiento calculado.
2. Cliente: búsqueda de clientes previos, nombre, tipo fiscal, RFC y contacto.
3. Conceptos: selector opcional del catálogo y captura manual.
4. Resumen: base, IVA, ISR retenido, IVA retenido, total y una explicación breve que relacione las retenciones con el tipo de cliente y el régimen congelado o vigente.
5. Acciones **Guardar** y **Descargar PDF**.

**Descargar PDF** solo está disponible cuando el presupuesto está guardado, contiene al menos una línea y no tiene cambios pendientes. Si existen cambios sin guardar, la interfaz solicita guardarlos antes de descargar y no genera un documento con datos anteriores.

Antes del primer guardado, cambiar fecha, régimen vigente, cliente o líneas recalcula el resultado. Después, la fecha, el número, el perfil y las tasas se muestran como datos del documento y el cálculo usa la copia congelada.

Elegir un servicio o cliente solo rellena una copia editable. La interfaz no usa textos como “sincronizado” o “vinculado”.

### Comportamiento móvil

- Los conceptos se presentan como tarjetas apiladas, no como una tabla horizontal que obligue a desplazar la página lateralmente.
- Cantidad y precio usan teclado decimal (`inputmode="decimal"`) y muestran siempre su etiqueta.
- Las acciones táctiles tienen al menos 44 × 44 CSS px y no dependen solo del color.
- El resumen se mantiene legible sin ocultar conceptos; no se requiere gesto especial.
- El diseño base funciona a 320 CSS px y mejora progresivamente en pantallas mayores.

## Catálogo de servicios

- Formulario corto: nombre y precio predeterminado en MXN.
- Cada servicio ofrece **Editar** y **Eliminar** con confirmación clara.
- La confirmación explica que los presupuestos existentes no cambiarán.
- No hay categorías, filtros avanzados, importación ni precios por moneda.

## Perfil

- Campos: nombre completo, RFC, correo, teléfono, domicilio, logo y régimen.
- El selector de régimen solo contiene **RESICO** y **Servicios Profesionales**.
- Al guardar cambios, se informa: “Se usarán en presupuestos nuevos; los ya guardados conservarán sus datos”.
- El logo es opcional; se muestra una vista previa y se puede reemplazar o quitar del perfil global.

## Mensajes y formato

- Todo texto visible está en español de México: “RFC”, “persona física”, “persona moral”, “presupuesto”, “IVA” e “ISR”.
- La interfaz y el PDF no usan `NIF`, `autónomo`, `IRPF` ni términos fiscales propios de otros mercados.
- Los importes usan dos decimales y muestran `MXN` de forma inequívoca.
- Los errores se ubican junto al campo y se resumen al intentar guardar; conservan lo que el usuario ya capturó.
- Los estados de guardado o descarga se anuncian en texto y a tecnologías de asistencia.
- El foco se mueve al primer error o al título del resultado, según corresponda.

## PDF observable

El documento incluye, en este orden general: marca y profesional, título y número, fechas, cliente, tabla de conceptos, desglose fiscal y total. La tabla puede ocupar varias páginas; cada continuación repite su encabezado y el bloque de totales aparece una sola vez tras la última línea.

El PDF usa la copia guardada del perfil y las tasas, no los valores globales actuales.

## Verificación del contrato

Una persona no técnica puede validar este contrato siguiendo [quickstart.md](../quickstart.md). La comprobación se hace desde la interfaz y el PDF descargado; no requiere revisar IndexedDB ni leer código.
