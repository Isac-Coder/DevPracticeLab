import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export interface LiveDocResponse {
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  isOnline: boolean;
  version: string;
  webResults?: { title: string; url: string; summary: string }[];
  content: {
    title: string;
    summary: string;
    quickLinks: { title: string; url: string }[];
    officialCommands: { name: string; syntax: string; description: string }[];
    liveReleaseNotes?: string;
    topics: { title: string; body: string; codeSample?: string }[];
  };
}

const SOURCES: Record<string, { name: string; url: string; rawUrl?: string }> = {
  ssh: {
    name: "OpenSSH Official Documentation & Manpages",
    url: "https://www.openssh.com/manual.html",
    rawUrl: "https://raw.githubusercontent.com/openssh/openssh-portable/master/README",
  },
  docker: {
    name: "Docker Engine & CLI Official Documentation",
    url: "https://docs.docker.com/engine/reference/commandline/cli/",
    rawUrl: "https://raw.githubusercontent.com/docker/cli/master/README.md",
  },
  postgres: {
    name: "PostgreSQL 16 Official Manual & SQL Reference",
    url: "https://www.postgresql.org/docs/current/",
    rawUrl: "https://raw.githubusercontent.com/postgres/postgres/master/README",
  },
  typescript: {
    name: "TypeScript 5.7+ Official Handbook & Compiler Reference",
    url: "https://www.typescriptlang.org/docs/",
    rawUrl: "https://raw.githubusercontent.com/microsoft/TypeScript/main/README.md",
  },
  nextjs: {
    name: "Next.js Official Documentation",
    url: "https://nextjs.org/docs",
    rawUrl: "https://raw.githubusercontent.com/vercel/next.js/canary/README.md",
  },
};

type DocBundle = {
  title: string;
  summary: string;
  quickLinks: { title: string; url: string }[];
  officialCommands: { name: string; syntax: string; description: string }[];
  topics: { title: string; body: string; codeSample?: string }[];
};

const stripHtml = (value: string) =>
  value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

const OFFICIAL_DOCS_BY_MODULE: Record<string, string[]> = {
  ssh: [
    "https://www.openssh.com/manual.html",
    "https://man.openbsd.org/ssh",
    "https://www.openssh.com/faq.html",
  ],
  docker: [
    "https://docs.docker.com/reference/commandline/cli/",
    "https://docs.docker.com/engine/reference/commandline/run/",
    "https://docs.docker.com/compose/",
  ],
  postgres: [
    "https://www.postgresql.org/docs/current/",
    "https://www.postgresql.org/docs/current/sql-commands.html",
    "https://www.postgresql.org/docs/current/indexes.html",
  ],
  typescript: [
    "https://www.typescriptlang.org/docs/",
    "https://www.typescriptlang.org/docs/handbook/",
    "https://www.typescriptlang.org/docs/handbook/utility-types.html",
  ],
  nextjs: [
    "https://nextjs.org/docs",
    "https://nextjs.org/docs/app",
    "https://nextjs.org/docs/learning/fundamentals/getting-started",
  ],
};

const normalizeSearchResultUrl = (href: string) => {
  const decoded = decodeHtmlEntities(href.replace(/&amp;/g, "&"));
  const match = decoded.match(/https?:\/\/[^\s"'<>]+/i) || decoded.match(/\/url\?q=(https?:\/\/[^\s"'<>]+)/i);

  if (!match) return "";

  const candidate = match[1] || match[0];
  return candidate.replace(/&.*/, "");
};

const cleanScrapedContent = (text: string) => {
  return text
    .replace(/^(Title|URL Source|Published Time|Author|Date|Markdown Content):\s*.*$/gim, "")
    .replace(/Skip to (main )?content/gi, "")
    .replace(/Select a display theme[\s\S]*?theme/gi, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\((https?:\/\/|\/)[^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
};

const isNavigationLikeText = (text: string) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  if (normalized.includes("http://") || normalized.includes("https://")) return true;
  if (normalized.length < 60) return true;

  const blockedPatterns = [
    /^Published Time:/i,
    /^Skip to (main )?content/i,
    /^Search/i,
    /^Latest$/i,
    /^Frameworks$/i,
    /^SDKs$/i,
    /^Other$/i,
    /^Docs$/i,
    /^Learn$/i,
    /^Showcase$/i,
    /^Blog$/i,
    /^Templates$/i,
    /^Deploy$/i,
    /^GitHub$/i,
    /^Vercel OSS$/i,
    /^Select a display theme/i,
    /^Ask AI$/i,
    /^The framework for building agents$/i,
    /^TypeScript Download Docs/i,
    /^Table of contents/i,
    /^On this page/i,
  ];

  return blockedPatterns.some((pattern) => pattern.test(normalized));
};

const compactSummary = (text: string, maxLength = 420) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
};

const extractRelevantScrapedSection = (rawText: string, queryTerms: string) => {
  const cleaned = cleanScrapedContent(rawText);
  const paragraphs = cleaned
    .split(/\n\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((p) => !isNavigationLikeText(p));

  const lowerQuery = queryTerms.toLowerCase();
  const tokens = lowerQuery.split(/\s+/).filter(Boolean);

  const relevant = paragraphs.filter((p) => {
    const lower = p.toLowerCase();
    return tokens.some((token) => lower.includes(token));
  });

  const selected = relevant.length > 0 ? [relevant[0]] : paragraphs.slice(0, 1);
  const uniqueSelected = [...new Map(selected.map((p) => [p.toLowerCase().slice(0, 180), p])).values()];
  const finalSelection = uniqueSelected
    .filter((p) => p.length > 60 && !isNavigationLikeText(p))
    .slice(0, 1);

  return compactSummary(finalSelection.join("\n\n"));
};

const searchWebForCommand = async (moduleParam: string, query: string, apiKey?: string, userId?: number | string) => {
  let finalApiKey = apiKey?.trim();

  if (!finalApiKey && userId) {
    try {
      const pool = getPool();
      const result = await pool.query("SELECT api_key FROM user_api_keys WHERE user_id = $1", [userId]);
      if (result.rows.length > 0) {
        finalApiKey = result.rows[0].api_key;
      }
    } catch (e) {
      console.error("Error fetching API key from DB in searchWebForCommand:", e);
    }
  }

  const moduleKey = moduleParam in OFFICIAL_DOCS_BY_MODULE ? moduleParam : "ssh";
  const officialDocs = OFFICIAL_DOCS_BY_MODULE[moduleKey];
  const queryTerms = (query || "documentation").trim();

  if (finalApiKey?.trim()) {
    try {
      const prompt = `Busca contenido documental oficial y relevante sobre "${queryTerms}" para ${moduleKey}. Devuelve SOLO JSON válido con esta estructura: {"results":[{"title":"...","summary":"..."}]} y máximo 3 resultados. Debe ser contenido documental, no enlaces ni anuncios. No agregues texto extra.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(finalApiKey.trim())}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? "")
          .join("") || "";

        const cleanText = text.replace(/```json|```/gi, "").trim();
        const parsed = JSON.parse(cleanText);
        const results = Array.isArray(parsed?.results) ? parsed.results : [];

        const normalized = results
          .filter((item: any) => item?.summary)
          .slice(0, 3)
          .map((item: any) => ({
            title: String(item.title || `${moduleKey.toUpperCase()} documentation`).trim(),
            url: "",
            summary: String(item.summary).trim(),
          }));

        if (normalized.length > 0) return normalized;
      }
    } catch {
      // continue to official docs fallback
    }
  }

  const results: { title: string; url: string; summary: string }[] = [];
  const seen = new Set<string>();

  for (const docUrl of officialDocs) {
    try {
      const jinaUrl = `https://r.jina.ai/http://${docUrl.replace(/^https?:\/\//, "")}`;
      const res = await fetch(jinaUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DevPracticeLab/1.0; +https://example.com)" },
        next: { revalidate: 3600 },
      });

      if (!res.ok) continue;

      const raw = await res.text();
      const titleMatch = raw.match(/^Title:\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : `${moduleKey.toUpperCase()} docs`;
      const summary = extractRelevantScrapedSection(raw, queryTerms);

      if (!summary || summary.length < 80) continue;
      if (!isQueryRelevant(title, summary, queryTerms)) continue;

      const signature = `${title.toLowerCase()}::${summary.toLowerCase().slice(0, 200)}`;
      if (seen.has(signature)) continue;

      seen.add(signature);
      results.push({
        title,
        url: docUrl,
        summary,
      });
    } catch {
      continue;
    }
  }

  return results.slice(0, 3);
};

const inputToSearch = (value: string, queryLower: string) => {
  if (!queryLower) return true;
  const target = value.toLowerCase();
  const queryTokens = queryLower.split(/\s+/).filter(Boolean);

  return queryTokens.every((token) => {
    const normalizedToken = token.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!normalizedToken) return true;

    const words = target.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
    if (words.includes(normalizedToken)) return true;

    return target.toLowerCase().includes(token.toLowerCase());
  });
};

const isQueryRelevant = (title: string, summary: string, query: string) => {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return true;

  const queryTerms = normalizedQuery.toLowerCase().split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return true;

  const haystack = `${title} ${summary}`.toLowerCase();
  const normalizedHaystack = haystack.replace(/[^a-z0-9\s]/g, " ");
  const haystackWords = normalizedHaystack.split(/\s+/).filter(Boolean);

  return queryTerms.every((term) => {
    const cleanTerm = term.replace(/[^a-z0-9]/g, "");
    if (!cleanTerm) return true;

    const exactWordMatch = haystackWords.includes(cleanTerm);
    if (exactWordMatch) return true;

    const fuzzyMatch = term.length <= 3
      ? haystack.includes(term)
      : haystackWords.some((word) => word.includes(cleanTerm) || cleanTerm.includes(word));

    return fuzzyMatch;
  });
};

const buildDocsFromOfficialSource = (moduleParam: string, html: string): DocBundle => {
  const text = stripHtml(html);
  const normalized = text.toLowerCase();
  const normalizedModule = (moduleParam === "docker" || moduleParam === "postgres" || moduleParam === "typescript" || moduleParam === "nextjs" || moduleParam === "ssh")
    ? moduleParam
    : "ssh";

  const commandTemplates: Record<string, { name: string; syntax: string; description: string }[]> = {
    ssh: [
      { name: "ssh", syntax: "ssh [options] [user@]hostname [command]", description: "Abre una sesión de terminal cifrada o ejecuta comandos remotos de forma segura." },
      { name: "ssh-keygen", syntax: "ssh-keygen -t ed25519 -C \"usuario@dominio.com\"", description: "Genera y gestiona pares de claves criptográficas SSH seguras." },
      { name: "ssh-copy-id", syntax: "ssh-copy-id -i ~/.ssh/id_ed25519.pub user@servidor", description: "Instala la clave pública en el archivo authorized_keys del servidor remoto." },
      { name: "scp", syntax: "scp -r ./carpeta usuario@servidor:/var/www/", description: "Copia archivos y directorios entre sistemas de forma segura mediante SSH." },
      { name: "rsync", syntax: "rsync -avzP ./archivos/ usuario@servidor:/destino/", description: "Sincroniza directorios y archivos de forma incremental y eficiente." },
      { name: "ssh-agent", syntax: "eval \"$(ssh-agent -s)\"", description: "Inicia el agente SSH para gestionar claves privadas en memoria." },
      { name: "ssh-add", syntax: "ssh-add ~/.ssh/id_ed25519", description: "Carga una clave privada en el agente para autenticación sin pedir contraseña." },
      { name: "ssh -L (Local Forwarding)", syntax: "ssh -L 8080:localhost:3000 usuario@servidor", description: "Crea un túnel local hacia un servicio o puerto remoto interno." },
      { name: "ssh -R (Remote Forwarding)", syntax: "ssh -R 8080:localhost:3000 usuario@servidor", description: "Expone un puerto local a través de la conexión en el servidor remoto." },
      { name: "ssh -D (SOCKS Proxy)", syntax: "ssh -D 1080 usuario@servidor", description: "Configura un proxy SOCKS dinámico para enrutar tráfico mediante el host remoto." },
      { name: "ProxyJump (-J)", syntax: "ssh -J usuario@bastion:22 usuario@servidor-privado", description: "Conexión a través de un host intermedio o servidor bastión." },
      { name: "~/.ssh/config", syntax: "Host prod\n  HostName 192.168.1.50\n  User ubuntu\n  IdentityFile ~/.ssh/id_ed25519", description: "Define alias y parámetros preconfigurados para conexiones frecuentes." },
      { name: "ssh-keyscan", syntax: "ssh-keyscan -H servidor.com >> ~/.ssh/known_hosts", description: "Obtiene y almacena las claves públicas del host remoto para validación." },
    ],
    docker: [
      { name: "docker run", syntax: "docker run -d -p 8080:80 --name mi-app nginx:alpine", description: "Crea e inicia un nuevo contenedor a partir de una imagen." },
      { name: "docker build", syntax: "docker build -t mi-app:1.0 -f Dockerfile .", description: "Construye una imagen personalizada desde las instrucciones de un Dockerfile." },
      { name: "docker compose up", syntax: "docker compose -f docker-compose.yml up -d", description: "Levanta y orquesta todos los servicios definidos en el archivo compose." },
      { name: "docker compose down", syntax: "docker compose down -v", description: "Detiene y elimina contenedores, redes y opcionalmente volúmenes." },
      { name: "docker ps", syntax: "docker ps -a --format \"table {{.ID}}\t{{.Names}}\t{{.Status}}\"", description: "Lista todos los contenedores existentes (en ejecución y detenidos)." },
      { name: "docker exec", syntax: "docker exec -it mi-contenedor /bin/sh", description: "Ejecuta comandos interactivos o scripts dentro de un contenedor en ejecución." },
      { name: "docker logs", syntax: "docker logs -f --tail 100 mi-contenedor", description: "Muestra y sigue en tiempo real los registros/logs emitidos por el contenedor." },
      { name: "docker volume", syntax: "docker volume create datos_app", description: "Crea y administra volúmenes persistentes independientes del ciclo de vida del contenedor." },
      { name: "docker network", syntax: "docker network create --driver bridge red_interna", description: "Crea redes virtuales aisladas para comunicación entre contenedores." },
      { name: "docker stop / start", syntax: "docker stop mi-contenedor && docker start mi-contenedor", description: "Detiene o reanuda la ejecución de contenedores existentes." },
      { name: "docker system prune", syntax: "docker system prune -a --volumes", description: "Limpia recursos no utilizados (imágenes huérfanas, contenedores detenidos, redes)." },
      { name: "docker stats", syntax: "docker stats --no-stream", description: "Muestra el consumo de CPU, memoria, red y disco de los contenedores activos." },
      { name: "docker inspect", syntax: "docker inspect mi-contenedor", description: "Obtiene información detallada de bajo nivel en JSON sobre un contenedor o imagen." },
      { name: "Dockerfile Instructions", syntax: "FROM node:20-alpine\nWORKDIR /app\nCOPY . .\nRUN npm install\nCMD [\"npm\", \"start\"]", description: "Sintaxis estándar para describir la construcción de una imagen de Docker." },
    ],
    postgres: [
      { name: "psql", syntax: "psql -h localhost -U postgres -d mi_base", description: "Cliente interactivo de consola para conectarse y administrar PostgreSQL." },
      { name: "SELECT", syntax: "SELECT id, nombre, email FROM usuarios WHERE activo = true ORDER BY id DESC LIMIT 10;", description: "Consulta filas de tablas con condiciones de filtrado, orden y límite." },
      { name: "INSERT INTO", syntax: "INSERT INTO usuarios (nombre, email) VALUES ('Ada', 'ada@ejemplo.com') RETURNING id;", description: "Inserta registros en una tabla y puede retornar los valores generados." },
      { name: "UPDATE", syntax: "UPDATE usuarios SET activo = false WHERE id = 5;", description: "Modifica registros existentes que cumplen una condición." },
      { name: "DELETE", syntax: "DELETE FROM sesiones WHERE expira_en < NOW();", description: "Elimina registros de acuerdo con una condición específica." },
      { name: "CREATE TABLE", syntax: "CREATE TABLE usuarios (id BIGSERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, creado_en TIMESTAMPTZ DEFAULT NOW());", description: "Define una nueva tabla con tipos de datos, llaves primarias y restricciones." },
      { name: "ALTER TABLE", syntax: "ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);", description: "Modifica la estructura de una tabla existente (añadir/eliminar columnas)." },
      { name: "CREATE INDEX", syntax: "CREATE INDEX idx_usuarios_email ON usuarios(email);", description: "Crea un índice B-Tree para optimizar búsquedas y consultas frecuentes." },
      { name: "Indexación JSONB (GIN)", syntax: "CREATE INDEX idx_meta_gin ON usuarios USING GIN (metadata);", description: "Permite indexar y buscar dentro de documentos JSONB con operadores `@>`, `?`." },
      { name: "JOIN (INNER / LEFT)", syntax: "SELECT u.nombre, p.total FROM usuarios u LEFT JOIN pedidos p ON u.id = p.usuario_id;", description: "Combina filas de dos o más tablas basándose en claves foráneas o relaciones." },
      { name: "Transacciones ACID", syntax: "BEGIN;\n  UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;\n  UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;\nCOMMIT;", description: "Bloque de operaciones atómicas con garantías de consistencia o ROLLBACK ante fallos." },
      { name: "CTE (WITH ... AS)", syntax: "WITH activos AS (SELECT * FROM usuarios WHERE activo = true)\nSELECT count(*) FROM activos;", description: "Define subconsultas temporales y legibles dentro de una consulta principal." },
      { name: "Window Functions", syntax: "SELECT nombre, salario, RANK() OVER (ORDER BY salario DESC) as ranking FROM empleados;", description: "Calcula métricas y ordenamientos sobre particiones de datos sin agrupar filas." },
      { name: "EXPLAIN ANALYZE", syntax: "EXPLAIN ANALYZE SELECT * FROM pedidos WHERE fecha >= '2026-01-01';", description: "Muestra el plan de ejecución real del motor con tiempos exactos de CPU e I/O." },
      { name: "pg_dump / pg_restore", syntax: "pg_dump -U postgres mi_base > backup.sql", description: "Genera copias de seguridad de bases de datos o restaura a partir de backups." },
    ],
    typescript: [
      { name: "Tipos Primitivos & Arrays", syntax: "let nombre: string = \"Ada\"; let items: number[] = [1, 2, 3];", description: "Tipos fundamentales para describir datos escalares y colecciones con tipado seguro." },
      { name: "Interfaces", syntax: "interface User {\n  id: number;\n  name: string;\n  email?: string;\n  readonly createdAt: Date;\n}", description: "Define contratos estructurales de objetos claros, extensibles y reutilizables." },
      { name: "Type Aliases & Union", syntax: "type ID = string | number;\ntype Status = \"idle\" | \"loading\" | \"success\" | \"error\";", description: "Declara alias para tipos primitivos, uniones literales y combinaciones complejas." },
      { name: "Generics (Genéricos)", syntax: "function wrap<T>(value: T): { data: T } {\n  return { data: value };\n}", description: "Permite crear funciones, interfaces y clases reutilizables con cualquier tipo seguro." },
      { name: "Utility Types: Partial & Required", syntax: "type UpdateUser = Partial<User>;\ntype StrictUser = Required<User>;", description: "Vuelve todas las propiedades de un tipo opcionales o requeridas respectivamente." },
      { name: "Utility Types: Pick & Omit", syntax: "type UserPreview = Pick<User, \"id\" | \"name\">;\ntype PublicUser = Omit<User, \"email\">;", description: "Construye tipos seleccionando o excluyendo propiedades específicas de otro tipo." },
      { name: "Utility Types: Record", syntax: "type RoleConfig = Record<\"admin\" | \"user\", string[]>;", description: "Construye un tipo de objeto cuyas propiedades son claves de un tipo y valores de otro." },
      { name: "Narrowing & Type Guards", syntax: "if (typeof val === \"string\") {\n  console.log(val.toUpperCase());\n}", description: "Reduce el rango de tipos en tiempo de ejecución mediante comprobaciones condicionales." },
      { name: "Satisfies Operator", syntax: "const theme = { color: \"emerald\", dark: true } satisfies ThemeConfig;", description: "Valida que una variable cumple un tipo sin ensanchar la inferencia exacta de sus propiedades." },
      { name: "Keyof & Typeof", syntax: "type UserKey = keyof User;\ntype State = typeof initialState;", description: "Extrae las propiedades de un tipo o infiere el tipo exacto a partir de una variable JS." },
      { name: "Strict Mode & TSConfig", syntax: "{\n  \"compilerOptions\": {\n    \"strict\": true,\n    \"noImplicitAny\": true\n  }\n}", description: "Activa el modo estricto para evitar nullish runtime errors y variables sin tipo." },
    ],
    nextjs: [
      { name: "App Router Structure", syntax: "app/layout.tsx + app/page.tsx + app/loading.tsx", description: "Organización de rutas y layouts mediante el sistema de carpetas de Next.js." },
      { name: "Server Components (RSC)", syntax: "export default async function Page() {\n  const data = await getData();\n  return <div>{data.title}</div>;\n}", description: "Componentes renderizados en el servidor por defecto para máxima velocidad y seguridad." },
      { name: "Client Components", syntax: "'use client';\nimport { useState } from 'react';", description: "Directiva para habilitar estado de React, hooks del navegador y eventos interactivos." },
      { name: "Server Actions", syntax: "'use server';\nexport async function updateProfile(formData: FormData) {\n  await db.update(...);\n}", description: "Funciones asíncronas seguras que mutan datos en el servidor sin crear endpoints manuales." },
      { name: "Route Handlers", syntax: "export async function GET(req: NextRequest) {\n  return NextResponse.json({ ok: true });\n}", description: "Define endpoints HTTP (GET, POST, PUT, DELETE) en rutas como `app/api/.../route.ts`." },
      { name: "Dynamic Routes & Params", syntax: "// app/posts/[slug]/page.tsx\nexport default async function Post({ params }: { params: Promise<{ slug: string }> })", description: "Genera páginas dinámicas que capturan variables en la URL." },
      { name: "Layouts & Templates", syntax: "export default function Layout({ children }: { children: React.ReactNode }) {\n  return <main>{children}</main>;\n}", description: "Estructuras de UI compartidas entre múltiples rutas preservando el estado." },
      { name: "Metadata API & SEO", syntax: "export const metadata = {\n  title: 'Documentación',\n  description: 'Guías y referencias',\n};", description: "Configuración de metadatos estáticos o dinámicos para indexación y SEO." },
      { name: "next/link & Navigation", syntax: "import Link from 'next/link';\n<Link href=\"/docs\">Documentación</Link>", description: "Navegación del lado del cliente ultra fluida con prefetching inteligente de rutas." },
      { name: "Middleware", syntax: "export function middleware(req: NextRequest) {\n  // Auth y redirecciones\n}", description: "Intercepción y procesamiento de peticiones antes de que se complete el renderizado." },
      { name: "Revalidation (ISR)", syntax: "revalidatePath('/docs');\nrevalidateTag('productos');", description: "Invalida la caché de páginas o datos bajo demanda sin reconstruir la app." },
    ],
  };

  const officialCommands = commandTemplates[normalizedModule] || commandTemplates.ssh;

  const defaultTopics: { title: string; body: string; codeSample?: string }[] = [
    {
      title: `${moduleParam.toUpperCase()} concepts and setup`,
      body: `Los conceptos principales de la documentación oficial explican cómo funciona ${moduleParam} en la práctica, qué problema resuelve y cuándo conviene usarlo.`,
    },
    {
      title: "Patterns and best practice",
      body: `La documentación oficial enfatiza patrones reutilizables, diseño seguro y buenas prácticas para mantener un código mantenible y fácil de escalar.`,
    },
  ];

  const extractedTopics = defaultTopics.map((topic, index) => ({
    ...topic,
    body: index === 0 ? `${topic.body} Fragmento de documentación oficial: ${text.slice(0, 250)}...` : topic.body,
  }));

  const resolvedModuleTitle = {
    ssh: "OpenSSH Protocol & Remote Administration Reference",
    docker: "Docker CLI & Container Engine Documentation",
    postgres: "PostgreSQL SQL Manual & Performance Guide",
    typescript: "TypeScript Language Guide & Type System Reference",
    nextjs: "Next.js App Router & Full-Stack Guide",
  }[normalizedModule] ?? "OpenSSH Protocol & Remote Administration Reference";

  const resolvedSummary = {
    ssh: "Manual y directrices de seguridad para conexiones remotas cifradas, autenticación mediante claves criptográficas Ed25519 y túneles de red.",
    docker: "Documentación sincronizada para Docker Engine, BuildKit, Docker Compose v2 y gestión de microservicios.",
    postgres: "Referencia técnica del motor relacional PostgreSQL, índices y transacciones ACID.",
    typescript: "Guía central de TypeScript: tipos, interfaces, utility types, patrones de diseño y validación estática del código.",
    nextjs: "Referencia oficial de Next.js centrada en App Router, layouts, rendering, rutas, SEO y componentes server/client.",
  }[normalizedModule] ?? "Documentación oficial del módulo.";

  return {
    title: resolvedModuleTitle,
    summary: resolvedSummary,
    quickLinks: [
      { title: "Documentación oficial", url: SOURCES[normalizedModule]?.url ?? SOURCES.ssh.url },
      { title: "Referencia rápida", url: "https://www.google.com/search?q=" + encodeURIComponent(`${normalizedModule} official docs`) },
    ],
    officialCommands: officialCommands.length > 0 ? officialCommands : [...(commandTemplates[normalizedModule] || commandTemplates.ssh)],
    topics: extractedTopics,
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleParam = searchParams.get("module")?.toLowerCase() || "ssh";
  const searchQuery = searchParams.get("search")?.trim() || "";
  const apiKey = searchParams.get("apiKey")?.trim() || "";

  const sourceConfig = SOURCES[moduleParam] || SOURCES.ssh;

  let remoteText = "";
  let isOnline = false;
  let webResults: { title: string; url: string; summary: string }[] = [];

  if (sourceConfig.url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(sourceConfig.url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; DevPracticeLab/1.0; +https://example.com)",
        },
        next: { revalidate: 3600 },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        remoteText = await res.text();
        isOnline = true;
      }
    } catch {
      isOnline = false;
    }
  }

  const fallback: Record<"ssh" | "docker" | "postgres" | "typescript" | "nextjs", DocBundle> = {
    ssh: {
      title: "OpenSSH Protocol & Remote Administration Reference",
      summary: "Manual y directrices de seguridad para conexiones remotas cifradas, autenticación mediante claves criptográficas Ed25519 y túneles de red.",
      quickLinks: [
        { title: "OpenSSH Manual Pages", url: "https://man.openbsd.org/ssh" },
        { title: "OpenSSH Portable Repository", url: "https://github.com/openssh/openssh-portable" },
        { title: "SSH Hardening Guide", url: "https://infosec.mozilla.org/guidelines/openssh" },
      ],
      officialCommands: [
        { name: "ssh", syntax: "ssh [options] [user@]hostname [command]", description: "Abre una sesión de terminal remota cifrada o ejecuta comandos remotos." },
        { name: "ssh-keygen", syntax: "ssh-keygen [-t type] [-b bits] [-C comment]", description: "Genera, administra y convierte claves de autenticación SSH." },
        { name: "ssh-copy-id", syntax: "ssh-copy-id [-i identity_file] [user@]machine", description: "Instala tu clave pública en el archivo authorized_keys remoto." },
        { name: "scp", syntax: "scp [options] source destination", description: "Copia archivos de forma segura entre hosts en una red." },
      ],
      topics: [
        {
          title: "Criptografía Moderna: Ed25519 vs RSA 4096",
          body: "Ed25519 ofrece claves más cortas, firmas más rápidas y mayor seguridad moderna para autenticación SSH.",
          codeSample: "ssh-keygen -t ed25519 -a 100 -C \"admin@production\"\nssh-copy-id -i ~/.ssh/id_ed25519.pub root@192.168.1.100",
        },
        {
          title: "Bastion Hosts & ProxyJump (-J)",
          body: "ProxyJump facilita la conexión a servidores internos usando un host intermedio seguro.",
          codeSample: "ssh -J bastion.empresa.com root@servidor-privado.local",
        },
      ],
    },
    docker: {
      title: "Docker CLI & Container Engine Documentation",
      summary: "Documentación sincronizada para Docker Engine, BuildKit, Docker Compose v2 y gestión de microservicios.",
      quickLinks: [
        { title: "Docker Docs Portal", url: "https://docs.docker.com/" },
        { title: "Docker Hub Registry", url: "https://hub.docker.com/" },
        { title: "Docker Compose Specification", url: "https://compose-spec.io/" },
      ],
      officialCommands: [
        { name: "docker run", syntax: "docker run [OPTIONS] IMAGE [COMMAND]", description: "Crea e inicia un nuevo contenedor a partir de una imagen." },
        { name: "docker compose", syntax: "docker compose [OPTIONS] COMMAND", description: "Define y ejecuta aplicaciones multicontenedor con YAML." },
        { name: "docker build", syntax: "docker build [OPTIONS] PATH | URL", description: "Construye una imagen desde un Dockerfile." },
        { name: "docker exec", syntax: "docker exec [OPTIONS] CONTAINER COMMAND", description: "Ejecuta un comando dentro de un contenedor en ejecución." },
      ],
      topics: [
        {
          title: "Ciclo de vida de contenedores",
          body: "Los contenedores se diseñan para ejecutarse como procesos aislados y efímeros.",
          codeSample: "docker run -d --name db-prod -v pg_data:/var/lib/postgresql/data -p 5432:5432 postgres:16-alpine",
        },
      ],
    },
    postgres: {
      title: "PostgreSQL SQL Manual & Performance Guide",
      summary: "Referencia técnica del motor relacional PostgreSQL, índices y transacciones ACID.",
      quickLinks: [
        { title: "PostgreSQL Documentation", url: "https://www.postgresql.org/docs/" },
        { title: "PostgreSQL SQL Commands", url: "https://www.postgresql.org/docs/current/sql-commands.html" },
      ],
      officialCommands: [
        { name: "SELECT", syntax: "SELECT ... FROM table WHERE ... ORDER BY ... LIMIT ...;", description: "Consulta filas de tablas con filtrado y orden." },
        { name: "INSERT", syntax: "INSERT INTO table (...) VALUES (...);", description: "Inserta registros en una tabla." },
        { name: "CREATE INDEX", syntax: "CREATE INDEX name ON table (column);", description: "Crea un índice para optimizar velocidad de consulta." },
      ],
      topics: [
        {
          title: "Indexación GIN para JSONB",
          body: "GIN permite buscar dentro de documentos JSONB efficiently con operadores específicos.",
          codeSample: "CREATE INDEX idx_meta_gin ON users USING GIN (metadata);",
        },
      ],
    },
    typescript: {
      title: "TypeScript Language Guide & Type System Reference",
      summary: "Guía central de TypeScript: tipos, interfaces, utility types, narrowing y validación estática del código.",
      quickLinks: [
        { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
        { title: "TSConfig Reference", url: "https://www.typescriptlang.org/tsconfig" },
        { title: "TypeScript Deep Dive", url: "https://basarat.gitbook.io/typescript/" },
      ],
      officialCommands: [
        { name: "Interfaces", syntax: "interface User { id: number; name: string }", description: "Definición de contratos reutilizables para objetos y modelos de dominio." },
        { name: "Tipos Union", syntax: "type Status = 'pending' | 'done' | 'error'", description: "Representa estados restringidos y seguros que evitan errores de lógica." },
        { name: "Genéricos", syntax: "function map<T>(items: T[], fn: (item: T) => T): T[]", description: "Permite crear componentes y funciones reutilizables con distintos tipos." },
        { name: "Utility Types", syntax: "Partial<User> | Pick<User, 'id'> | Omit<User, 'password'>", description: "Transforma tipos existentes para adaptar datos sin duplicar estructuras." },
      ],
      topics: [
        {
          title: "Utility Types y narrowing",
          body: "TypeScript incluye Partial, Omit y Narrowing para inferir tipos de forma segura y evitar errores de runtime.",
          codeSample: "type User = { id: number; name: string; passwordHash: string };\ntype PublicUser = Omit<User, \"passwordHash\">;\n\nfunction logName(value: string | null) {\n  if (value) console.log(value.toUpperCase());\n}",
        },
        {
          title: "Strict mode y DX",
          body: "Con strict mode activado, errores de null, tipos desconocidos y parámetros implícitos se detectan antes de desplegar.",
          codeSample: "{\n  \"compilerOptions\": {\n    \"strict\": true,\n    \"noImplicitAny\": true,\n    \"strictNullChecks\": true\n  }\n}",
        },
      ],
    },
    nextjs: {
      title: "Next.js App Router & Full-Stack Guide",
      summary: "Documentación oficial de Next.js centrada en App Router, layouts, server actions, rutas API y gestión del rendering.",
      quickLinks: [
        { title: "Next.js Docs", url: "https://nextjs.org/docs" },
        { title: "App Router", url: "https://nextjs.org/docs/app" },
        { title: "Learn Next.js", url: "https://nextjs.org/learn" },
      ],
      officialCommands: [
        { name: "App Router", syntax: "app/page.tsx + app/layout.tsx", description: "Modelo de rutas basado en carpetas que reemplaza la estructura Pages Router para aplicaciones modernas." },
        { name: "Server Components", syntax: "export default async function Page()", description: "Los componentes se renderizan del lado del servidor por defecto para mejorar rendimiento y seguridad." },
        { name: "Client Components", syntax: "'use client';", description: "Permite usar estado, eventos y hooks del navegador cuando la interactividad es necesaria." },
        { name: "Route Handlers", syntax: "app/api/hello/route.ts", description: "Define endpoints para crear APIs REST dentro del mismo proyecto Next.js." },
      ],
      topics: [
        {
          title: "Layouts y rutas",
          body: "Usa layouts para compartir estructura visual entre páginas y mantener consistencia global en la UI y navegación.",
          codeSample: "export default function RootLayout({ children }) {\n  return (\n    <html lang=\"es\">\n      <body>{children}</body>\n    </html>\n  );\n}",
        },
        {
          title: "Server Components y SEO",
          body: "Los Server Components optimizan la carga inicial y permiten renderizar contenido con mejor soporte para SEO y datos dinámicos.",
          codeSample: "export const metadata = { title: 'Dashboard', description: 'Panel principal' };\n\nexport default async function Page() {\n  return <h1>Hola mundo</h1>;\n}",
        },
      ],
    },
  };

  const session = await getSession();
  const userId = session?.userId;

  if (searchQuery) {
    webResults = await searchWebForCommand(moduleParam, searchQuery, apiKey || undefined, userId);
  }

  const fallbackKey = (moduleParam === "docker" || moduleParam === "postgres" || moduleParam === "typescript" || moduleParam === "nextjs" || moduleParam === "ssh")
    ? moduleParam
    : "ssh";
  const sourceData: DocBundle = remoteText ? buildDocsFromOfficialSource(moduleParam, remoteText) : fallback[fallbackKey];

  let liveData: LiveDocResponse;

  if (moduleParam === "docker") {
    liveData = {
      source: sourceConfig.name,
      sourceUrl: sourceConfig.url,
      lastUpdated: new Date().toISOString(),
      isOnline,
      version: "Docker v27.x Community Edition",
      webResults,
      content: {
        title: sourceData.title,
        summary: sourceData.summary,
        quickLinks: sourceData.quickLinks,
        officialCommands: sourceData.officialCommands,
        topics: sourceData.topics,
      },
    };
  } else if (moduleParam === "postgres") {
    liveData = {
      source: sourceConfig.name,
      sourceUrl: sourceConfig.url,
      lastUpdated: new Date().toISOString(),
      isOnline,
      version: "PostgreSQL 16.x / 17.x Relational Engine",
      webResults,
      content: {
        title: sourceData.title,
        summary: sourceData.summary,
        quickLinks: sourceData.quickLinks,
        officialCommands: sourceData.officialCommands,
        topics: sourceData.topics,
      },
    };
  } else if (moduleParam === "typescript") {
    liveData = {
      source: sourceConfig.name,
      sourceUrl: sourceConfig.url,
      lastUpdated: new Date().toISOString(),
      isOnline,
      version: "TypeScript v5.7+ Strict Edition",
      webResults,
      content: {
        title: sourceData.title,
        summary: sourceData.summary,
        quickLinks: sourceData.quickLinks,
        officialCommands: sourceData.officialCommands,
        topics: sourceData.topics,
      },
    };
  } else if (moduleParam === "nextjs") {
    liveData = {
      source: sourceConfig.name,
      sourceUrl: sourceConfig.url,
      lastUpdated: new Date().toISOString(),
      isOnline,
      version: "Next.js 15.x / App Router",
      webResults,
      content: {
        title: sourceData.title,
        summary: sourceData.summary,
        quickLinks: sourceData.quickLinks,
        officialCommands: sourceData.officialCommands,
        topics: sourceData.topics,
      },
    };
  } else {
    liveData = {
      source: sourceConfig.name,
      sourceUrl: sourceConfig.url,
      lastUpdated: new Date().toISOString(),
      isOnline,
      version: "OpenSSH 9.x / Secure Shell Protocol v2",
      webResults,
      content: {
        title: sourceData.title,
        summary: sourceData.summary,
        quickLinks: sourceData.quickLinks,
        officialCommands: sourceData.officialCommands,
        topics: sourceData.topics,
      },
    };
  }

  return NextResponse.json(liveData);
}
