# Modelo de datos: Rediseñar presentación

Se conserva el modelo de [001](../001-presupuestos-profesionales/data-model.md). Solo cambia el objeto `Presupuesto`.

| Campo | Tipo | Regla |
|---|---|---|
| `status` | `DRAFT \| SENT \| ACCEPTED \| REJECTED` opcional | Nuevo presupuesto: `DRAFT`. Registro anterior sin campo: `DRAFT` al leer. |

Cambiar estado no altera número, fechas, cliente, líneas, snapshots, impuestos, totales ni `updatedAt`.

## Estado efectivo

| Estado conservado | Condición | Resultado visible |
|---|---|---|
| `DRAFT` | Vence hoy o después | Borrador |
| `SENT` | Vence hoy o después | Enviado |
| `ACCEPTED` | Cualquier fecha | Aceptado |
| `REJECTED` | Cualquier fecha | Rechazado |
| `DRAFT` o `SENT` | `validUntil` anterior a hoy | Caducado |

Caducado no se persiste. Inicio cuenta cada presupuesto una única vez usando este resultado. La comparación usa fechas civiles `AAAA-MM-DD`.

## Compatibilidad

- El almacén e índices `quotes` no cambian.
- No se reescriben presupuestos heredados al abrir la aplicación.
- Un valor de estado inválido devuelve un error local recuperable, sin asignar un valor arbitrario.
