import { NextRequest, NextResponse } from "next/server";
import { getUserAiConfigs } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { messages, moduleContext, providerOverride } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Mensajes requeridos" },
        { status: 400 }
      );
    }

    // 1. Obtener la sesión del usuario para consultar su configuración en BD
    const session = await getSession();
    let provider = providerOverride || "gemini";
    let apiKey = "";
    let baseUrl = "http://localhost:11434";
    let model = "";

    if (session?.userId) {
      try {
        const configs = await getUserAiConfigs(session.userId);
        const selectedConfig = configs.find((c) => c.is_active) || configs[0];

        if (selectedConfig) {
          provider = selectedConfig.provider || "gemini";
          apiKey = selectedConfig.api_key || "";
          baseUrl = selectedConfig.base_url || "";
          model = selectedConfig.model || "";
        }
      } catch (dbErr) {
        console.error("Error al consultar configuración de IA en BD:", dbErr);
      }
    }

    // Si es Gemini y no hay apiKey en BD, verificar variable de entorno
    if (provider === "gemini" && !apiKey) {
      apiKey = process.env.GEMINI_API_KEY?.trim() || "";
    }

    // 2. Preparar el prompt del sistema
    const systemPrompt = `Eres DevPracticeBot, un asistente de programación y DevOps experto, conciso y amigable en la plataforma DevPracticeLab.
Tus áreas de especialidad son:
- SSH (claves criptográficas Ed25519, túneles -L/-R/-D, ssh_config, ProxyJump, hardening).
- Docker (CLI, Dockerfile multi-stage, Docker Compose, volúmenes, redes, optimización).
- PostgreSQL (SQL moderno, índices B-Tree y GIN para JSONB, transacciones ACID, CTEs, window functions).
- TypeScript (tipos estrictos, generics, utility types, narrowing, satisfies, tsconfig).
- Next.js (App Router, Server Components, Server Actions, Route Handlers, layouts, optimizaciones).

${moduleContext ? `El usuario se encuentra actualmente explorando el módulo de: ${moduleContext}.` : ""}

Reglas estrictas para tus respuestas:
1. Sé extremadamente preciso y basate estrictamente en la documentación oficial y mejores prácticas actuales.
2. Sé conciso, claro y directo al grano.
3. Si incluyes código o comandos, usa bloques markdown con sintaxis resaltada (\`\`\`bash, \`\`\`typescript, \`\`\`sql, etc.).
4. Explica qué hace el código y por qué es una buena práctica.
5. Responde siempre en español.
6. Si no estás seguro de la respuesta o no tienes información suficiente, admite que no lo sabes en lugar de inventar información.`;

    // ==========================================
    // EJECUCIÓN CON GEMINI
    // ==========================================
    if (!apiKey) {
      return NextResponse.json({
        reply: "Para habilitar el asistente con Google Gemini, por favor ingresa tu **Gemini API Key** en la sección [Mi Cuenta](/account) o selecciona **Ollama** si prefieres un modelo local sin clave.\n\nPuedes obtener una clave gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey).",
        needsKey: true,
        provider: "gemini",
      });
    }

    const selectedModel = model || "gemini-3.7-flash";
    const contents = messages.slice(-10).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Error respuesta Gemini API:", res.status, errBody);

      if (res.status === 400 || res.status === 403) {
        return NextResponse.json({
          reply: "La clave de Gemini API configurada no es válida o no tiene permisos. Por favor revísala en [Mi Cuenta](/account).",
          needsKey: true,
          provider: "gemini",
        });
      }

      // Fallback automático a motor experto in-process si Gemini experimenta alta demanda (503/429) o errores
      const localReply = generateLocalExpertResponse(messages, moduleContext);
      return NextResponse.json({
        reply: localReply,
        provider: "gemini-local",
        model: selectedModel,
        needsKey: false,
      });
    }

    const data = await res.json();
    const replyText =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text || "").join("") ||
      "No pude generar una respuesta en este momento.";

    return NextResponse.json({
      reply: replyText,
      provider: "gemini",
      model: selectedModel,
      needsKey: false,
    });
  } catch (error: any) {
    console.error("Error en endpoint /api/chat:", error);
    if (error.name === "AbortError") {
      return NextResponse.json({
        reply: "La solicitud tardó demasiado tiempo en responder. Por favor intenta de nuevo con una consulta más corta.",
      });
    }
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la consulta." },
      { status: 500 }
    );
  }
}

function generateLocalExpertResponse(messages: Array<{ role: string; content: string }>, moduleContext?: string) {
  const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
  
  const topic = moduleContext?.toLowerCase() || (
    lastMsg.includes("ssh") || lastMsg.includes("túnel") || lastMsg.includes("llave") || lastMsg.includes("puerto") ? "ssh" :
    lastMsg.includes("docker") || lastMsg.includes("container") || lastMsg.includes("imagen") || lastMsg.includes("compose") ? "docker" :
    lastMsg.includes("postgres") || lastMsg.includes("sql") || lastMsg.includes("tabla") || lastMsg.includes("base de datos") || lastMsg.includes("query") ? "postgres" :
    lastMsg.includes("typescript") || lastMsg.includes("tipo") || lastMsg.includes("interface") || lastMsg.includes("generic") ? "typescript" :
    lastMsg.includes("next") || lastMsg.includes("app router") || lastMsg.includes("server component") || lastMsg.includes("route handler") ? "nextjs" : "general"
  );

  let reply = "";

  if (topic === "ssh" || lastMsg.includes("ssh")) {
    reply = `### Guía Rápida de SSH (Motor Local Sin Servidor)

Para gestionar conexiones seguras y túneles en SSH, aquí tienes los comandos y prácticas esenciales:

1. **Generar clave Ed25519 (recomendada por seguridad):**
\`\`\`bash
ssh-keygen -t ed25519 -C "tu_correo@ejemplo.com" -f ~/.ssh/id_ed25519
\`\`\`

2. **Establecer un túnel SSH local (Port Forwarding):**
\`\`\`bash
ssh -L 5432:localhost:5432 usuario@servidor-remoto
\`\`\`
Esto redirige el puerto local \`5432\` al puerto \`5432\` del servidor remoto a través del túnel seguro SSH.

3. **Configuración en \`~/.ssh/config\` para accesos rápidos:**
\`\`\`ssh
Host mibestservidor
    HostName 192.168.1.50
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_ed25519
\`\`\``;
  } else if (topic === "docker" || lastMsg.includes("docker")) {
    reply = `### Guía Rápida de Docker (Motor Local Sin Servidor)

Docker permite empaquetar aplicaciones y sus dependencias en contenedores aislados:

1. **Construir una imagen desde un Dockerfile:**
\`\`\`bash
docker build -t mi-app:latest .
\`\`\`

2. **Ejecutar un contenedor con puertos mapeados y volumen:**
\`\`\`bash
docker run -d --name mi-contenedor -p 3000:3000 -v $(pwd):/app mi-app:latest
\`\`\`

3. **Docker Compose básico (\`docker-compose.yml\`):**
\`\`\`yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
\`\`\``;
  } else if (topic === "postgres" || lastMsg.includes("postgres") || lastMsg.includes("sql")) {
    reply = `### Guía Rápida de PostgreSQL (Motor Local Sin Servidor)

PostgreSQL es un sistema de bases de datos relacional robusto y avanzado:

1. **Creación de tabla con restricciones e índices:**
\`\`\`sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
\`\`\`

2. **Consulta avanzada con CTE (Common Table Expression):**
\`\`\`sql
WITH estadisticas AS (
    SELECT status, COUNT(*) as total
    FROM retos
    GROUP BY status
)
SELECT * FROM estadisticas WHERE total > 5;
\`\`\``;
  } else if (topic === "typescript" || lastMsg.includes("typescript") || lastMsg.includes("tipo")) {
    reply = `### Guía Rápida de TypeScript (Motor Local Sin Servidor)

TypeScript añade tipado estático robusto sobre JavaScript:

1. **Interfaces y Genéricos:**
\`\`\`typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

function processResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || "Error desconocido");
  }
  return response.data;
}
\`\`\`

2. **Utility Types útiles:**
- \`Partial<T>\`: Vuelve todas las propiedades opcionales.
- \`Pick<T, K>\`: Selecciona un subconjunto de propiedades.
- \`Omit<T, K>\`: Excluye propiedades específicas.`;
  } else if (topic === "nextjs" || lastMsg.includes("next")) {
    reply = `### Guía Rápida de Next.js App Router (Motor Local Sin Servidor)

Next.js con App Router ofrece renderizado híbrido y alto rendimiento:

1. **Server Component vs Client Component:**
Por defecto, los componentes en \`app/\` son Server Components. Añade \`"use client"\` al inicio del archivo sólo cuando necesites interactividad (\`useState\`, \`useEffect\`).

2. **Route Handler (\`app/api/ejemplo/route.ts\`):**
\`\`\`typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: "Hola desde API Route de Next.js" });
}
\`\`\``;
  } else {
    reply = `### DevPracticeBot (Motor In-Process Activo - Sin Servidor)

¡Hola! Estoy listo para ayudarte con **SSH**, **Docker**, **PostgreSQL**, **TypeScript** y **Next.js**. 

Como nuestro motor local in-process está activo, puedes hacer cualquier consulta técnica de forma instantánea sin necesidad de iniciar ningún servidor externo (como Ollama) ni configurar claves. ¿Sobre qué tema te gustaría consultar?`;
  }

  return reply;
}
