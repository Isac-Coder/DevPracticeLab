

# DevPracticeLab — Contexto actualizado del proyecto

## Descripción

Plataforma educativa técnica para practicar **SSH**, **Docker**, **PostgreSQL** y **TypeScript**. Integra retos semanales, editor de código, documentación oficial, IA técnica, autenticación y gestión de módulos dentro de una misma experiencia de aprendizaje.

## Stack tecnológico

- **Framework:** Next.js 16.3.6 (App Router + Turbopack)
- **UI:** React 19, Tailwind CSS 4, Lucide React
- **Lenguaje:** TypeScript 5 en strict mode
- **Base de datos:** PostgreSQL + Supabase
- **Auth:** `bcryptjs`, `jose`, cookies JWT HTTP-only
- **IA:** Gemini con fallback local y persistencia de chat
- **Build:** Turbopack + Next.js

## Estado real del proyecto

### Mejoras ya implementadas

- Editor reutilizable para TypeScript y PostgreSQL con:
  - archivos por pestañas
  - importación y exportación
  - renombrado y borrado
  - líneas de código sincronizadas
  - atajo `Ctrl + Enter` / `Cmd + Enter`
  - guardado automático del workspace por módulo

- PostgreSQL simulado con:
  - tablas en estado live
  - creación y eliminación por SQL
  - sidebar de tablas
  - expansión de estructura por clic
  - resultado de consulta debajo del panel lateral
  - persistencia en `sessionStorage` y `localStorage`

- TypeScript con compilación real usando `typescript.transpileModule`.
- Documentación oficial por módulo con contenido real y filtrado.
- Suscripciones por módulo por usuario.
- Chat IA con fallback experto y reintentos.
- Retos con progresión por semanas y bloqueo de repetición.

## Arquitectura

```text
app/
├── account/
├── api/
│   ├── ai-keys/
│   ├── auth/
│   ├── chat/
│   ├── docs/
│   ├── dont-stop/
│   ├── editor-workspace/
│   ├── lint/
│   └── modules/
├── challenges/
├── components/
│   ├── AiChatbot.tsx
│   ├── CodePracticeEditor.tsx
│   ├── Navbar.tsx
│   ├── PracticeAuthGuard.tsx
│   ├── PracticeCard.tsx
│   ├── PracticeProgressBar.tsx
│   └── SimulatedTerminal.tsx
├── docker/
├── docs/
├── login/
├── postgres/
├── register/
├── ssh/
├── typescript/
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
public/
scripts/
└── daily-dont-stop.js
```

## Convenciones clave

- Las rutas protegidas requieren sesión autenticada.
- El editor se guarda por módulo y usuario.
- La práctica SQL es un entorno simulado, no una conexión a PostgreSQL real.
- Los cambios del editor y del esquema SQL deben persistirse en navegador o backend según el caso.
- Los resultados de compilación no deben duplicarse entre módulos: TypeScript tiene resultado debajo del editor; PostgreSQL tiene el resultado debajo del bloque de tablas.
- La documentación y los prompts de IA deben basarse en contenido oficial y verificable.

## Rutas principales

| Ruta | Tipo | Comentario |
| --- | --- | --- |
| `/` | App Router | Dashboard |
| `/challenges` | Client Page | Retos y bloqueo por semana |
| `/ranking` | Client Page | Ranking por puntos, retos completados y tiempo promedio |
| `/docs` | Client Page | Documentación oficial |
| `/account` | Client Page | Perfil, nivel, módulos |
| `/ssh` | Client Page | Práctica SSH |
| `/docker` | Client Page | Práctica Docker |
| `/postgres` | Client Page | SQL interactivo |
| `/typescript` | Client Page | Editor TypeScript |
| `/login` | Client Page | Inicio de sesión |
| `/register` | Client Page | Registro |
| `/api/editor-workspace` | Route Handler | Guardado de archivos por módulo |
| `/api/challenges/completions` | Route Handler | Estado, puntos y duración de retos |
| `/api/challenges/leaderboard` | Route Handler | Datos públicos del ranking |
| `/api/docs` | Route Handler | Búsqueda y render de docs |
| `/api/modules/available` | Route Handler | Módulos disponibles |
| `/api/modules/subscribe` | Route Handler | Suscripción |
| `/api/chat` | Route Handler | Chat IA |

## Persistencia y datos

- El workspace del editor se guarda en la API protegida por sesión.
- El estado de tablas SQL se persiste en `sessionStorage` y `localStorage`.
- La aplicación está preparada para trabajar con módulos de usuario de forma granular.

## Variables de entorno

```env
DATABASE_URL="..."
JWT_SECRET="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Comandos de ejecución

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Verificación

Se ha validado la compilación real con:

```bash
npm run build
```

Resultado verificado: compilación exitosa con Next.js 16.

## Notas importantes

- El proyecto usa una licencia de uso restringido.
- La lógica de prácticas y retos está diseñada para ser extensible por módulo.
- Los prompts y respuestas de IA deben mantenerse técnicos, limitados y verificables.
- Si se modifica el editor o la estructura SQL, revisar la persistencia del estado para no romper la UX.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
