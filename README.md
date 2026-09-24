# 🧠 DevPracticeLab

Plataforma interactiva para practicar **SSH**, **Docker**, **PostgreSQL**, **TypeScript** y **Next.js** desde terminales simuladas, sin requerir servidores reales ni configuración externa.

Construido con [Next.js](https://nextjs.org) 16.3.6, [React](https://react.dev) 19, [Tailwind CSS](https://tailwindcss.com) 4 y [Lucide React](https://lucide.dev).

---

## ✨ Características principales

- **Reto semanal con lógica de bloqueo y progreso** (`/challenges`)
  - 250 retos repartidos en 5 módulos: SSH, Docker, PostgreSQL, TypeScript y Next.js
  - validación de respuestas
  - bloqueo de retos repetidos si se fallan o si ya están completados
  - restricción por semana: no se puede avanzar a la siguiente si la anterior no está completada
  - paginación con grupos de 6 retos por página y límite visual de 5 números de paginación
  - revelación de la solución solo tras varios intentos fallidos o cuando el reto se completa con éxito

- **Documentación oficial sincronizada con la web** (`/docs`, `/api/docs`)
  - búsqueda por módulo: SSH, Docker, PostgreSQL, TypeScript y Next.js
  - filtro por conceptos, comandos o temas del módulo activo
  - extracción textual y renderizado de contenido relevante, no solo enlaces planos
  - soporte opcional para Gemini API key
  - fallback a páginas oficiales y scraping con contenido legible

- **Práctica de TypeScript con editor real** (`/typescript`)
  - compilación con TypeScript en navegador
  - feedback de errores de compilación
  - edición de ejemplos y validación sobre código real

- **Práctica de Next.js** (`/nextjs`)
  - módulo adicional dedicado a App Router, layouts, rendering, rutas y metadata
  - integración con el mismo sistema de progreso y editor de código

- **Autenticación y gestión de cuenta** (`/login`, `/register`, `/account`)
  - registro con hash bcrypt
  - login con JWT en cookies HTTP-only
  - edición de perfil y validación de contraseña actual

- **Tracking de progreso por módulo**
  - métricas de comandos ejecutados y únicos
  - estado global del dashboard
  - barra de dominio por tecnología

- **Terminales simuladas por módulo**
  - `SSH`: conexiones remotas, claves, archivos, prompt interactivo
  - `Docker`: contenedores, redes, volúmenes, compose
  - `PostgreSQL`: consultas SQL y psql simulados
  - `TypeScript`: edición y compilación
  - `Next.js`: conceptos y app router

- **UX móvil mejorada**
  - menú hamburguesa vertical superpuesto sobre la página
  - responsive y sin romper el ancho del contenido

- **Cron para `dont_stop`** (`/api/dont-stop`)
  - registros periódicos cada 2 horas para monitorización de actividad

---

## 📁 Estructura del proyecto

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
├── favicon.ico
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

---

## 🚀 Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Dashboard con resumen de progreso y acceso a módulos |
| `/docs` | Documentación técnica oficial por módulo |
| `/challenges` | Banco de retos semanales y progreso |
| `/account` | Perfil y configuración del usuario |
| `/ssh` | Práctica SSH |
| `/docker` | Práctica Docker |
| `/postgres` | Práctica PostgreSQL |
| `/typescript` | Práctica y editor TypeScript |
| `/nextjs` | Práctica de Next.js |
| `/login` | Inicio de sesión |
| `/register` | Registro |

---

## 🧩 Módulos y comportamiento

### Retos
- rotación semanal por módulo
- validación de cierre y repetición
- bloqueo de acceso a semanas futuras si no se completan las anteriores
- soluciones ocultas que aparecen según intentos fallidos o éxito

### Documentación
- búsqueda basada en el módulo activo
- extracción de contenido real desde páginas oficiales
- renderizado en tarjetas de artículo tipo documentación
- pantalla visualmente más clara y legible

### Editor de TypeScript / Next.js
- evaluación del código con TypeScript
- mensajes de compilación útiles
- integración con el flujo de práctica del proyecto

---

## 🗃️ Base de datos

El backend usa PostgreSQL en Supabase y se valida la existencia de tablas al iniciar operaciones de BD.

### Tablas principales

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dont_stop (
  id SERIAL PRIMARY KEY,
  source VARCHAR(100) DEFAULT 'cron_script',
  message TEXT DEFAULT 'Daily ping - Keep going, do not stop!',
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Variables de entorno requeridas

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
JWT_SECRET="clave-secreta"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## ⚙️ Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## 📌 Notas de desarrollo

- Los módulos de práctica están separados por carpeta con `page.tsx` y `commands.ts`.
- El `Navbar` usa menú hamburguesa en pantallas pequeñas y navegación horizontal en desktop.
- La documentación oficial se actualiza en función del módulo activo y la búsqueda del usuario.
- El código se mantiene en TypeScript con strict mode.
- El proyecto usa App Router de Next.js 16 y Turbopack.

---

## 🌐 Deploy

Se puede desplegar facilmente en Vercel o en cualquier entorno compatible con Next.js.

```bash
npm run build
```

---

## ⚖️ Licencia

Este proyecto está protegido con una licencia de uso restringido. Todos los derechos
sobre el código, estilo, contenido, assets y documentación quedan reservados.

No se permite la reutilización, modificación, redistribución, clonación, venta,
ni uso como base para otros proyectos sin autorización expresa por escrito del
propietario del repositorio.

Consulta el archivo [LICENSE](LICENSE) para más detalles.
