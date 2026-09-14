# Modelo de datos: PresupuestosPro v0

## Criterio general

La v0 guarda todo dentro del navegador del usuario. El modelo evita tablas que no aportan valor al alcance actual: el cliente, las líneas, el perfil congelado y las tasas viven dentro de cada presupuesto. Así, un cambio posterior en el perfil o en el catálogo no altera documentos ya numerados.

Los identificadores internos se crean con `crypto.randomUUID()`. Las fechas de negocio usan `AAAA-MM-DD` y no incluyen zona horaria; las marcas técnicas de creación y actualización usan ISO 8601. Los valores introducidos de cantidad y precio se conservan como texto decimal normalizado, y los resultados monetarios se guardan como centavos enteros para evitar errores binarios.

## Relación entre entidades

```text
Perfil profesional actual ──se copia al guardar──▶ Presupuesto
Servicio de catálogo ───────se copia al elegir──▶ Línea del presupuesto
Presupuesto guardado ───────sirve como fuente───▶ Sugerencia de cliente
Secuencia anual ────────────asigna una vez──────▶ Número de presupuesto
```

No hay relación viva después de copiar: editar el origen nunca modifica el presupuesto existente.

## Entidades persistidas

### PerfilProfesional

Registro único con clave fija `current`.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | literal `current` | Garantiza un único perfil local. |
| `fullName` | texto | Obligatorio, sin espacios exteriores. |
| `rfc` | texto | Obligatorio; se conserva para mostrar y se compara normalizado en mayúsculas. La v0 no consulta al SAT. |
| `email` | texto opcional | Se omite si está vacío. |
| `phone` | texto opcional | Se omite si está vacío. |
| `address` | texto opcional | Se omite si está vacío. |
| `logo` | `LogoAsset` opcional | Imagen local normalizada a un formato compatible con pantalla y PDF. |
| `taxRegime` | `RESICO \| PROFESSIONAL_SERVICES` | Obligatorio. |
| `updatedAt` | instante ISO 8601 | Última edición del perfil global. |

`LogoAsset` contiene `mimeType`, los bytes de imagen (`Blob`) y dimensiones. No guarda una URL externa ni sube el archivo a ningún servicio.

El perfil solo se persiste cuando `fullName`, `rfc` y `taxRegime` son válidos. Los campos opcionales pueden omitirse sin impedir el guardado.

### ServicioCatalogo

| Campo | Tipo | Regla |
|---|---|---|
| `id` | UUID | Identidad local estable. |
| `name` | texto | Obligatorio después de recortar espacios. |
| `defaultUnitPrice` | texto decimal | Cero o mayor; moneda fija MXN. |
| `createdAt` | instante ISO 8601 | Se fija al crear. |
| `updatedAt` | instante ISO 8601 | Cambia al editar. |

Eliminar un servicio solo elimina esta plantilla. Las líneas copiadas en presupuestos permanecen intactas.

### SecuenciaAnual

| Campo | Tipo | Regla |
|---|---|---|
| `year` | entero de cuatro dígitos | Clave primaria, obtenida de la fecha de emisión. |
| `lastAssigned` | entero positivo | Último consecutivo reservado; nunca disminuye. |
| `updatedAt` | instante ISO 8601 | Momento de la última asignación. |

La actualización de esta entidad y el primer guardado del presupuesto ocurren en una sola transacción local. Esto evita números duplicados sin introducir un servidor.

### Presupuesto

| Campo | Tipo | Regla |
|---|---|---|
| `id` | UUID | Identidad interna; no se muestra como número comercial. |
| `number` | texto `AAAA-` + consecutivo | Único e inmutable después del primer guardado; el consecutivo usa un mínimo de tres dígitos y crece sin truncarse después de 999. |
| `sequenceYear` | entero | Año de la fecha de emisión inicial. |
| `sequenceNumber` | entero | Consecutivo que forma `number`, con al menos tres dígitos al presentar. |
| `issuedOn` | fecha `AAAA-MM-DD` | Editable antes del primer guardado; después es inmutable. |
| `validUntil` | fecha `AAAA-MM-DD` | `issuedOn` más 30 días naturales; queda fija con la emisión. |
| `client` | `ClientePresupuesto` | Copia editable e independiente dentro del documento. |
| `lines` | lista de `LineaPresupuesto` | Puede estar vacía para conservar un borrador; en ese caso no hay PDF. |
| `professionalSnapshot` | `PerfilCongelado` | Copia completa del perfil y logo tomada solo en el primer guardado. |
| `taxSnapshot` | `ReglasFiscalesCongeladas` | Régimen y tasas tomados en el primer guardado. |
| `totals` | `Totales` | Resultado determinista recalculado al guardar cualquier edición. |
| `createdAt` | instante ISO 8601 | Primer guardado. |
| `updatedAt` | instante ISO 8601 | Último guardado de cambios; permite elegir el dato de cliente más reciente. |

No existen campos de eliminación, archivo, revisión o historial. La descarga tampoco cambia el estado del presupuesto.

Los cambios pendientes del editor no forman parte de `Presupuesto`: `isDirty` es un estado transitorio derivado al comparar el formulario con la última versión cargada o guardada. Guardar actualiza la entidad y restablece `isDirty`; descargar está permitido únicamente cuando es falso.

#### ClientePresupuesto

| Campo | Tipo | Regla |
|---|---|---|
| `name` | texto | Nombre o razón social obligatorio. |
| `taxPersonType` | `INDIVIDUAL \| LEGAL_ENTITY` | Persona física o persona moral. |
| `rfc` | texto opcional | Si existe, identifica la sugerencia reutilizable. |
| `email` | texto opcional | Contacto libre. |
| `phone` | texto opcional | Contacto libre. |
| `address` | texto opcional | Contacto libre. |

La clave de sugerencia no se persiste como catálogo:

- Con RFC: `rfc:` + RFC recortado y convertido a mayúsculas.
- Sin RFC: `name:` + nombre recortado, espacios internos consecutivos colapsados y minúsculas + `taxPersonType`.
- Un registro con RFC nunca se agrupa con uno sin RFC; RFC distintos siempre permanecen separados.
- Por cada clave se ofrece el cliente del presupuesto con `updatedAt` más reciente.

#### LineaPresupuesto

| Campo | Tipo | Regla |
|---|---|---|
| `id` | UUID | Permite editar o quitar una línea concreta. |
| `sourceServiceId` | UUID opcional | Solo referencia informativa al origen; no se usa para sincronizar. |
| `description` | texto | Obligatorio después de recortar espacios. |
| `quantity` | texto decimal | Debe ser mayor que cero. |
| `unitPrice` | texto decimal | Debe ser cero o mayor. |
| `amountCents` | entero no negativo | Cantidad por precio, redondeada al centavo antes de sumarse. |

#### PerfilCongelado

Copia de todos los campos visibles de un `PerfilProfesional` válido, incluido el contenido del logo, además de `capturedAt`. Siempre contiene nombre completo, RFC y régimen, y no conserva una referencia al perfil global.

#### ReglasFiscalesCongeladas

| Campo | Tipo | Valor en v0 |
|---|---|---|
| `taxRegime` | enum | Régimen elegido al primer guardado. |
| `vatRate` | texto decimal | `0.16` |
| `incomeTaxWithholdingRate` | texto decimal | `0.0125` para RESICO; `0.10` para Servicios Profesionales. |
| `vatWithholdingNumerator` | entero | `2` |
| `vatWithholdingDenominator` | entero | `3` |
| `capturedAt` | instante ISO 8601 | Primer guardado. |

Las tasas son datos versionados dentro del presupuesto, no opciones de usuario. Un cambio normativo exige una nueva especificación.

#### Totales

| Campo | Tipo | Regla |
|---|---|---|
| `subtotalCents` | entero | Suma de importes de línea ya redondeados. |
| `vatCents` | entero | 16 % de la base, redondeado por separado. |
| `incomeTaxWithholdingCents` | entero | Según régimen, solo para persona moral; cero para persona física. |
| `vatWithholdingCents` | entero | Dos terceras partes del IVA, solo para persona moral; cero para persona física. |
| `totalCents` | entero | Base + IVA − ISR retenido − IVA retenido. |
| `currency` | literal `MXN` | Moneda única de la v0. |

## Cálculo y redondeo

Todas las operaciones usan aritmética decimal y redondeo `ROUND_HALF_UP` a dos decimales, que en un empate de medio centavo se aleja de cero.

1. Cada línea: `round(quantity × unitPrice, 2)`.
2. Base: suma de líneas ya redondeadas.
3. IVA: `round(base × 0.16, 2)`.
4. Persona moral: ISR `round(base × tasa congelada, 2)` e IVA retenido `round(IVA × 2 ÷ 3, 2)`.
5. Persona física: ambas retenciones son cero.
6. Total: base + IVA − retenciones, usando los importes ya redondeados.

La interfaz presenta los centavos con `Intl.NumberFormat` para `es-MX`, `MXN` y dos decimales. El PDF incluye además la etiqueta visible `MXN`.

## Estados y transiciones

```text
Nuevo en pantalla (sin número)
  └─ Guardar por primera vez ─▶ Guardado y numerado
                                  ├─ Editar ──────────▶ cambios pendientes; PDF bloqueado
                                  │                      └─ Guardar ─▶ mismo número, datos vigentes
                                  ├─ Descargar PDF ───▶ mismo estado y número
                                  └─ Sin líneas ──────▶ permanece guardado; PDF bloqueado
```

- La fecha de emisión solo cambia antes de la primera transición.
- El perfil y las tasas se congelan en esa transición.
- Las líneas, el cliente y los totales pueden cambiar después y se guardan juntos.
- La descarga usa únicamente la última versión guardada; nunca persiste ni descarta cambios del editor.
- No hay transiciones para eliminar, archivar, restaurar, enviar o crear versiones.

## Almacenes locales e índices

Una sola base IndexedDB contiene cuatro colecciones:

| Colección | Clave/índices mínimos | Motivo |
|---|---|---|
| `profile` | `id` | Un registro actual. |
| `services` | `id`, `updatedAt` | CRUD y orden reciente. |
| `quotes` | `id`, único `number`, `sequenceYear`, `updatedAt` | Lista, unicidad y sugerencias. |
| `annualSequences` | `year` | Asignación transaccional. |

No se separan clientes, líneas, totales ni snapshots en colecciones adicionales. El volumen de la v0 permite derivar sugerencias recorriendo presupuestos locales y mantiene el modelo fácil de entender y migrar.
