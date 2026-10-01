# DevPracticeLab — Guía técnica para desarrollo

## Descripción

DevPracticeLab es una aplicación educativa orientada a la práctica aplicada de sistemas y lenguajes: SSH, Docker, PostgreSQL y TypeScript.

La base del proyecto es una app Next.js con App Router, UI en React + Tailwind y una capa de lógica educativa con validación, progreso y documentación integrada.

## Stack

- Next.js 16.3.6
- React 19
- Tailwind CSS 4
- TypeScript 5 (strict mode)
- PostgreSQL + Supabase
- `bcryptjs`, `jose`
- `node-cron`
- Turbopack

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

## Flujos clave

### Editor reutilizable
El componente `CodePracticeEditor` es compartido por PostgreSQL y TypeScript.

Incluye:
- gestión de archivos
- import/export
- nombre y eliminación
- scroll sincronizado de líneas
- atajo `Ctrl + Enter`
- resultado de compilación
- persistencia del workspace por módulo

### PostgreSQL práctico
La ruta `/postgres` incluye:
- ejecución de SQL simulada
- `CREATE TABLE` y `DROP TABLE`
- sidebar con lista de tablas
- detalle de estructura por tabla
- resultado de consulta visible en el panel asociado
- persistencia de esquema en navegador

### TypeScript
La ruta `/typescript` valida código usando `typescript.transpileModule` y muestra errores reales del compilador.

### Documentación oficial
La API de docs busca información desde fuentes reales y la renderiza dentro de la app, filtrando por módulo y contenido relevante.

### IA técnica
El chatbot usa Gemini si está configurado, con fallback local y reintentos para una experiencia robusta.

## Autenticación y base de datos

- JWT en cookies HTTP-only
- usuarios con hash de contraseña usando `bcryptjs`
- módulos disponibles y suscripciones por usuario
- validación de tablas faltantes antes de CRUD

## Variables de entorno

```env
DATABASE_URL="..."
JWT_SECRET="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Verificación

Se valida con:

```bash
npm run build
```

## Reglas importantes

- No utilizar la variable reservada `module` en archivos de Next.js.
- Mantener el editor con salida de resultado solo donde corresponde: TypeScript bajo el editor, PostgreSQL en el panel lateral.
- Cuidar la persistencia del estado del editor y del SQL para no romper la UX.
- Mantener el contenido técnico verificable y acotado.

## Nota legal

El código y el contenido están protegidos por licencia de uso restringido.
