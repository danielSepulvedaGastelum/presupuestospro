# Investigación y decisiones: PresupuestosPro v0

**Revisión técnica**: 2026-09-11. Se confirmó que Node.js 24 continúa como línea LTS, React 19 como línea estable, Vite mantiene `dist/` como salida estática predeterminada y la documentación 0.3.x de `pdfmake` conserva generación en cliente y encabezados repetibles de tabla. El plan fija líneas mayores; `package-lock.json` conservará las versiones menores resueltas durante la implementación.

Fuentes de revisión: [líneas soportadas de Node.js](https://nodejs.org/en/about/previous-releases), [React 19.3](https://react.dev/blog/2026/09/09/react-19-3), [despliegue estático de Vite](https://vite.dev/guide/static-deploy) y [tablas de pdfmake 0.3.x](https://pdfmake.github.io/docs/0.3/document-definition-object/tables/).

## 1. Forma de entrega

**Decisión:** construir una sola aplicación web estática (SPA) con TypeScript, React 19 y Vite. Node.js 24 LTS se usa únicamente para desarrollar, probar y producir la carpeta estática `dist/`; no existe servidor de aplicación en producción.

**Razón:** permite poner la v0 en línea como archivos estáticos y mantener en un solo proyecto los formularios, líneas dinámicas, validaciones y totales reactivos. Para el negocio significa una publicación rápida, sin coste ni mantenimiento de API, autenticación o servidores. React aporta una forma declarativa de mantener pantalla y cálculos coordinados; Vite entrega un build estático portable.

**Alternativas consideradas:**

- TypeScript sin framework reduce dos dependencias, pero multiplica el código imperativo para formularios relacionados y aumenta el riesgo de mostrar datos desactualizados.
- Next.js, Remix y otros frameworks con servidor resuelven problemas que esta spec no tiene.
- Aplicaciones nativas duplicarían desarrollo y retrasarían la publicación en web y móvil.

Fuentes: [estado declarativo en React](https://react.dev/learn/reacting-to-input-with-state), [estado mínimo derivado](https://react.dev/learn/thinking-in-react), [guía de Vite](https://vite.dev/guide/) y [despliegue estático de Vite](https://vite.dev/guide/static-deploy).

## 2. Dependencias y organización de la interfaz

**Decisión:** usar solo `react` y `react-dom` para la interfaz. El estado de cada flujo se maneja con primitives de React y módulos de dominio puros. No se incorporan router, Redux/Zustand, React Query, biblioteca de formularios, kit visual, framework CSS ni motor de internacionalización.

**Razón:** hay tres áreas pequeñas y un único idioma. Menos capas reducen el tiempo de aprendizaje, los puntos de falla y el coste de cambios. Los cálculos y validaciones quedan separados de la presentación para que puedan probarse sin montar toda la aplicación.

**Alternativas consideradas:** esas bibliotecas son valiosas en productos con muchas rutas, servidor remoto, varios equipos o idiomas; ninguno de esos problemas existe en la v0.

## 3. Persistencia local

**Decisión:** usar IndexedDB mediante la librería pequeña `idb`, con una base y cuatro almacenes: perfil, servicios, presupuestos y secuencias anuales. El logo se guarda como `Blob`; el número y el presupuesto se crean en una misma transacción `readwrite`. La numeración presenta al menos tres dígitos y continúa de `999` a `1000` sin cambiar el modelo.

**Razón:** IndexedDB guarda objetos e imágenes sin bloquear la pantalla y permite una transacción que evita duplicar números incluso si hay dos pestañas. `idb` conserva esas capacidades con una API de promesas y poco código. Todo permanece en el navegador: no hay cuenta, sincronización, base de datos cloud ni envío de información comercial.

**Alternativas consideradas:**

- `localStorage` es más corto al inicio, pero es síncrono, solo acepta texto y sus límites son frágiles para logos y documentos que la v0 no permite eliminar.
- SQLite/WASM, OPFS o una base remota agregan peso, migraciones u operación innecesarios.
- Un almacén separado de clientes duplicaría datos y contradiría la decisión de no tener catálogo de clientes; las sugerencias se derivan de presupuestos.

Fuentes: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API), [uso y transacciones de IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB), [`idb`](https://github.com/jakearchibald/idb), [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) y [cuotas/evicción](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).

## 4. Aritmética monetaria

**Decisión:** calcular con `decimal.js`, configurar `ROUND_HALF_UP`, guardar entradas como cadenas decimales canónicas y persistir resultados monetarios como centavos enteros. El formato visible usa `Intl.NumberFormat("es-MX", { currency: "MXN", currencyDisplay: "code" })`.

**Razón:** los ejemplos fiscales deben cuadrar al centavo. La aritmética binaria nativa puede producir diferencias difíciles de explicar y costosas para la confianza del usuario; una sola dependencia enfocada elimina ese riesgo y expresa exactamente la regla de medio centavo.

**Alternativas consideradas:** redondear con `Math.round` es tentador, pero mezcla problemas de representación binaria con la regla fiscal. Construir una librería decimal propia sería mayor riesgo para una función sensible.

Fuentes: [`decimal.js`](https://github.com/MikeMcl/decimal.js) e [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat).

## 5. Generación de PDF

**Decisión:** usar `pdfmake` 0.3.x en el navegador, con fuente Roboto empaquetada localmente y carga dinámica solo cuando el usuario solicita el PDF. El documento se define desde la última versión guardada; la interfaz bloquea la descarga si hay cambios pendientes. La tabla declara una fila de encabezado y los totales forman un bloque posterior a la tabla.

**Razón:** `pdfmake` resuelve de forma declarativa el flujo de bloques, Unicode, tablas multipágina, encabezados repetidos, imágenes y descarga. Evita programar coordenadas y saltos de página, reduciendo el riesgo de que un presupuesto largo pierda líneas o tape los totales. El mayor peso no afecta la primera carga porque el módulo se descarga bajo demanda.

**Alternativas consideradas:**

- `jsPDF` + `jspdf-autotable` es una alternativa más ligera, pero exige más medición y posicionamiento manual para cabecera, partes y totales; además requiere integrar una fuente para español completo.
- `pdf-lib` no ofrece layout de tablas y obligaría a construir la paginación.
- `window.print()` depende del diálogo y configuración de cada navegador, por lo que no garantiza un archivo consistente ni una descarga directa.
- Un servicio de PDF introduciría backend y enviaría datos privados fuera del equipo.

Fuentes: [definición de documento](https://pdfmake.github.io/docs/0.3/document-definition-object/), [tablas y encabezados](https://pdfmake.github.io/docs/0.3/document-definition-object/tables/), [imágenes](https://pdfmake.github.io/docs/0.3/document-definition-object/images/), [descarga cliente](https://pdfmake.github.io/docs/0.3/getting-started/client-side/methods/) y [navegadores soportados](https://pdfmake.github.io/docs/0.3/getting-started/client-side/supported-browsers/).

## 6. Diseño móvil, idioma y accesibilidad

**Decisión:** CSS nativo mobile-first, fuentes del sistema, una columna desde 320 CSS px y tarjetas para editar conceptos en móvil. Se incluyen viewport correcto, etiquetas visibles, teclado decimal, orden de foco lógico, reflujo al 200 %, mensajes textuales y objetivos táctiles de al menos 44 × 44 CSS px. Todos los textos se escriben directamente en español de México y una prueba recorre interfaz y PDF para impedir términos fiscales ajenos al mercado objetivo.

**Razón:** la experiencia principal debe funcionar en el teléfono desde el primer lanzamiento. CSS propio evita descargar y aprender un sistema visual completo; un único idioma no justifica infraestructura i18n. Las tarjetas evitan una tabla horizontal difícil de editar con el pulgar.

**Alternativas consideradas:** Tailwind, Bootstrap, Material UI, fuentes web y motores i18n añaden dependencias o configuración sin requisito actual. Una PWA instalable y service worker también quedan fuera: publicar una web adaptable ya satisface la spec.

Fuente: [viewport en dispositivos móviles](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport).

## 7. Estrategia de verificación

**Decisión:** Vitest cubre funciones puras de cálculo, redondeo, numeración —incluida la transición `999 → 1000`—, fechas y agrupación de clientes. Playwright cubre en navegador real el flujo crítico, explicación de retenciones, persistencia IndexedDB, recarga, edición conservando número, bloqueo por cambios sin guardar, descarga y auditoría es-MX. Los PDF se verifican con escenarios reproducibles de contenido y paginación, complementados por una revisión visual manual en Chrome Android y Safari iPhone. La prueba de usabilidad usa diez participantes sin experiencia previa, un guion único, cero ayuda verbal y evidencia anónima.

**Razón:** los errores más caros están en reglas deterministas y en la experiencia real del navegador. Dos niveles bastan: pruebas rápidas para todas las combinaciones fiscales y pocas pruebas completas para demostrar que almacenamiento, UI y descarga trabajan juntos. La revisión manual permite que una persona no técnica confirme los criterios de éxito, como exige la constitución.

**Alternativas consideradas:** snapshots extensos de componentes serían frágiles y no prueban el resultado de negocio; una gran pirámide de mocks o servicios de dispositivos remotos sería infraestructura prematura. React Testing Library se añadirá solo si aparece un comportamiento de componente que Vitest puro y Playwright no cubran con claridad.

Fuentes: [Vitest](https://vitest.dev/guide/) y [Playwright](https://playwright.dev/docs/intro).

## 8. Publicación inmediata

**Decisión:** generar `dist/`, validarlo localmente con `vite preview` y hacer una carga directa a Cloudflare Pages, sin Functions ni Workers. La aplicación no se acopla al proveedor: cualquier hosting estático con HTTPS puede servir la misma carpeta. Sobre la URL definitiva se realizan tres mediciones consecutivas con el perfil móvil predeterminado de Lighthouse y se registra la mediana de LCP.

**Razón:** una carga de archivos precompilados entrega una URL HTTPS en minutos y no crea canal CI/CD, servidor ni secretos. Esto cumple el objetivo de salir en línea enseguida. Debe elegirse desde el inicio el dominio público estable, porque el almacenamiento local está aislado por origen.

**Alternativas consideradas:** GitHub Pages o integración Git son apropiados cuando exista un repositorio y se necesiten despliegues repetibles; no son requisito para la primera publicación. Functions, Workers y contenedores no aportan valor a la v0.

Fuente: [Direct Upload de Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## 9. Riesgos aceptados y mitigación mínima

- **Datos ligados al navegador y dominio:** la interfaz lo comunica con claridad. Cambiar de dominio no migra información; no se promete sincronización.
- **Borrado o evicción del almacenamiento:** se manejan errores de cuota y se advierte que modo incógnito, limpieza del navegador o cambio de dispositivo puede perder datos. Exportar/restaurar no se inventa en esta versión.
- **Acceso compartido al navegador:** sin cuentas no hay aislamiento entre personas del mismo perfil del navegador; es una consecuencia consciente de la spec.
- **Logos grandes o incompatibles:** se validan y normalizan localmente a PNG/JPEG compatible antes de guardar, con un mensaje comprensible si falla.
- **Descarga móvil variable:** el botón se activa por gesto explícito y se prueba en Safari iOS y Chrome Android; el PDF se puede abrir o guardar según permita el sistema.
- **PDF desactualizado por cambios pendientes:** el editor mantiene un indicador derivado de cambios sin guardar y bloquea la descarga hasta persistirlos; descargar nunca guarda ni descarta datos de forma implícita.
- **Cambio normativo:** las tasas viven en un módulo único y se copian en el primer guardado. No se actualizan silenciosamente presupuestos anteriores.
- **Seguridad de texto:** React escapa contenido por defecto; no se usa HTML sin sanitizar ni se incorporan claves, tokens o analítica.

## Resultado de investigación

No quedan decisiones técnicas abiertas. La solución es un único proyecto cliente, una única base local y cinco paquetes runtime agrupados en cuatro capacidades justificadas (`react` + `react-dom`, `idb`, `decimal.js`, `pdfmake`), más herramientas de build y prueba. La revisión del 2026-09-11 confirmó vigencia de las líneas seleccionadas y trazabilidad con FR-001 a FR-041 y SC-001 a SC-011. No hay backend, cuenta, nube, PWA, sincronización ni funcionalidad fuera de la spec.
