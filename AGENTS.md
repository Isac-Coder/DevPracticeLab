<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# DevPracticeLab — Contexto del Proyecto

## Descripción

Plataforma interactiva para practicar comandos de **SSH**, **Docker** y **PostgreSQL** en terminales simuladas dentro del navegador. No requiere servidores reales ni configuración externa.

## Stack tecnológico

- **Framework:** Next.js 16.3.6 (App Router, Turbopack)
- **UI:** React 19.2.8, Tailwind CSS 4, Lucide React
- **Lenguaje:** TypeScript 5 (strict mode)
- **Base de datos:** Supabase PostgreSQL (`pg` pooler)
- **Autenticación:** `bcryptjs` (hash) + `jose` (JWT HTTP-only cookies)
- **Tareas programadas:** `node-cron`
- **Build tool:** Turbopack (integrado en Next.js)

## Arquitectura

```
app/
├── api/                        # Backend API Routes
│   ├── auth/
│   │   ├── register/route.ts   # POST: Registrar usuarios con password hash
│   │   ├── login/route.ts      # POST: Autenticar usuarios y emitir JWT
│   │   ├── me/route.ts         # GET: Obtener sesión actual
│   │   └── logout/route.ts     # POST: Limpiar cookie de sesión
│   └── dont-stop/route.ts      # POST/GET: Inserción y consulta en tabla dont_stop
├── components/                 # Componentes globales reutilizables
│   ├── Navbar.tsx              # Barra de navegación con estado de auth
│   ├── SimulatedTerminal.tsx   # Terminal interactiva genérica
│   └── PracticeCard.tsx        # Tarjeta de selección para el dashboard
├── login/                      # Página de inicio de sesión (/login)
│   └── page.tsx
├── register/                   # Página de registro (/register)
│   └── page.tsx
├── ssh/                        # Módulo SSH — tema verde (green)
│   ├── page.tsx                # Ruta /ssh — Client Component
│   └── commands.ts             # Lógica de comandos SSH simulados
├── docker/                     # Módulo Docker — tema azul (sky)
│   ├── page.tsx                # Ruta /docker — Client Component
│   └── commands.ts             # Lógica de comandos Docker simulados
├── postgres/                   # Módulo PostgreSQL — tema índigo
│   ├── page.tsx                # Ruta /postgres — Client Component
│   └── commands.ts             # Lógica de comandos SQL y psql simulados
├── page.tsx                    # Dashboard (/) — Client Component
├── layout.tsx                  # RootLayout con AuthProvider
├── globals.css                 # Tailwind CSS 4 + estilos globales
└── favicon.ico
lib/
├── db.ts                       # Pool de PostgreSQL, inicialización de esquemas y queries
├── auth.ts                     # Funciones de hashing bcrypt y JWT jose
└── AuthContext.tsx             # Contexto React de autenticación en frontend
scripts/
└── daily-dont-stop.js          # Script cron backend para enviar POST periódico (cada 2h) a dont_stop
```

## Convenciones

- **Tema por página:** Cada módulo (ssh, docker, postgres) tiene su propia paleta de colores que se aplica al fondo, terminal, header y sidebar.
- **Componentes globales** en `app/components/` — reutilizados por todas las páginas.
- **Comandos separados** en archivos `commands.ts` dentro de cada carpeta de módulo. Exportan una función factory (`getSSHCommands()`, `getDockerCommands()`, `getPostgresCommands()`) que reinicia el estado y devuelve un `Record<string, (args: string[]) => CommandResult>`.
- **SimulatedTerminal** es un componente genérico que recibe un `TerminalConfig` con: prompt, welcome message, mapa de comandos y tema visual.
- Las páginas de práctica (`/ssh`, `/docker`, `/postgres`) son **Client Components** (`"use client"`).
- La página principal (`/`) también es Client Component porque pasa funciones (iconos de Lucide) como props a `PracticeCard`.
- El `layout.tsx` es **Server Component** — no agregar `"use client"` ahí.

## Rutas

| Ruta        | Componente               | Tipo               |
| ----------- | ------------------------ | -------------------|
| `/`         | `app/page.tsx`           | Client Component   |
| `/ssh`      | `app/ssh/page.tsx`       | Client Component   |
| `/docker`   | `app/docker/page.tsx`    | Client Component   |
| `/postgres` | `app/postgres/page.tsx`  | Client Component   |

## Comandos

```bash
npm run dev      # Servidor de desarrollo (Turbopack, puerto 3000)
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # ESLint
```

## Notas importantes

- Al agregar un nuevo módulo de práctica, crear una carpeta en `app/<nombre>/` con `page.tsx` y `commands.ts`, y agregar la entrada al `Navbar.tsx` y al dashboard `page.tsx`.
- Los comandos de cada terminal se reinician al cambiar de vista (el estado es local al componente con `useMemo`).
- El componente `SimulatedTerminal` soporta historial de comandos (flechas arriba/abajo), `clear`, y scroll automático.
- PostgreSQL soporta parsing básico de SQL: SELECT con WHERE/ORDER BY/LIMIT, INSERT, UPDATE, DELETE, CREATE/DROP/ALTER TABLE.
- SSH simula 3 servidores con usuario `root` y contraseña `A12345678`, prompt interactivo de contraseña, sistema de archivos básico y generación de claves.
- Todas las terminales permiten selección/copia de texto nativa y cuentan con un botón de **Copiar** en el header para copiar todo el contenido al portapapeles.
