<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# DevPracticeLab — Contexto actualizado del proyecto

## Descripción

Plataforma educativa de práctica técnica para **SSH**, **Docker**, **PostgreSQL**, **TypeScript** y **Next.js**. La app combina terminales simuladas, retos progresivos, documentación oficial y ejercicios de código dentro de una sola experiencia de aprendizaje.

## Stack tecnológico

- **Framework:** Next.js 16.3.6 (App Router + Turbopack)
- **UI:** React 19, Tailwind CSS 4, Lucide React
- **Lenguaje:** TypeScript 5 en strict mode
- **Base de datos:** PostgreSQL en Supabase (`pg` pool)
- **Auth:** `bcryptjs` + `jose` + JWT HTTP-only cookies
- **Programación temporal:** `node-cron`
- **Build tool:** Turbopack integrado en Next.js

## Cambios recientes y estado actual

- **Retos mejorados:** validación de respuestas, bloqueo de repetición, selección de semana, paginación de 6 retos por página, límite visual de 5 números de paginación, restricción de semanas futuras y revelación de soluciones después de fallos o éxito.
- **Banco de retos ampliado:** 50 desafíos por módulo para SSH, Docker, PostgreSQL, TypeScript y Next.js, con rotación semanal y filtro por módulo.
- **Documentación oficial más útil:** búsqueda por módulo, extracción textual desde páginas oficiales, renderizado de contenido documental real, no URLs en bruto; soporte opcional para Gemini API key.
- **Next.js añadido como módulo oficial:** ruta `/nextjs`, documentación, práctica y editor de código.
- **TypeScript mejorado:** editor de práctica con feedback de compilación real y ejemplos interactivos.
- **UX móvil ajustada:** menú hamburguesa vertical superpuesto para pantallas pequeñas, sin romper el ancho del contenido.
- **Diseño visual del docs page refinado:** más legible, menos saturado y más orientado a contenido editorial.

## Arquitectura

```text
app/
├── account/
│   └── page.tsx
├── api/
│   ├── auth/
│   │   ├── login/route.ts
│   │   ├── logout/route.ts
│   │   ├── me/route.ts
│   │   ├── register/route.ts
│   │   └── update-account/route.ts
│   ├── docs/route.ts
│   └── dont-stop/route.ts
├── challenges/
│   └── page.tsx
├── components/
│   ├── CodePracticeEditor.tsx
│   ├── Navbar.tsx
│   ├── PracticeAuthGuard.tsx
│   ├── PracticeCard.tsx
│   ├── PracticeProgressBar.tsx
│   └── SimulatedTerminal.tsx
├── docs/
│   └── page.tsx
├── docker/
│   ├── commands.ts
│   └── page.tsx
├── login/
│   └── page.tsx
├── nextjs/
│   ├── page.tsx
│   └── commands.ts
├── postgres/
│   ├── commands.ts
│   └── page.tsx
├── register/
│   └── page.tsx
├── ssh/
│   ├── commands.ts
│   └── page.tsx
├── typescript/
│   ├── commands.ts
│   └── page.tsx
├── globals.css
├── layout.tsx
├── page.tsx
lib/
├── accountLevel.ts
├── auth.ts
├── AuthContext.tsx
├── challengesData.ts
├── db.ts
├── ProgressContext.tsx
scripts/
└── daily-dont-stop.js
```

## Base de datos y auth

- **Usa PostgreSQL + Supabase** con validación automática de tablas antes de CRUD.
- **Usuarios**: `email`, `username`, `password_hash`, `created_at`, `updated_at`.
- **`dont_stop`**: `source`, `message`, `payload`, `created_at`.
- **JWT** en cookies HTTP-only y `bcryptjs` para hashing.
- Variables mínimas: `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`.

## Convenciones clave

- Las rutas protegidas requieren autenticación.
- Progress contextualizado por módulo y por usuario.
- `SimulatedTerminal` incluye historial de comandos, `clear`, scroll y copiado.
- Cada módulo tiene su propio esquema visual.
- La documentación oficial se organiza por módulo y por contenido buscado.
- El menú móvil usa overlay vertical para no romper el ancho de la página.

## Rutas principales

| Ruta | Tipo | Comentario |
| --- | --- | --- |
| `/` | Client Component | Dashboard |
| `/docs` | Client Component | Docs con búsqueda y scraping |
| `/challenges` | Client Component | Retos con bloqueo y paginación |
| `/account` | Client Component | Perfil y cuenta |
| `/ssh` | Client Component | Terminal SSH |
| `/docker` | Client Component | Terminal Docker |
| `/postgres` | Client Component | Terminal PostgreSQL |
| `/typescript` | Client Component | Editor TypeScript |
| `/nextjs` | Client Component | Módulo Next.js |

## Comandos de ejecución

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notas importantes

- La inteligencia de docs está enfocada en contenido oficial y relevante, no en enlaces sin contexto.
- La búsqueda filtra por coincidencias reales del término buscado.
- Los retos no permiten reintentos ilimitados ni saltos de semana sin completar la previa.
- El proyecto fue ampliado con soporte de flujo de práctica para Next.js y TypeScript real.
- El proyecto está protegido por una licencia de uso restringido: no se permite reutilizar, clonar, redistribuir, modificar ni vender el código ni el contenido sin permiso explícito del propietario.
