# Research: Exportar copia completa en ZIP

## Construcción del ZIP en navegador

**Decision**: Incorporar `fflate` y cargarlo dinámicamente al comenzar una exportación con datos. Usar su API asíncrona de ZIP; almacenar los PDF sin recompresión y comprimir JSON/TXT.

**Rationale**: La aplicación necesita un contenedor ZIP con muchos archivos, no solo un flujo DEFLATE. `fflate` funciona en navegador, acepta `Uint8Array`, soporta nombres Unicode y ofrece una API asíncrona adecuada para múltiples entradas. Su propia documentación recomienda evitar comprimir de nuevo formatos ya comprimidos como PDF.

**Alternatives considered**:

- `CompressionStream`: descartado porque comprime un flujo como gzip/deflate, pero no construye por sí solo el directorio y metadatos de un archivo ZIP con varias entradas.
- JSZip: viable y con callback de progreso, pero se descarta por agregar una API y peso mayores cuando solo se requiere crear un ZIP.
- Implementar ZIP manualmente: descartado por riesgo de compatibilidad, CRC y nombres UTF-8, contrario al principio de simplicidad.

## Instantánea consistente de IndexedDB

**Decision**: Leer `profile`, `services`, `quotes` y `annualSequences` dentro de una única transacción `readonly`, creando todas las solicitudes antes de esperar resultados y finalización.

**Rationale**: La transacción constituye la frontera de consistencia frente a escrituras concurrentes de otra pestaña y evita mezclar versiones. Leer almacenes con llamadas independientes no garantiza que pertenezcan al mismo momento lógico.

**Alternatives considered**:

- Reutilizar los estados React de la pantalla: no incluye perfil, catálogo ni numeraciones y puede estar desactualizado.
- Cuatro lecturas independientes: permite mezcla temporal entre almacenes.
- Bloquear escrituras durante la exportación: innecesario y no funciona de forma fiable entre pestañas.

## Reutilización del PDF individual

**Decision**: Extraer de `download-quote-pdf.ts` una función `createQuotePdfBlob(quote)` que carga pdfmake, valida y devuelve el `Blob`. Tanto la descarga individual como el ZIP usarán esa función.

**Rationale**: `pdfmake` 0.3 instalado expone `getBlob()` en navegador. Compartir la función garantiza las mismas reglas y el mismo documento, evitando duplicar validación, VFS, logo o construcción visual.

**Alternatives considered**:

- Interceptar `download()`: no devuelve bytes reutilizables y provocaría múltiples descargas.
- Duplicar la configuración pdfmake: crea riesgo directo de divergencia respecto a FR-007.
- Exigir igualdad byte por byte: innecesario; pdfmake puede producir metadatos internos variables y la spec solo exige equivalencia visual y monetaria.

## Formato de copia versionado

**Decision**: JSON UTF-8 con `format: "presupuestospro-backup"`, `formatVersion: 1`, `exportedAt` ISO 8601 y un objeto `data` con perfil anulable y arreglos completos. El logo se representa con `contentBase64`; el resto de los valores se conserva sin normalización.

**Rationale**: Un discriminador estable y una versión numérica permiten validar una futura importación sin ligarla a la versión de la app. Base64 es reversible, JSON-compatible y conserva tipo y dimensiones junto con los bytes.

**Alternatives considered**:

- Serializar directamente `Uint8Array`: `JSON.stringify` lo convierte en un objeto indexado y no ofrece un contrato portable.
- Guardar el logo como archivo separado: complica referencias y restauración sin aportar valor al alcance actual.
- Incluir datos derivados o recalculados: contradice la conservación exacta exigida.

## Nombres de archivo seguros

**Decision**: Normalizar solo para archivo: reemplazar controles y `<>:"/\\|?*` por `-`, colapsar repeticiones y espacios, retirar puntos/espacios finales, evitar nombres reservados de Windows y usar `Cliente` si queda vacío. El patrón final es `<número> - <cliente>.pdf`.

**Rationale**: Produce nombres deterministas que abren correctamente en los sistemas comunes sin modificar el contenido del PDF. El número único evita colisiones entre clientes con igual nombre.

**Alternatives considered**:

- Codificación URL: legible de forma deficiente para una persona no técnica.
- Eliminar todo carácter no ASCII: destruye acentos y nombres legítimos en español.
- Usar identificadores UUID: seguros pero incumplen la asociación visible por número y cliente.

## Progreso y uso de memoria

**Decision**: Progreso textual por documento (`X de N`) con animación indeterminada; generación de PDF secuencial y ZIP asíncrono. No se promete porcentaje exacto ni un límite superior.

**Rationale**: La secuencia limita trabajo concurrente y hace comprensible el avance. Para descargar un solo Blob el navegador conservará datos en memoria; implementar streaming a disco requeriría APIs no uniformes o dependencias adicionales y no está justificado para la garantía de 200 documentos.

**Alternatives considered**:

- Generar todos los PDF en paralelo: reduce tiempo en algunos equipos, pero aumenta picos de CPU y memoria.
- Mostrar porcentaje exacto: sería engañoso porque cada PDF tiene costo distinto y pdfmake no informa avance interno.
- File System Access API: no está disponible de forma uniforme, cambia el flujo de descarga y amplía alcance.
