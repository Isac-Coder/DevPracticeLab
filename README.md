# 🧠 DevPracticeLab

Plataforma educativa práctica para entrenar **SSH**, **Docker**, **PostgreSQL**, **TypeScript** y **Next.js** con rutas de aprendizaje, retos semanales, documentación oficial y ejercitación real de código.

Construido con [Next.js](https://nextjs.org) 16.3.6, [React](https://react.dev) 19, [Tailwind CSS](https://tailwindcss.com) 4, [Lucide React](https://lucide.dev) y PostgreSQL con Supabase.

---

## ✨ Características principales

- **Retos semanales con regla de progresión y bloqueo** (`/challenges`)
  - Banco ampliado a 50 retos por módulo, con 5 módulos activos: SSH, Docker, PostgreSQL, TypeScript y Next.js.
  - Validación de respuestas con feedback inmediato.
  - Bloqueo de retos repetidos tras fallo o finalización correcta.
  - Restricción por semanas: no se permite pasar a la siguiente si la anterior no está completada.
  - Paginación por grupos de 6 retos y límite visual de 5 números de página.
  - Revelación progresiva de la solución según el resultado del intento.

- **Documentación oficial por módulo** (`/docs`, `/api/docs`)
  - Búsqueda filtrada por módulo activo.
  - Extracción de contenido relevante desde páginas oficiales y no solo enlaces planos.
  - Renderizado del contenido como documentación útil, no como resultados crudos.
  - Soporte opcional para clave de Gemini API Studio.
  - Incluye explicación de qué hace cada comando o concepto y cómo se usa.

- **Práctica con TypeScript real** (`/typescript`)
  - Editor para escribir y validar código TypeScript.
  - Feedback de compilación real.
  - Ejemplos interactivos con validación del resultado.

- **Módulo oficial de Next.js** (`/nextjs`)
  - Sección dedicada a App Router, layouts, rendering, rutas, metadata y estructuras propias de Next.js.
  - Integrado con el flujo de progreso del usuario y el editor de práctica.

- **Autenticación, cuenta y suscripción por módulo** (`/login`, `/register`, `/account`)
  - Registro con bcrypt y JWT HTTP-only.
  - Gestión del perfil del usuario.
  - Selección de módulos activos por suscripción.
  - Persistencia en tablas de relación entre usuarios y módulos disponibles.

- **Seguimiento de progreso y nivel de cuenta**
  - Barra de progreso contextualizada por módulo.
  - Cálculo de niveles de experiencia y avance del usuario.
  - Estado global del dashboard para cada tecnología.

- **Terminales simuladas por módulo**
  - SSH: conexión, archivos, permisos, comandos remotos.
  - Docker: contenedores, redes, volúmenes, compose.
  - PostgreSQL: consultas SQL, gestión de datos.
  - TypeScript: compilación y validación.
  - Next.js: conceptos del framework, routing y renderizado.

- **UX mejorada y responsive**
  - Menú hamburguesa vertical superpuesto en móvil.
  - Layout más legible y menos saturado en documentación.
  - Sin romper el ancho del contenido principal.

- **Cron de actividad** (`/api/dont-stop`)
  - Automatización para registrar señales de actividad del usuario y mantener seguimiento.

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
│   ├── dont-stop/route.ts
│   ├── modules/
│   │   ├── available/route.ts
│   │   └── subscribe/route.ts
│   └── ...
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

---

## 🚀 Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Dashboard principal y acceso a módulos |
| `/docs` | Documentación oficial por módulo |
| `/challenges` | Retos y lógica de progreso |
| `/account` | Perfil, nivel y suscripción a módulos |
| `/ssh` | Práctica SSH |
| `/docker` | Práctica Docker |
| `/postgres` | Práctica PostgreSQL |
| `/typescript` | Editor y práctica TypeScript |
| `/nextjs` | Módulo de práctica Next.js |
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/api/modules/available` | Módulos disponibles y suscritos del usuario |
| `/api/modules/subscribe` | Guardado de suscripciones por módulo |
| `/api/docs` | Búsqueda y extracción de documentación oficial |

---

## 🧩 Sistema de módulos y suscripción

La app permite que el usuario elija qué módulos quiere tener activos en su perfil. Esto se almacena con una relación entre el usuario y los módulos disponibles.

### Tablas principales

```sql
CREATE TABLE IF NOT EXISTS public.available_modules (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_module_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL REFERENCES public.available_modules(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);
```

En la práctica:
- Los módulos disponibles se leen desde la base de datos.
- El usuario puede activarlos o desactivarlos desde la cuenta.
- Al registrarse, el sistema puede dejar al usuario suscrito a todos los módulos por defecto.

---

## 🧠 Lógica de retos y progreso

- Rotación semanal por módulo.
- Validación de respuesta antes de marcar como completado.
- Bloqueo de reintentos repetidos cuando la respuesta es incorrecta.
- Restricción de semanas futuras si no se han completado las anteriores.
- Paginación de 6 retos por página.
- Límite visual de 5 páginas mostradas en paralelo.
- Soluciones reveladas tras acierto o tras varios fallos.

---

## 📚 Documentación oficial

La documentación ha sido diseñada para priorizar contenido real y útil sobre enlaces sin contexto.

### Características
- Filtro por módulo activo.
- Búsqueda por conceptos, comandos o temas.
- Extracción de contenido textual desde fuentes oficiales.
- Presentación como material documental, no como URLs brutas.
- Explicación de qué hace cada comando o concepto y cómo se usa.
- Soporte opcional para Gemini API Studio si se configura una clave.

---

## 🗃️ Base de datos y autenticación

El backend usa PostgreSQL en Supabase y valida la existencia de tablas antes de cada operación crítica.

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

- La app usa App Router de Next.js con Turbopack.
- El tipado se mantiene en TypeScript strict mode.
- La lógica de documentación y módulos está separada por backend y UI.
- El menú móvil usa overlay vertical para mejorar la experiencia sin romper la anchura del contenido.
- La base de datos se inicializa de forma idempotente para crear tablas faltantes antes de ejecutar CRUD.

---

## 🌐 Deploy

La app puede desplegarse en Vercel o en cualquier entorno compatible con Next.js.

```bash
npm run build
```

---

## ⚖️ Licencia

Este proyecto está protegido con una licencia de uso restringido. Todos los derechos sobre el código, estilos, contenido, assets, documentación y materiales asociados quedan reservados.

No se permite reutilizar, clonar, redistribuir, modificar, vender ni usar el código o contenido como base para otros proyectos sin autorización expresa por escrito del propietario.

Consulta el archivo [LICENSE](LICENSE) para más detalles.
