# 🖥️ DevPracticeLab

Plataforma interactiva para practicar comandos de **SSH**, **Docker** y **PostgreSQL** en terminales simuladas, sin necesidad de configurar servidores reales.

Construido con [Next.js](https://nextjs.org) 16, [React](https://react.dev) 19, [Tailwind CSS](https://tailwindcss.com) 4 y [Lucide Icons](https://lucide.dev).

---

## ✨ Características

- **Autenticación completa** (`/login`, `/register`) — Registro e inicio de sesión conectado a base de datos PostgreSQL en Supabase con hash de contraseñas (`bcryptjs`) y tokens de sesión JWT (`jose`).
- **Endpoint y Cron `dont_stop` (cada 2 horas)** (`/api/dont-stop`) — Servicio programado para ejecutarse cada 2 horas (mediante Vercel Cron en producción o script local con `node-cron`) enviando registros a la tabla `dont_stop` en Supabase PostgreSQL.
- **Dashboard** (`/`) — Página principal con explicación de la app, estado de usuario, tarjetas de selección y guía de uso.
- **Práctica SSH** (`/ssh`) — Terminal con tema verde estilo Linux. Simula conexiones a servidores, generación de claves, transferencia de archivos y navegación de sistema de archivos.
- **Práctica Docker** (`/docker`) — Terminal con tema azul. Gestión de contenedores, imágenes, redes, volúmenes y Docker Compose.
- **Práctica PostgreSQL** (`/postgres`) — Terminal con tema índigo. Consultas SQL con tablas pre-cargadas, soporte para SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, y meta-comandos psql.
- **Comando `--help`** disponible en cada terminal con la lista completa de comandos.
- **Historial de comandos** con flechas arriba/abajo y `clear` para limpiar.
- **Estilo adaptativo** — cada página cambia su paleta de colores según la tecnología seleccionada.

---

## 📁 Estructura del proyecto

```
app/
├── components/                 # Componentes globales reutilizables
│   ├── Navbar.tsx              # Barra de navegación (presente en todas las páginas)
│   ├── SimulatedTerminal.tsx   # Terminal interactiva configurable
│   └── PracticeCard.tsx        # Tarjetas de selección del dashboard
├── ssh/                        # Módulo de práctica SSH
│   ├── page.tsx                # Página /ssh — tema verde
│   └── commands.ts             # Comandos simulados: ssh, scp, ssh-keygen, ls, cd, etc.
├── docker/                     # Módulo de práctica Docker
│   ├── page.tsx                # Página /docker — tema azul
│   └── commands.ts             # Comandos simulados: docker run, ps, images, compose, etc.
├── postgres/                   # Módulo de práctica PostgreSQL
│   ├── page.tsx                # Página /postgres — tema índigo
│   └── commands.ts             # Comandos simulados: SELECT, INSERT, \dt, \d, etc.
├── page.tsx                    # Dashboard principal (/)
├── layout.tsx                  # Layout raíz
├── globals.css                 # Estilos globales + scrollbar + cursor
└── favicon.ico
public/                         # Archivos estáticos
```

---

## 🚀 Rutas

| Ruta                  | Tipo   | Descripción                                   | Tema           |
| --------------------- | ------ | --------------------------------------------- | -------------- |
| `/`                   | Página | Dashboard — explicación y selección            | Zinc/Emerald   |
| `/login`              | Página | Inicio de sesión verificado con backend        | Zinc/Emerald   |
| `/register`           | Página | Registro de usuarios en PostgreSQL            | Zinc/Emerald   |
| `/ssh`                | Página | Terminal SSH con servidores simulados           | Verde (green)  |
| `/docker`             | Página | Terminal Docker con contenedores simulados      | Azul (sky)     |
| `/postgres`           | Página | Terminal PostgreSQL con tablas pre-cargadas     | Índigo (indigo)|
| `/api/auth/register`  | API    | POST: Registrar usuario en Supabase Postgres  | Backend        |
| `/api/auth/login`     | API    | POST: Iniciar sesión y generar JWT en Cookie  | Backend        |
| `/api/auth/me`        | API    | GET: Obtener usuario autenticado actual       | Backend        |
| `/api/auth/logout`    | API    | POST: Cerrar sesión                           | Backend        |
| `/api/dont-stop`      | API    | POST/GET: Envío y consulta a tabla `dont_stop`| Backend        |

---

## ⏰ Automatización `dont_stop` (Cada 2 horas)

El proyecto cuenta con ejecución periódica cada 2 horas para mantener la actividad en la tabla `dont_stop`:

1. **En Vercel (Producción):** Configurado automáticamente mediante `vercel.json` con Vercel Cron (`0 */2 * * *`).
2. **En Local / Servidor:** Script `scripts/daily-dont-stop.js` con `node-cron`.

```bash
# Iniciar el daemon del cron local (cada 2 horas):
npm run cron:dont-stop

# Enviar una petición inmediata a dont_stop:
npm run cron:ping
```

---

## 🔧 Tecnologías

- **Next.js 16** — App Router con Turbopack
- **React 19** — Componentes funcionales con hooks
- **Tailwind CSS 4** — Diseño responsivo y temas por página
- **Lucide React** — Iconos SVG consistentes
- **TypeScript** — Tipado estricto

---

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd practica-ssh

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 📜 Scripts disponibles

| Script          | Comando            | Descripción                        |
| --------------- | ------------------ | ---------------------------------- |
| `dev`           | `npm run dev`      | Servidor de desarrollo (Turbopack) |
| `build`         | `npm run build`    | Build de producción                |
| `start`         | `npm run start`    | Servidor de producción             |
| `lint`          | `npm run lint`     | Lint con ESLint                    |

---

## 🖥️ Terminales simuladas — Comandos disponibles

### SSH (`--help`)
- `ssh root@<host>` — Conectar a servidor remoto (usuario `root`, contraseña `A12345678`)
- `ssh-keygen` — Generar par de claves
- `ssh-copy-id` — Copiar clave pública
- `scp` — Copiar archivos via SSH
- `sftp root@<host>` — Sesión SFTP
- `ls`, `cd`, `pwd`, `cat` — Navegación de archivos
- `whoami`, `hostname`, `uname` — Info del sistema
- Servidores: `192.168.1.100`, `10.0.0.50`, `servidor.ejemplo.com` (todos con `root` / `A12345678`)

### Docker (`--help`)
- `docker run`, `docker ps`, `docker stop`, `docker rm` — Contenedores
- `docker images`, `docker pull`, `docker rmi`, `docker build` — Imágenes
- `docker network ls/create`, `docker volume ls/create` — Redes y volúmenes
- `docker compose up/down` — Orquestación
- `docker logs`, `docker exec`, `docker stats`, `docker inspect` — Monitoreo

### PostgreSQL (`--help`)
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` — Operaciones CRUD
- `CREATE TABLE`, `DROP TABLE`, `ALTER TABLE` — DDL
- `\dt`, `\d <tabla>`, `\l`, `\du` — Meta-comandos psql
- Tablas pre-cargadas: `usuarios`, `productos`, `pedidos`

---

## 🌐 Deploy

La forma más sencilla de desplegar es usando [Vercel](https://vercel.com/new):

```bash
npm run build
```

Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para más opciones.
