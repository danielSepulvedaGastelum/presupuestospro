# Guía de validación: Rediseñar presentación

## Ejecutar

```powershell
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
npm run dev
```

No se necesita cuenta, secreto ni servicio externo.

## Registro de comprobación automatizada

- 2026-09-11: `typecheck`, 25 pruebas unitarias, build y las 33 pruebas E2E de Chromium de escritorio, Chromium móvil y WebKit móvil superados. Se corrigieron la entrada de Inicio y el desbordamiento horizontal al simular texto al 200 %.

## Inicio y navegación

1. Abrir la raíz: aparece Inicio con cinco contadores; todos son cero sin presupuestos.
2. Navegar a Presupuestos, Servicios y Mi perfil, y volver a Inicio sin usar Atrás.
3. Confirmar que el destino activo es perceptible.

**Cobertura**: FR-001--FR-005, FR-022--FR-027, FR-036, FR-040 y FR-042; SC-001--SC-003.

## Estados e integridad

1. Crear y guardar un presupuesto: comienza Borrador.
2. Cambiarlo a Enviado, Aceptado y Rechazado, recargando después de cada cambio para confirmar persistencia.
3. Confirmar que Borrador o Enviado vencidos se ven y cuentan Caducados; Aceptado y Rechazado permanecen finales.
4. Abrir un presupuesto heredado sin estado: se muestra Borrador y conserva todos sus datos.
5. Repetir los escenarios fiscales de 001 y confirmar que totales, números, snapshots y bloqueo de PDF no cambian.

**Cobertura**: FR-006, FR-016--FR-017, FR-021, FR-032--FR-035, FR-037 y FR-043; SC-004 y SC-006.

## Diseño, PDF y accesibilidad

1. Verificar jerarquía uniforme, campos distinguibles y etiqueta textual para cada estado en las cuatro secciones.
2. Descargar PDF con y sin logo, y con 50 líneas: debe contener estado, información completa, cabeceras repetidas y totales finales.
3. Repetir Inicio, estado, edición y descarga a 320 y 360 px y zoom 200 %, por teclado y táctil, sin desbordamiento horizontal.
4. Registrar la relación de contraste de texto, controles, foco y estados; debe ser al menos 4.5:1 para texto y 3:1 para componentes no textuales. Medir que el título de página y el de sección cumplen las proporciones de FR-019, y que los espacios usan la escala de FR-020.
5. Conservar capturas de Inicio, Presupuestos, Servicios y Mi perfil a 320 px y escritorio, junto con las mediciones y la revisión de los diez PDFs de SC-007.

**Cobertura**: FR-007--FR-015, FR-018--FR-020, FR-028--FR-031, FR-038--FR-041; SC-005 y SC-007--SC-010.

## Validación de usabilidad con participantes

1. Seleccionar 10 profesionales independientes que no hayan participado en el diseño o desarrollo y no hayan usado antes la aplicación.
2. Entregar a cada persona el mismo objetivo escrito: identificar la sección activa, localizar el total y distinguir los cinco estados de presupuesto, sin ayuda verbal.
3. Registrar solo un identificador anónimo, el resultado, el tiempo empleado y la confusión observada; no recopilar datos personales.
4. El criterio se cumple cuando al menos 9 de las 10 personas completan el recorrido y distinguen correctamente los cinco estados.

**Cobertura**: SC-004.
