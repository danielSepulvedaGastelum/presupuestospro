# Contract: archivo de exportación v1

## Nombre y contenido del ZIP

Nombre: `presupuestospro-copia-AAAA-MM-DD.zip`, con la fecha civil local capturada al
iniciar la operación.

Entradas en la raíz:

| Entrada | Presencia | Contenido |
|---|---|---|
| `presupuestospro-datos.json` | Siempre que se descarga ZIP | Copia versionada completa en UTF-8. |
| `<número> - <cliente>.pdf` | Una por PDF generado | Documento basado en la versión guardada de la instantánea. |
| `errores-exportacion.txt` | Solo si falla al menos un PDF | Reporte UTF-8 de todos los números omitidos. |

No se crean subdirectorios. Los nombres de entrada son únicos por el número de
presupuesto, cuya unicidad ya exige IndexedDB.

## `presupuestospro-datos.json`

Tipo de medio conceptual: `application/json`; codificación UTF-8.

```json
{
  "format": "presupuestospro-backup",
  "formatVersion": 1,
  "exportedAt": "2026-09-17T18:30:00.000Z",
  "data": {
    "profile": {
      "id": "current",
      "fullName": "Ada Lovelace",
      "rfc": "LOAA010101AAA",
      "taxRegime": "RESICO",
      "updatedAt": "2026-09-17T18:00:00.000Z",
      "logo": {
        "mimeType": "image/png",
        "width": 640,
        "height": 320,
        "contentBase64": "iVBORw0KGgo..."
      }
    },
    "services": [],
    "quotes": [],
    "annualSequences": []
  }
}
```

### Reglas

- `format` y `formatVersion` son obligatorios y exactos.
- `exportedAt` es el instante fijado al comenzar, no el momento de terminar.
- `profile` es `null` cuando no hay perfil; los arreglos vacíos representan colecciones sin registros.
- Todos los campos existentes de servicios, presupuestos y secuencias se serializan con sus nombres y valores guardados.
- Los campos opcionales ausentes permanecen ausentes; no se rellenan con cadenas vacías, ceros ni valores calculados.
- Los importes enteros en centavos y cadenas decimales conservan sus tipos; no se recalculan ni redondean.
- Las fechas civiles continúan como `AAAA-MM-DD`; las marcas de tiempo continúan como strings ISO 8601.
- `LogoAsset.bytes` se sustituye exclusivamente en el JSON por `contentBase64`; al decodificarlo debe recuperarse la misma secuencia de bytes.
- La versión v1 no incluye resultados de generación de PDF. Esos resultados pertenecen a `errores-exportacion.txt`.

## `errores-exportacion.txt`

Tipo de medio conceptual: `text/plain`; codificación UTF-8; finales de línea `\n`.

Forma:

```text
PresupuestosPro no pudo incluir los siguientes presupuestos como PDF:

- 2026-003: No fue posible generar el PDF.
- 2026-008: Faltan datos guardados necesarios para generar el PDF.

Los datos de estos presupuestos sí están incluidos en presupuestospro-datos.json.
```

Reglas:

- Contiene exactamente una línea por presupuesto omitido, en el mismo orden de procesamiento.
- Siempre incluye el número; el texto evita detalles técnicos y stacks.
- Si todos los PDF fallan, enumera todos los presupuestos.
- Si ninguno falla, el archivo no existe en el ZIP.

## Nombres seguros de PDF

1. Tomar `quote.number` y `quote.client.name` de la instantánea.
2. En el cliente, reemplazar caracteres de control y `<>:"/\\|?*` por `-`.
3. Colapsar espacios y guiones de reemplazo consecutivos.
4. Quitar puntos y espacios finales.
5. Si queda vacío o coincide con un nombre reservado de Windows (`CON`, `PRN`, `AUX`, `NUL`, `COM1`...`COM9`, `LPT1`...`LPT9`), usar `Cliente`.
6. Producir `<número> - <cliente-seguro>.pdf` sin alterar el nombre mostrado dentro del PDF.

## Condiciones de descarga

- Cero presupuestos: no se construye JSON ni ZIP y no se inicia descarga.
- JSON o ZIP inválido: cero descargas y error recuperable en la interfaz.
- Uno o más fallos de PDF: descarga parcial válida con JSON, PDF exitosos y reporte.
- Cero fallos de PDF: descarga completa sin reporte.
