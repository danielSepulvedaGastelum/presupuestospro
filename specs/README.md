# Especificaciones de PresupuestosPro

Este índice resume las especificaciones del producto y la relación entre ellas. El estado de cada una se mantiene en su archivo `spec.md`.

| Número | Nombre | Qué aporta | Estado | Rama |
| --- | --- | --- | --- | --- |
| 001 | [PresupuestosPro v0](001-presupuestos-profesionales/spec.md) | Producto base: perfil profesional, catálogo de servicios, clientes reutilizables, creación y conservación local de presupuestos, cálculos fiscales en MXN y descarga individual en PDF. | **Publicada** — modificada y ampliada por la spec 002 en presentación, navegación, PDF y estados de presupuesto. | No aplica (se creó antes de inicializar Git). |
| 002 | [Rediseñar presentación](002-redisenar-presentacion/spec.md) | Añade Inicio y navegación común, un sistema visual accesible y responsive compartido con el PDF, y estados persistentes de presupuesto con la condición derivada Caducado. | **Publicada** — modifica y amplía la spec 001; conserva sus cálculos, datos y reglas de negocio. | No aplica (se creó antes de inicializar Git). |
| 003 | [Exportar copia completa en ZIP](003-exportar-copia-zip/spec.md) | Añade una exportación de solo lectura basada en una instantánea: un ZIP con el JSON versionado de todos los datos, un PDF por presupuesto y un reporte de fallos parciales. | **Publicada** | `003-exportar-copia-zip` |

## Fuera de alcance acumulado (la lsita de "todavia no")
- cuentas de usuario y datos en la nube (decidico en 001)
- Importar copia de seguridad / restaurar todo (decidido en 003)
- modo oscuro (Idea del modulo 5 - esperando su momento y su Spec)