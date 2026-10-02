# 🧠 DevPracticeLab

Plataforma educativa para practicar **SSH**, **Docker**, **PostgreSQL** y **TypeScript** con retos semanales, documentación oficial, edición de código real, IA técnica y progresión por módulos.

Construido con **Next.js 16.3.6**, **React 19**, **Tailwind CSS 4**, **TypeScript 5** y PostgreSQL + Supabase.

---

## ✨ Estado actual del proyecto

La aplicación ya incluye varias capas funcionales integradas:

- Retos con bloqueo, paginación y validación por semana.
- Editor compartido para TypeScript y PostgreSQL.
- Persistencia de workspace y archivos del editor por usuario.
- PostgreSQL simulado con tablas dinámicas, creación y eliminación de tablas por SQL.
- Resultado de consulta visible en el panel lateral del módulo PostgreSQL.
- Compilación con atajo `Ctrl + Enter` / `Cmd + Enter`.
- Documentación oficial por módulo con extracción textual.
- IA técnica con soporte Gemini y fallback local.
- Suscripción por módulos y perfil del usuario.

---

## 🧩 Funcionalidades principales

### 1) Editor de práctica reutilizable
El componente `CodePracticeEditor` se usa tanto para TypeScript como para PostgreSQL y ofrece:

- pestañas de archivos
- importar archivos locales
- exportar archivo activo
- renombrar y borrar archivos
- resaltado de líneas y scroll sincronizado
- guardado automático del workspace por módulo
- atajo de compilación `Ctrl + Enter`
- resultado de compilación bajo el editor en TypeScript

### 2) PostgreSQL interactivo
En la ruta `/postgres` el usuario puede:

- ejecutar consultas SQL simuladas
- crear y eliminar tablas con `CREATE TABLE` y `DROP TABLE`
- ver tablas disponibles en un sidebar
- expandir la estructura de una tabla con clic
- consultar la base de datos de ejemplo
- mantener el estado persistido mediante `sessionStorage` y `localStorage`

### 3) TypeScript real
En `/typescript` el editor compila el código con `typescript.transpileModule` y muestra errores reales de compilación.

### 4) Rutas de aprendizaje y progreso
Se gestionan perfiles, avance, módulos activos y retos por semana con reglas de desbloqueo.

### 5) Documentación oficial
En `/docs` se realiza búsqueda por módulo y render de contenido extraído de páginas reales de referencia.

### 6) IA técnica
El chatbot cuenta con fallback local, reintentos de llamadas, persistencia de chat y configuración de Gemini.

---

## 📁 Estructura principal del proyecto

```text
app/
├── account/
│   └── page.tsx
├── api/
│   ├── ai-keys/
│   │   └── route.ts
│   ├── auth/
│   │   ├── api-key/
│   │   │   └── route.ts
│   │   ├── login/
│   │   │   └── route.ts
│   │   ├── logout/
│   │   │   └── route.ts
│   │   ├── me/
│   │   │   └── route.ts
│   │   ├── register/
│   │   │   └── route.ts
│   │   └── update-account/
│   │       └── route.ts
│   ├── chat/
│   │   └── route.ts
│   ├── docs/
│   │   └── route.ts
│   ├── dont-stop/
│   │   └── route.ts
│   ├── editor-workspace/
│   │   └── route.ts
│   ├── lint/
│   │   └── route.ts
│   ├── modules/
│   │   ├── available/
│   │   │   └── route.ts
│   │   ├── gemini-key/
│   │   │   └── route.ts
│   │   └── subscribe/
│   │       └── route.ts
│   └── ...
├── challenges/
│   └── page.tsx
├── components/
│   ├── AiChatbot.tsx
│   ├── CodePracticeEditor.tsx
│   ├── Navbar.tsx
│   ├── PracticeAuthGuard.tsx
│   ├── PracticeCard.tsx
│   ├── PracticeProgressBar.tsx
│   └── SimulatedTerminal.tsx
├── docker/
│   ├── commands.ts
│   └── page.tsx
├── docs/
│   └── page.tsx
├── login/
│   └── page.tsx
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
public/
scripts/
└── daily-dont-stop.js
```

---

## 🚀 Rutas relevantes

| Ruta | Tipo | Descripción |
| --- | --- | --- |
| `/` | App Router | Dashboard principal |
| `/challenges` | Client Page | Retos progresivos |
| `/ranking` | Client Page | Ranking público por puntos y retos completados |
| `/docs` | Client Page | Documentación oficial |
| `/account` | Client Page | Perfil y suscripciones |
| `/ssh` | Client Page | Práctica SSH |
| `/docker` | Client Page | Práctica Docker |
| `/postgres` | Client Page | SQL interactivo |
| `/typescript` | Client Page | Editor TypeScript |
| `/login` | Client Page | Inicio de sesión |
| `/register` | Client Page | Registro |
| `/api/editor-workspace` | Route Handler | Guardado de archivos por módulo |
| `/api/challenges/completions` | Route Handler | Estado, puntos y duración de retos |
| `/api/challenges/leaderboard` | Route Handler | Datos públicos del ranking |
| `/api/docs` | Route Handler | Documentación y scraping |
| `/api/modules/available` | Route Handler | Módulos disponibles |
| `/api/modules/subscribe` | Route Handler | Suscripción de usuario |
| `/api/chat` | Route Handler | Chat de IA |

---

## 🧠 Modelo de datos y persistencia

### Workspace del editor
El editor guarda el contenido por módulo y usuario mediante la API de editor-workspace.

- GET: carga archivos del workspace actual
- PUT: guarda archivos, línea activa y módulo
- validación de tamaño máximo y número de archivos
- guardado por usuario autenticado

### Estado SQL de tablas
El módulo PostgreSQL persiste las tablas creadas en:

- `sessionStorage` para la sesión activa
- `localStorage` como respaldo persistente del navegador

Esto permite que los cambios de esquema no desaparezcan al recargar.

---

## 🔐 Autenticación y base de datos

El proyecto usa:

- PostgreSQL + Supabase
- cookies JWT HTTP-only
- `bcryptjs` para hash de contraseñas
- `jose` para sesiones JWT
- `pg` pool en la capa de acceso a datos

### Tablas clave
- `users`
- `user_challenge_completions`
- `user_challenge_leaderboard`
- `available_modules`
- `user_module_subscriptions`
- `dont_stop`
- workspace/editor data si se activa en la base de datos

El ranking se calcula con los puntos de retos resueltos y conserva el tiempo empleado para mostrar el promedio. Los retos completados antes de registrar duración aparecen con el tiempo como “Sin datos”.

---

## ⚙️ Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## ✅ Estado validado

El proyecto se ha verificado con compilación real usando:

```bash
npm run build
```

Resultado verificado: compilación exitosa de Next.js y generación de rutas.

---

## 📌 Notas importantes

- El editor compartido es la base para SQL y TypeScript.
- El módulo PostgreSQL es un entorno de práctica simulado, no una conexión real a servidor SQL.
- La documentación prioriza contenido oficial y útil sobre enlaces vacíos.
- El proyecto está protegido por licencia restringida.

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
