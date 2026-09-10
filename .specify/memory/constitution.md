<!--
Sync Impact Report
- Version change: plantilla sin versión → 1.0.0
- Principios modificados: ninguno; se definen los cinco principios iniciales del proyecto.
- Secciones añadidas: Alcance y producto; Verificación.
- Secciones eliminadas: ninguna.
- TODOs: ninguno.
-->

# Constitución de PresupuestosPro

## Principios fundamentales

### I. Simplicidad ante todo
Ante dos soluciones válidas, el equipo DEBE elegir la más simple. PresupuestosPro es
una versión 1: no se añadirá complejidad anticipada ni funcionalidad especulativa.

### II. Idioma y mercado: español de México
Toda la experiencia del producto DEBE estar en español de México. Los importes DEBEN
usar pesos mexicanos (MXN) y formatos comprensibles para ese mercado.

### III. Cero alcance fantasma
Solo se DEBE implementar lo escrito en la especificación aprobada. Toda idea nueva se
documentará como propuesta y requerirá actualizar la especificación antes de construirse.

### IV. Verificable por una persona no técnica
Cada criterio de éxito DEBE poder comprobarse usando la aplicación, sin leer código ni
conocer su implementación interna.

### V. Datos del usuario con respeto
La aplicación DEBE pedir únicamente los datos imprescindibles para generar el presupuesto.
Las claves, tokens y otros secretos NO DEBEN introducirse en el código ni exponerse en la
interfaz.

## Alcance y producto

PresupuestosPro permite a freelancers generar presupuestos en PDF. Cualquier capacidad
fuera de ese alcance requiere una especificación aprobada antes de implementarse.

## Verificación

Cada cambio DEBE incluir una comprobación manual reproducible desde la aplicación para
los criterios de éxito afectados. Los casos que no puedan verificarse así deben aclararse
antes de aprobar el cambio.

## Gobernanza

Esta constitución prevalece sobre prácticas contradictorias del proyecto. Una enmienda
requiere actualizar este archivo, explicar el impacto y revisar la especificación afectada.
La versión usa SemVer: MAJOR para cambios incompatibles, MINOR para principios o reglas
nuevas, y PATCH para aclaraciones sin cambio de intención. Cada revisión debe comprobar
el cumplimiento de los principios y que no se haya agregado alcance fuera de la spec.

**Versión**: 1.0.0 | **Ratificada**: 2026-09-09 | **Última enmienda**: 2026-09-09
