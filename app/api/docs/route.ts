import { NextRequest, NextResponse } from "next/server";

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
    .replace(/^Title:\s*.*$/m, "")
    .replace(/^URL Source:\s*.*$/m, "")
    .replace(/^Markdown Content:\s*/m, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\((https?:\/\/|\/)[^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .trim();
};

const isNavigationLikeText = (text: string) => {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  if (normalized.includes("http://") || normalized.includes("https://")) return true;
  if (normalized.length < 80) return true;

  const blockedPatterns = [
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
    /^Skip to content$/i,
    /^Select a display theme/i,
    /^Ask AI$/i,
    /^The framework for building agents$/i,
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
  const relevant = paragraphs.filter((p) => {
    const lower = p.toLowerCase();
    return lowerQuery.split(/\s+/).filter(Boolean).every((token) => lower.includes(token));
  });

  const selected = relevant.length > 0 ? relevant.slice(0, 3) : paragraphs.slice(0, 3);
  const uniqueSelected = [...new Map(selected.map((p) => [p.toLowerCase().slice(0, 180), p])).values()];
  const finalSelection = uniqueSelected
    .filter((p) => p.length > 80 && !isNavigationLikeText(p))
    .slice(0, 2);

  return compactSummary(finalSelection.join("\n\n"));
};

const searchWebForCommand = async (moduleParam: string, query: string, apiKey?: string) => {
  const moduleKey = moduleParam in OFFICIAL_DOCS_BY_MODULE ? moduleParam : "ssh";
  const officialDocs = OFFICIAL_DOCS_BY_MODULE[moduleKey];
  const queryTerms = (query || "documentation").trim();

  if (apiKey?.trim()) {
    try {
      const prompt = `Busca contenido documental oficial y relevante sobre "${queryTerms}" para ${moduleKey}. Devuelve SOLO JSON válido con esta estructura: {"results":[{"title":"...","summary":"..."}]} y máximo 3 resultados. Debe ser contenido documental, no enlaces ni anuncios. No agregues texto extra.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
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
      { name: "ssh", syntax: "ssh [options] [user@]hostname [command]", description: "Conexión segura a un host remoto." },
      { name: "ssh-keygen", syntax: "ssh-keygen [-t type] [-b bits] [-C comment]", description: "Genera y gestiona claves SSH." },
      { name: "ssh-copy-id", syntax: "ssh-copy-id [-i identity_file] [user@]machine", description: "Instala la clave pública en el servidor remoto." },
      { name: "scp", syntax: "scp [options] source destination", description: "Copia archivos entre sistemas de forma segura." },
      { name: "rsync", syntax: "rsync -avz carpeta/ usuario@servidor:/ruta/", description: "Sincroniza directorios de forma eficiente entre hosts." },
      { name: "ssh-agent", syntax: "eval \"$(ssh-agent -s)\"", description: "Inicia el agente SSH para gestionar claves en memoria." },
      { name: "ssh-add", syntax: "ssh-add ~/.ssh/id_ed25519", description: "Carga una clave privada para autenticación automática." },
      { name: "ssh -L", syntax: "ssh -L 8080:localhost:3000 usuario@servidor", description: "Crea un túnel local hacia un servicio remoto." },
      { name: "ssh -R", syntax: "ssh -R 8080:localhost:3000 usuario@servidor", description: "Exponer un puerto local a través de la conexión remota." },
      { name: "ssh -D", syntax: "ssh -D 8080 usuario@servidor", description: "Configura un proxy SOCKS para traficar conexiones." },
      { name: "ProxyJump", syntax: "ssh -J bastion host", description: "Conexión a través de un nodo intermedio." },
    ],
    docker: [
      { name: "docker run", syntax: "docker run [OPTIONS] IMAGE [COMMAND]", description: "Creación e inicio de un contenedor." },
      { name: "docker build", syntax: "docker build [OPTIONS] PATH | URL", description: "Construcción de una imagen desde un Dockerfile." },
      { name: "docker compose", syntax: "docker compose [OPTIONS] COMMAND", description: "Definición de servicios multicontenedor." },
      { name: "docker exec", syntax: "docker exec [OPTIONS] CONTAINER COMMAND", description: "Ejecución de comandos dentro de un contenedor activo." },
      { name: "docker volume", syntax: "docker volume create NAME", description: "Persistencia de datos fuera del contenedor." },
      { name: "docker network", syntax: "docker network create mi-red", description: "Crea una red virtual para conectar contenedores." },
      { name: "docker ps", syntax: "docker ps -a", description: "Lista todos los contenedores, activos y detenidos." },
      { name: "docker logs", syntax: "docker logs -f mi-app", description: "Muestra y sigue los logs de un contenedor." },
      { name: "docker image prune", syntax: "docker image prune -a", description: "Elimina imágenes no utilizadas para limpiar el sistema." },
      { name: "docker compose up", syntax: "docker compose up -d", description: "Inicia servicios definidos en un archivo compose." },
      { name: "docker compose down", syntax: "docker compose down", description: "Detiene y elimina contenedores definidos por compose." },
      { name: "docker stats", syntax: "docker stats", description: "Muestra consumo de recursos de los contenedores." },
    ],
    postgres: [
      { name: "psql", syntax: "psql -h localhost -U postgres -d mi_base", description: "Cliente interactivo para conectarse a PostgreSQL." },
      { name: "SELECT", syntax: "SELECT ... FROM table WHERE ... ORDER BY ... LIMIT ...;", description: "Consulta de filas con filtrado, orden y límite." },
      { name: "INSERT", syntax: "INSERT INTO table (...) VALUES (...);", description: "Inserción de registros en una tabla." },
      { name: "UPDATE", syntax: "UPDATE usuarios SET edad = 26 WHERE id = 1;", description: "Actualiza registros específicos en una tabla." },
      { name: "DELETE", syntax: "DELETE FROM usuarios WHERE id = 1;", description: "Elimina registros de acuerdo con una condición." },
      { name: "CREATE TABLE", syntax: "CREATE TABLE usuarios (id SERIAL PRIMARY KEY, nombre VARCHAR(100));", description: "Define una nueva tabla con columnas y tipos de dato." },
      { name: "ALTER TABLE", syntax: "ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);", description: "Modifica la estructura de una tabla existente." },
      { name: "DROP TABLE", syntax: "DROP TABLE IF EXISTS usuarios;", description: "Elimina una tabla y su contenido de manera segura." },
      { name: "CREATE INDEX", syntax: "CREATE INDEX idx_usuarios_email ON usuarios(email);", description: "Optimización de consultas mediante índices." },
      { name: "BEGIN / COMMIT", syntax: "BEGIN; ... COMMIT;", description: "Bloque transaccional con aislamiento ACID." },
      { name: "ROLLBACK", syntax: "ROLLBACK;", description: "Deshace cambios pendientes en una transacción." },
      { name: "CREATE DATABASE", syntax: "CREATE DATABASE mi_base;", description: "Genera una nueva base de datos." },
      { name: "CREATE USER", syntax: "CREATE USER david WITH PASSWORD '123456';", description: "Crea un usuario o rol con acceso a PostgreSQL." },
      { name: "GRANT", syntax: "GRANT ALL PRIVILEGES ON DATABASE mi_base TO david;", description: "Otorga permisos sobre una base de datos." },
      { name: "pg_dump", syntax: "pg_dump -U postgres mi_base > backup.sql", description: "Genera un backup de una base PostgreSQL." },
      { name: "pg_restore", syntax: "pg_restore -U postgres -d mi_base backup.dump", description: "Restaura una base desde un archivo de backup." },
      { name: "JSONB", syntax: "data JSONB", description: "Tipo de documento JSONB para almacenamiento flexible." },
    ],
    typescript: [
      { name: "Tipos primitivos", syntax: "string | number | boolean | null | undefined", description: "Los tipos básicos permiten describir valores, estados y flujo de datos con seguridad." },
      { name: "Interfaces", syntax: "interface User { id: number; name: string }", description: "Las interfaces modelan contratos de objeto y mejoran la claridad del dominio." },
      { name: "Narrowing", syntax: "if (typeof value === 'string') { ... }", description: "El narrowing reduce tipos en tiempo de compilación y evita errores de runtime." },
      { name: "Utility Types", syntax: "Partial<T> | Pick<T, K> | Omit<T, K>", description: "Los utility types transforman otros tipos sin duplicar definiciones." },
      { name: "Generics", syntax: "function identity<T>(value: T): T", description: "Los genéricos permiten reutilizar lógica para distintos tipos sin perder seguridad." },
      { name: "Strict mode", syntax: '"strict": true', description: "Activar strict mode ayuda a detectar null, any implícito y errores de tipos antes de desplegar." },
    ],
    nextjs: [
      { name: "App Router", syntax: "app/layout.tsx + app/page.tsx", description: "El App Router organiza rutas y layouts mediante el sistema de carpetas de Next.js." },
      { name: "Server Components", syntax: "export default async function Page()", description: "Los componentes del servidor renderizan contenido seguro y eficiente sin depender del cliente." },
      { name: "Client Components", syntax: "'use client'", description: "Cuando necesitas estado o eventos del navegador, se marca el componente como cliente." },
      { name: "Metadata", syntax: "export const metadata = { title: 'Dashboard' }", description: "Los metadatos entregan títulos, descripciones y SEO ligero a cada página." },
      { name: "Route Handlers", syntax: "app/api/hello/route.ts", description: "Los route handlers crean endpoints REST y lógica backend dentro del mismo proyecto." },
      { name: "Rendering", syntax: "SSR / SSG / CSR", description: "Next.js combina renderizado del servidor, estático y cliente según el caso de uso de la app." },
    ],
  };

  const officialCommands = (commandTemplates[normalizedModule] || commandTemplates.ssh).filter((cmd) => {
    const haystack = `${cmd.name} ${cmd.description} ${cmd.syntax}`.toLowerCase();
    return haystack.includes(normalizedModule) || normalized.includes(cmd.name.toLowerCase().split(" ")[0]) || normalized.includes(cmd.description.toLowerCase().split(" ")[0]);
  });

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

  if (searchQuery) {
    webResults = await searchWebForCommand(moduleParam, searchQuery, apiKey || undefined);
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
