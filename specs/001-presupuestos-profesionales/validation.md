# Validación de PresupuestosPro v0

**Fecha de ejecución automática:** 2026-09-11  
**Entorno local:** Windows, Node.js 22.17.1, npm 10.9.2

## Resultado automático

Comando ejecutado desde la raíz:

```powershell
npm run check
```

Resultado: **PASS**.

| Etapa | Resultado | Evidencia |
|---|---|---|
| TypeScript estricto | PASS | `tsc -b --pretty false`, sin errores |
| Pruebas unitarias | PASS | 5 archivos, 20 pruebas |
| Build estático | PASS | 51 módulos; salida en `dist/` |
| Playwright | PASS | 30 recorridos en Chromium escritorio, Chromium móvil y WebKit móvil |

Los casos automatizados cubren cálculo fiscal y redondeo, fechas civiles, numeración (incluido `999 → 1000`), snapshots de perfil/logo/tasas, persistencia y edición, CRUD y copias de servicios, sugerencias de cliente, descarga PDF válida y un PDF con 50 conceptos, bloqueo por borrador vacío o cambios pendientes, idioma es-MX, 320/360 px, teclado, objetivos táctiles y reflujo al 200 %.

## Evidencia de carga diferida

El build separa el generador PDF y sus fuentes del paquete inicial:

| Recurso | Tamaño | Gzip |
|---|---:|---:|
| Aplicación inicial JS | 294.43 kB | 94.62 kB |
| CSS | 4.98 kB | 1.75 kB |
| pdfmake diferido | 1,009.49 kB | 361.53 kB |
| Fuentes Roboto diferidas | 855.17 kB | 465.61 kB |

## Pendiente para liberar

- Publicar `dist/` en el origen HTTPS definitivo sin Functions/Workers.
- Confirmar persistencia después de cerrar y reabrir esa URL en el mismo navegador.
- Ejecutar tres mediciones Lighthouse móviles con almacenamiento limpio y registrar cada LCP y su mediana.
- Completar las cinco validaciones manuales de `quickstart.md`, incluida la revisión visual de PDF en Chrome Android y Safari iPhone.
- Ejecutar el protocolo con diez profesionales independientes y registrar únicamente evidencia anónima.

Estas comprobaciones requieren la URL definitiva, dispositivos físicos y participantes externos; no se simulan ni se marcan como completadas por la suite automática.

## Vista previa local

`npm run preview -- --host 127.0.0.1` sirvió el contenido compilado de `dist/` con respuesta HTTP 200, tipo `text/html` y el punto de montaje esperado. Esta comprobación local no sustituye la publicación HTTPS ni las mediciones sobre el origen definitivo.
