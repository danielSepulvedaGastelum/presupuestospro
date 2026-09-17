# AGENTS.md

PresupuestosPro es una SPA en español de México para que freelancers creen, conserven y descarguen presupuestos profesionales en PDF.

## Stack y decisiones vigentes

- React 19, React DOM, TypeScript estricto, Vite y CSS nativo; Node.js 24 LTS es la versión objetivo para desarrollo y build.
- SPA estática sin backend, router, gestor global, UI kit, cuentas, nube, analítica ni PWA.
- IndexedDB mediante `idb`; los datos pertenecen al navegador y origen actuales.
- `decimal.js` para cálculos monetarios con MXN, dos decimales y `ROUND_HALF_UP`.
- `pdfmake` 0.3.x se carga dinámicamente y genera el PDF localmente.
- `src/domain/` contiene reglas puras; `persistence/`, acceso a IndexedDB; `pdf/`, documentos; `features/`, áreas de UI.
- `design-tokens.ts` es la fuente compartida de presentación para CSS y PDF; `quote-status.ts`, la fuente de reglas de estado.
- Interfaz responsive desde 320 px, controles táctiles de al menos 44 px, contraste accesible y fechas civiles sin conversión UTC.

## Desarrollo local

```sh
npm install
npm run dev
npm run typecheck
npm run test:unit
npm run test:e2e
npm run build
npm run check
```

`npm run check` ejecuta tipos, pruebas unitarias, build y pruebas E2E. La salida publicable se genera en `dist/`.

## Convenciones

- Mantener la solución simple y el alcance limitado a la especificación aprobada.
- Usar español de México en interfaz y PDF, y MXN para importes.
- Mantener reglas de negocio como funciones puras en `src/domain/`.
- No calcular dinero con aritmética binaria nativa ni duplicar reglas de estado o diseño.
- Conservar compatibilidad con datos existentes en IndexedDB.
- Generar PDF únicamente desde la última versión guardada del presupuesto.
- Añadir pruebas Vitest para dominio y Playwright para flujos visibles; incluir una comprobación manual reproducible.
- No introducir dependencias o abstracciones sin una necesidad medida y documentada.

Las reglas de producto viven en .specify/memory/constitution.md y el estado del producto en specs/README.md


## Spec-kit

* Antes de ejecutar el flujo de `/speckit.specify`, SIEMPRE ejecuta primero el hook `before_specify` (skill `speckit-git-feature`) para crear la rama de la feature, y espera su resultado antes de crear la spec.
* Tras completar `/speckit.specify`, verifica con `git branch --show-current` que estamos en la rama `NNN-nombre-feature` y no en `master`. Si no es así, avísame antes de continuar.
* Al ejecutar `/speckit.plan`, SIEMPRE incluye en `plan.md`, como último paso de la fase final, un paso de mantenimiento: “Actualizar `AGENTS.md` con las decisiones de diseño y convenciones nuevas de esta feature, una línea por decisión, con referencia a la spec (p. ej. ‘[003] ...’). No incluyas entradas por incluir, asegúrate siempre de que es información transversal y relevante para el proyecto que pueden aprovechar futuras features.”