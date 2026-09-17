# Quickstart: validación de exportación ZIP

## Prerrequisitos

- Node.js 24 LTS.
- Dependencias instaladas con `npm install`.
- Navegador permitido por la configuración Playwright del proyecto.

## Verificación automatizada

```sh
npm run typecheck
npm run test:unit
npm run build
npm run test:e2e
```

La verificación completa puede ejecutarse con:

```sh
npm run check
```

Resultados esperados:

- Las pruebas unitarias validan el contrato JSON v1, Base64 reversible, nombres seguros y reporte de fallos.
- Las pruebas E2E validan lista vacía, descarga completa, fallo parcial, bloqueo de doble pulsación y estado accesible.
- El build no introduce errores TypeScript y mantiene la carga dinámica de pdfmake y fflate.

## Comprobación manual reproducible

1. Ejecutar `npm run dev` y abrir la URL indicada por Vite.
2. Crear un perfil con logo PNG o JPEG y al menos un servicio.
3. Crear tres presupuestos guardados con clientes y estados distintos; usar en uno un nombre con `/`, `:` y acentos.
4. Ir a **Presupuestos** y pulsar **Exportar todo (.zip)** dos veces rápidamente.
5. Confirmar que solo se inicia una exportación, el botón queda deshabilitado y aparece un indicador animado con texto de avance.
6. Abrir `presupuestospro-copia-AAAA-MM-DD.zip`.
7. Confirmar que contiene un solo `presupuestospro-datos.json`, tres PDF con patrón `número - cliente.pdf` y ningún `errores-exportacion.txt`.
8. Abrir cada PDF y compararlo con la descarga individual del mismo presupuesto: contenido, logo, estado e importes deben coincidir visualmente y al centavo.
9. Inspeccionar el JSON según [el contrato](contracts/export-archive.md): debe contener perfil, logo Base64, catálogo, tres presupuestos, numeraciones, identificador, versión y hora de exportación.
10. Confirmar que la aplicación conserva sin cambios perfil, servicios, presupuestos, estados y siguiente numeración.

## Consistencia entre pestañas

1. Abrir la aplicación en dos pestañas con una colección suficientemente grande para observar el indicador.
2. Iniciar la exportación en la primera.
3. Guardar un cambio desde la segunda mientras la primera sigue trabajando.
4. Abrir el ZIP y confirmar que JSON y PDF representan la misma instantánea anterior al cambio; ninguno incorpora parcialmente la escritura posterior.

## Fallo parcial

Este escenario se automatiza inyectando un fallo controlado al creador de PDF para un
presupuesto. En validación manual de desarrollo puede usarse la misma inyección de prueba:

1. Provocar el fallo de un PDF y exportar.
2. Confirmar que el ZIP contiene el JSON completo, los PDF restantes y `errores-exportacion.txt`.
3. Confirmar que el TXT y la advertencia visible enumeran el mismo número omitido.
4. Confirmar que el presupuesto omitido sigue presente en el JSON.

## Accesibilidad y responsive

1. Repetir desde un viewport de 320 px y confirmar que el botón es visible, operable y mide al menos 44 px en su eje táctil.
2. Activar la preferencia **reducir movimiento** del sistema; repetir y confirmar que el texto de estado permanece aunque la animación se reduzca o elimine.
3. Usar lector de pantalla o el árbol de accesibilidad para comprobar que el avance se anuncia de forma cortés y el resultado parcial/error como alerta.

## Volumen mínimo garantizado

Sembrar 200 presupuestos válidos en IndexedDB, exportar y confirmar que la operación
termina en descarga o mensaje de error comprensible, sin truncar silenciosamente entradas
ni modificar datos. Una prueba adicional con más de 200 debe confirmar que se intentan
todos, entendiendo que el resultado depende de la memoria disponible del navegador.
