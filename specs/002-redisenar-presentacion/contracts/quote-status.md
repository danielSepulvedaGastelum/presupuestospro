# Contrato local de estados

No existe API HTTP: las operaciones se ejecutan en el navegador e IndexedDB.

## `getEffectiveQuoteStatus(quote, today)`

Devuelve Borrador, Enviado, Aceptado, Rechazado o Caducado según [data-model.md](../data-model.md#estado-efectivo). No escribe datos; Aceptado y Rechazado prevalecen; la ausencia de estado equivale a Borrador.

## `setQuoteStatus(id, status)`

Actualiza el estado conservado de un presupuesto existente con Borrador, Enviado, Aceptado o Rechazado. Conserva número, fechas, cliente, líneas, snapshots, cálculos, totales y `updatedAt`. Si falla, devuelve un error recuperable y no cambia el estado visible confirmado.

## Límites

No hay envío real, aceptación contractual, firma, historial de estados, cuenta, nube, archivo ni borrado. Los cuatro estados conservados son una clasificación local elegida por el usuario.
