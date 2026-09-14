# Contrato de operaciones de dominio

Este contrato define lo que la interfaz puede pedir al dominio local y el resultado observable. No existe API HTTP: todas las operaciones se ejecutan en el navegador y persisten en IndexedDB.

## Convenciones

- Las operaciones devuelven éxito o un error tipado; la interfaz traduce siempre el error a español de México junto al campo que debe corregirse.
- Ninguna operación envía datos por red.
- Los importes de salida son centavos enteros y moneda `MXN`.
- Los datos derivados se vuelven a calcular; no se aceptan totales introducidos desde la interfaz.

## `saveProfile(profile)`

**Entrada:** nombre completo, RFC, régimen, contacto opcional y logo opcional.

**Precondiciones:** nombre, RFC y régimen presentes; logo decodificable si se proporcionó.

**Resultado:** perfil global creado o reemplazado con nueva marca `updatedAt`.

**Garantía:** no modifica ningún presupuesto ya numerado.

## `createService(service)` / `updateService(id, service)`

**Entrada:** nombre y precio unitario predeterminado.

**Precondiciones:** nombre no vacío y precio mayor o igual a cero.

**Resultado:** plantilla disponible en el catálogo.

**Garantía:** editarla no cambia líneas que ya se copiaron a presupuestos.

## `deleteService(id)`

**Precondición:** el servicio existe.

**Resultado:** desaparece del catálogo.

**Garantía:** no elimina ni cambia líneas o presupuestos.

## `calculateQuote(input, taxRules)`

**Entrada:** tipo fiscal del cliente, lista de líneas y reglas fiscales actuales o congeladas.

**Precondiciones por línea:** descripción presente, cantidad mayor que cero y precio unitario no negativo.

**Resultado:** importes redondeados por línea, base, IVA, retenciones y total según [el modelo de datos](../data-model.md#cálculo-y-redondeo).

**Errores esperados:** descripción ausente, decimal inválido, cantidad no positiva o precio negativo. El cálculo no produce `NaN`, infinito ni un total parcial silencioso.

## `saveNewQuote(draft)`

**Entrada:** fecha de emisión, cliente, cero o más líneas y el perfil global vigente.

**Precondiciones:** cliente con nombre y tipo fiscal; perfil vigente con nombre completo, RFC y régimen; todas las líneas presentes válidas. Una lista vacía sí se puede guardar.

**Transacción única:**

1. Lee y aumenta la secuencia del año de emisión.
2. Reserva un número con año y consecutivo no utilizado, presentado con un mínimo de tres dígitos y sin truncarse después de 999.
3. Copia perfil, logo, régimen y tasas.
4. Calcula fechas y totales.
5. Guarda el presupuesto y la secuencia juntos.

**Resultado:** presupuesto persistido con número, fecha de emisión, vencimiento, perfil y tasas inmutables.

**Garantías:** si falla cualquier paso, no se consume número ni queda un presupuesto parcial; guardar otra vez el mismo presupuesto no asigna un segundo número.

## `updateQuote(savedQuote)`

**Entrada:** identificador de un presupuesto guardado y cambios de cliente o líneas.

**Precondiciones:** presupuesto existente y datos editables válidos.

**Resultado:** cliente, líneas, totales y `updatedAt` actualizados.

**Garantías:** conserva `number`, `issuedOn`, `validUntil`, `professionalSnapshot`, `taxSnapshot` y `createdAt`; no crea revisión ni historial.

## `listClientSuggestions()`

**Entrada:** ninguna; usa solo presupuestos guardados.

**Resultado:** una sugerencia por la clave definida en [ClientePresupuesto](../data-model.md#clientepresupuesto), tomada del presupuesto guardado más recientemente y ordenada para búsqueda legible.

**Garantía:** elegir una sugerencia devuelve una copia. Editarla no modifica el presupuesto fuente.

## `generateQuotePdf(id)`

**Precondiciones:** presupuesto existente sin cambios pendientes de guardar, al menos una línea y datos obligatorios del perfil congelado presentes.

**Resultado:** descarga o apertura local de `{number}.pdf` con todos los campos definidos en FR-029 y la etiqueta visible `MXN`.

**Garantía:** la descarga usa la última versión guardada y no guarda ni descarta cambios del editor. Si existen cambios pendientes, la interfaz bloquea la descarga y explica que deben guardarse primero.

**Garantías:**

- No escribe una versión nueva, no bloquea la edición y no cambia el número.
- Repite el encabezado de la tabla en páginas de continuación.
- Coloca los totales después de la última línea, creando una página adicional cuando sea necesario.
- Sin retenciones aplicables, lo indica con importe cero o una leyenda clara.
- Sin logo, conserva el espacio y alineación correctos sin mostrar una imagen rota.

**Errores observables:** “Agrega al menos un concepto antes de descargar el PDF” para presupuesto vacío; “Guarda los cambios antes de descargar el PDF” para un editor modificado; mensaje específico si faltan nombre, RFC o régimen del perfil; mensaje recuperable si el navegador impide la descarga.

## Operaciones que deliberadamente no existen

No hay contratos para iniciar sesión, sincronizar, respaldar en nube, enviar correo, emitir factura, eliminar/archivar/restaurar presupuestos ni administrar versiones. Incorporarlos requeriría actualizar la especificación.
