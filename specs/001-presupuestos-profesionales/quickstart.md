# Guía de ejecución y validación

Esta guía demuestra la v0 de punta a punta sin revisar código. Los comandos estarán disponibles después de completar `tasks.md` con `$speckit-tasks` y ejecutar la implementación.

## Requisitos previos

- Node.js 24 LTS y npm.
- Chrome o Edge de escritorio para la ejecución local.
- Para liberación: un Android con Chrome y un iPhone con Safari, o los proyectos móviles de Playwright más una comprobación final en dispositivos físicos.
- No se requieren cuenta de la aplicación, servidor, base de datos externa ni variables secretas.

## Instalar y ejecutar

Desde la raíz del repositorio:

```powershell
npm ci
npm run dev
```

Abrir la URL local que muestre Vite. Debe aparecer la aplicación en español de México, sin pantalla de inicio de sesión, junto al aviso de que los datos se guardan solo en ese navegador.

## Verificación automática mínima

```powershell
npm run typecheck
npm run test:unit
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

Resultado esperado:

- Las pruebas fiscales reproducen exactamente `MXN 2,081.67`, `MXN 1,906.67` y `MXN 2,320.00`.
- Numeración, fechas, redondeo, agrupación de clientes y snapshots pasan sus pruebas unitarias.
- Los recorridos del navegador guardan y reabren información en IndexedDB, conservan números, bloquean descargas con cambios pendientes y descargan un PDF válido.
- La interfaz y el PDF usan español de México y no contienen `NIF`, `autónomo` ni `IRPF`.
- `dist/` se genera sin backend ni secretos.

`npm run check` puede agrupar tipo, unitarias, build y el recorrido e2e crítico para la revisión final.

## Validación manual 1: primer presupuesto y cálculo

1. En **Mi perfil**, intentar guardar sin nombre, RFC o régimen y confirmar que cada dato faltante se identifica con una explicación comprensible. Después guardar nombre `Ana López`, RFC `LOPA900101AA1`, régimen **RESICO** y cualquier contacto; el logo es opcional.
2. Crear un presupuesto para `Agencia Norte`, tipo **persona moral**.
3. Agregar dos conceptos: `Diseño` por cantidad `1` y precio `1500.00`; `Fotografía` por cantidad `1` y precio `500.00`.
4. Confirmar sin pulsar “recalcular”:
   - Base: `MXN 2,000.00`
   - IVA: `MXN 320.00`
   - ISR retenido: `MXN 25.00`
   - IVA retenido: `MXN 213.33`
   - Total: `MXN 2,081.67`
5. Cambiar el cliente a **persona física**. Ambas retenciones deben desaparecer y el total debe ser `MXN 2,320.00`.
6. Volver a persona moral, cambiar el perfil a **Servicios Profesionales** antes del primer guardado y confirmar total `MXN 1,906.67`.
7. Editar y quitar líneas. Cada cambio debe actualizar todos los importes de inmediato; cantidad cero/negativa y precio negativo deben explicar cómo corregirse.
8. Usando únicamente los textos visibles, explicar que una persona física no lleva retenciones y que una persona moral sí las lleva, con una retención de ISR determinada por el régimen del profesional.

Resultado: cubre P1, SC-001, SC-002, SC-004 y parte de SC-007.

## Validación manual 2: guardado, numeración y datos congelados

1. Con régimen RESICO, crear y guardar dos presupuestos con emisión en 2026. Deben ser `2026-001` y `2026-002`.
2. Crear uno con emisión en 2027. Debe ser `2027-001`.
3. Completar, para la prueba total, 20 presupuestos repartidos entre ambos años. Verificar que cada secuencia es consecutiva e independiente y no existe acción de eliminar o archivar.
   La transición de `AAAA-999` a `AAAA-1000` se comprueba mediante la prueba unitaria de numeración; no requiere crear mil presupuestos manualmente.
4. Cerrar por completo la pestaña y volver a abrir la misma URL. El perfil, cinco servicios y al menos diez presupuestos deben conservarse sin cambios.
5. Abrir `2026-001`, editar una línea, guardar y descargar otra vez. Debe conservar número, fecha de emisión y vencimiento, pero mostrar el importe nuevo.
6. Cambiar nombre, logo, régimen y contacto en **Mi perfil**. Volver a `2026-001`: debe conservar la copia anterior y recalcular con sus tasas originales. Un presupuesto nuevo sí debe usar el perfil actualizado.

Resultado: cubre P3, SC-003 y SC-006. Repetir siempre sobre el mismo navegador, perfil y dominio; incógnito, limpieza de datos o cambio de URL no forman parte de la persistencia prometida.

## Validación manual 3: reutilización sin vínculos ocultos

1. Crear un servicio `Consultoría` con precio `800.00` y elegirlo en un presupuesto nuevo.
2. Cambiar la línea copiada a `Consultoría inicial` y `750.00`. El servicio debe seguir con sus valores originales.
3. Editar y luego eliminar el servicio; los presupuestos guardados deben permanecer iguales.
4. Guardar dos presupuestos del mismo cliente con el mismo RFC, pero cambiar teléfono o domicilio en el segundo.
5. En otro presupuesto, buscar ese cliente: debe aparecer una sola sugerencia con los datos guardados más recientemente.
6. Editar la copia y comprobar que ninguno de los presupuestos fuente cambia.
7. Repetir sin RFC: solo deben agruparse nombres equivalentes en mayúsculas/minúsculas y espacios cuando también coincida el tipo fiscal. Dos RFC diferentes nunca se agrupan.

Resultado: cubre P4 y FR-004 a FR-010 y FR-038.

## Validación manual 4: PDF corto, vacío y largo

1. Guardar un presupuesto sin conceptos e intentar descargarlo. No debe aparecer archivo; el mensaje debe pedir al menos un concepto.
2. Descargar uno corto con logo. Abrir el archivo y comprobar que su nombre corresponde al número del presupuesto, por ejemplo `2026-001.pdf`, y que contiene acentos, logo, profesional, cliente, número, fechas, conceptos, `MXN`, base, IVA, retenciones y total.
3. Descargar otro sin logo. No debe verse espacio roto ni faltar información.
4. Crear un presupuesto con suficientes conceptos y descripciones largas para ocupar más de una página (por ejemplo, 50 líneas).
5. Confirmar que todas las líneas aparecen una sola vez, cada página de continuación repite el encabezado y los totales aparecen una sola vez, después de la última línea y sin superposición.
6. Editarlo e intentar descargar sin guardar: no debe generarse un PDF y el mensaje debe pedir guardar primero. Guardar el cambio y descargar de nuevo: el PDF debe reflejarlo y conservar el número.
7. Para persona física, comprobar que el PDF indica que no aplican retenciones y no resta ningún importe.

Resultado: cubre P2, SC-005 y SC-008. Repetir al menos los casos corto y largo en Safari iPhone y Chrome Android.

## Validación manual 5: móvil y accesibilidad

1. Abrir la aplicación a 320 y 360 CSS px. No debe existir desplazamiento horizontal de la página ni acción inaccesible.
2. Completar perfil, cliente, dos líneas, guardado y descarga usando controles táctiles. Cantidad y precio deben abrir teclado decimal.
3. Repetir con teclado solamente en escritorio: el foco debe ser visible y seguir el orden de lectura.
4. Provocar errores. Cada mensaje debe quedar junto al campo, explicar la corrección y no depender solo del color; el foco debe ir al primer error.
5. Aumentar el zoom a 200 %. El contenido debe reacomodarse sin perder campos, totales o acciones.
6. Medir desde el inicio de perfil hasta la descarga: el objetivo es menos de cinco minutos sin ayuda externa.

Resultado: cubre FR-039, FR-040 y SC-009, además de apoyar SC-001 y SC-007.

Para SC-007, seleccionar diez profesionales independientes que no hayan participado en el diseño o desarrollo y que no hayan usado antes la aplicación. Cada persona comienza con datos vacíos, recibe el mismo objetivo escrito y no recibe ayuda verbal. Al menos nueve deben completar un presupuesto válido y explicar correctamente, usando los textos visibles, por qué aparecen o no las retenciones. Registrar únicamente un identificador anónimo, tiempo, resultado y explicación; no recopilar datos personales innecesarios.

## Compilar y publicar

```powershell
npm run build
npm run preview -- --host 127.0.0.1
```

1. Validar que la vista previa sirve exclusivamente el contenido de `dist/`.
2. Cargar `dist/` mediante Direct Upload en un proyecto de Cloudflare Pages sin Functions ni Workers, o en otro hosting estático HTTPS equivalente.
3. Abrir y recargar la URL pública: no debe haber 404 ni llamadas de negocio a una API.
4. Guardar un perfil y presupuesto, cerrar y volver a abrir esa misma URL; deben seguir disponibles.
5. Conservar ese dominio para la v0: IndexedDB pertenece al origen y los datos no aparecen automáticamente bajo una URL distinta.
6. En Chrome DevTools, ejecutar Lighthouse tres veces sobre la URL definitiva con modo navegación, perfil móvil y almacenamiento limpio antes de cada medición. Registrar cada LCP y confirmar una mediana menor o igual que 2.5 segundos.

Resultado: cubre FR-041, SC-010 y SC-011.

## Criterio de salida

La versión puede publicarse cuando pasan los comandos, las cinco validaciones manuales, los tres importes fiscales exactos, la persistencia sobre la URL definitiva, la mediana de carga móvil acordada y la revisión de PDF/móvil en Chrome Android y Safari iPhone. No se requiere configurar ningún recurso de servidor.
