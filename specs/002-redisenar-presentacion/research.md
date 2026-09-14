# Investigación: Rediseñar presentación

## Navegación

**Decision**: Añadir `home` al estado local de sección y hacerlo predeterminado.

**Rationale**: La raíz ya sirve una SPA y `App.tsx` ya mantiene navegación, foco y carga de datos. No hacen falta URLs profundas.

**Alternatives considered**: Router o HTML independientes; añaden complejidad sin requisito.

## Sistema visual

**Decision**: Crear `presentation/design-tokens.ts` con paleta, espaciado y tipografía; el arranque aplica sus valores como variables CSS y el PDF importa los mismos valores.

**Rationale**: CSS no se aplica a `pdfmake`; un módulo compartido es la única fuente real de valores entre web y PDF.

**Alternatives considered**: Hexadecimales duplicados o una biblioteca visual; rompen coherencia o añaden peso.

## Estado persistente compatible

**Decision**: Añadir `status?: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED'` a `SavedQuote`. Los registros sin campo son Borrador y los nuevos empiezan en Borrador; no hay migración masiva, almacén ni índice nuevos.

**Rationale**: IndexedDB acepta el campo nuevo en objetos existentes y conserva todos los registros históricos.

**Alternatives considered**: Almacén adicional, migración de todos los registros o derivar los cinco estados; añaden complejidad o no permiten los estados elegidos.

## Estado efectivo

**Decision**: Una función pura muestra Caducado solo si Borrador o Enviado vencieron; Aceptado y Rechazado prevalecen siempre. Inicio, lista, editor y PDF la usan.

**Rationale**: Es la aclaración aprobada y evita persistir un dato dependiente del día.

**Alternatives considered**: Guardar Caducado o sobrescribir estados finales; generan datos obsoletos o contradicen la spec.

## Cambio de estado

**Decision**: Exponer una operación local separada para cambiar estado desde presupuestos guardados. No modifica importes, snapshots, fechas, número ni `updatedAt`, que ya afecta la sugerencia de cliente.

**Rationale**: Evita efectos no solicitados en cálculos y reutilización.

**Alternatives considered**: Mezclar estado con el guardado del editor; podría perder cambios pendientes o alterar la semántica de actualización existente.
