import { NextRequest, NextResponse } from "next/server";
import { getUserAiConfigs } from "@/lib/db";
import { getSession } from "@/lib/auth";

interface PracticeContext {
  type: "challenge" | "course";
  module: "ssh" | "docker" | "postgres" | "typescript";
  level?: string;
  title?: string;
}

const normalizeText = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const isPracticeContext = (value: unknown): value is PracticeContext =>
  typeof value === "object" && value !== null &&
  "type" in value && (value.type === "challenge" || value.type === "course") &&
  "module" in value &&
  (value.module === "ssh" || value.module === "docker" || value.module === "postgres" || value.module === "typescript");

const isDirectPracticeSolutionRequest = (message: string) => {
  const normalized = normalizeText(message);
  const requestsCompletion = /\b(dame|dime|proporciona|escribe|genera|resolv\w*|solucion\w*|completa|haz|contesta|give me|provide|write|generate|solve|complete|answer)\b/.test(normalized);
  const asksForAnswer = /\b(respuesta|solucion|codigo|comando|consulta|query|script|reto|desafio|ejercicio|answer|solution|code|command|challenge|exercise)\b/.test(normalized);
  return requestsCompletion && asksForAnswer;
};

const practiceHints: Record<PracticeContext["module"], string> = {
  ssh: "Pista: separa usuario, host y método de autenticación; verifica cada parte antes de ejecutar un comando.",
  docker: "Pista: distingue imagen, contenedor y configuración; comprueba el estado antes de añadir más opciones.",
  postgres: "Pista: identifica tabla, columnas y condición; prueba primero la lectura antes de modificar datos.",
  typescript: "Pista: define las entradas y salidas, y piensa qué tipo y qué casos límite debe cubrir la solución.",
};

export async function POST(req: NextRequest) {
  try {
    const { messages, moduleContext, providerOverride, practiceContext: contextValue } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Mensajes requeridos" },
        { status: 400 }
      );
    }

    const lastUserMessage = [...messages]
      .reverse()
      .find((message) => message?.role === "user" && typeof message.content === "string");

    const practiceContext = isPracticeContext(contextValue) ? contextValue : null;
    if (practiceContext && lastUserMessage && isDirectPracticeSolutionRequest(lastUserMessage.content)) {
      return NextResponse.json({
        reply: `Puedo orientarte con ${practiceContext.title ? `“${practiceContext.title.slice(0, 120)}”` : "esta práctica"}, pero no resolverla por ti. ${practiceHints[practiceContext.module]} Cuéntame qué has intentado y te doy la siguiente pista.`,
        provider: "practice-tutor",
        needsKey: false,
      });
    }

    // 1. Obtener la sesión del usuario para consultar su configuración en BD
    const session = await getSession();
    let provider = providerOverride || "gemini";
    let apiKey = "";
    let baseUrl = "http://localhost:11434";

    if (session?.userId) {
      try {
        const configs = await getUserAiConfigs(session.userId);
        const selectedConfig = configs.find((c) => c.is_active) || configs[0];

        if (selectedConfig) {
          provider = selectedConfig.provider || "gemini";
          apiKey = selectedConfig.api_key || "";
          baseUrl = selectedConfig.base_url || "";
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
    const systemPrompt = `Eres DevPracticeBot, asistente experto en SSH, Docker, PostgreSQL, TypeScript y Next.js.
- Sé preciso, conciso y técnico.
- Usa markdown para código.
- Responde en español.
- Si no sabes, admítelo.
  ${practiceContext ? `MODO TUTOR DE ${practiceContext.type === "challenge" ? "RETO" : "CURSO"}: Estás ayudando con ${practiceContext.module}${practiceContext.level ? `, nivel ${practiceContext.level}` : ""}${practiceContext.title ? `, actividad ${practiceContext.title}` : ""}. Da pistas graduales, explica conceptos y haz preguntas que guíen el razonamiento. No entregues la respuesta final, una solución completa, ni código/SQL/comandos listos para pegar. Si el usuario pide que completes la actividad, recházalo brevemente y ofrece una pista conceptual. Para dudas generales del tema, sí puedes explicar el concepto sin resolver la actividad concreta.` : ""}
${moduleContext ? `Contexto: ${moduleContext}.` : ""}`;

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

    const selectedModel = "gemini-3.5-flash-lite";
    const contents = messages.slice(-5).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const controller = new AbortController();
    const abortOnClientCancel = () => controller.abort();
    if (req.signal.aborted) {
      controller.abort();
    } else {
      req.signal.addEventListener("abort", abortOnClientCancel, { once: true });
    }
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let res: Response;
    try {
      res = await fetch(geminiUrl, {
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
    } finally {
      clearTimeout(timeoutId);
      req.signal.removeEventListener("abort", abortOnClientCancel);
    }

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`Error respuesta Gemini API (${selectedModel}):`, res.status, errBody);

      if (res.status === 400 || res.status === 403) {
        return NextResponse.json({
          reply: "La clave de Gemini API configurada no es válida o no tiene permisos. Por favor revísala en [Mi Cuenta](/account).",
          needsKey: true,
          provider: "gemini",
        });
      }

      return NextResponse.json({
        error: res.status === 429 || res.status === 503
          ? "Gemini está temporalmente saturado. La solicitud se reintentará automáticamente; inténtalo de nuevo en unos segundos si continúa."
          : `Gemini no pudo procesar la solicitud (HTTP ${res.status}).`,
        provider: "gemini",
        model: selectedModel,
        retryable: res.status === 429 || res.status === 503,
      }, { status: res.status === 429 || res.status === 503 ? 503 : 502 });
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
  } catch (error: unknown) {
    console.error("Error en endpoint /api/chat:", error);
    if (error instanceof Error && error.name === "AbortError") {
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
    lastMsg.includes("typescript") || lastMsg.includes("tipo") || lastMsg.includes("interface") || lastMsg.includes("generic") ? "typescript" : "general"
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
  } else {
    reply = `### DevPracticeBot (Motor In-Process Activo - Sin Servidor)

¡Hola! Estoy listo para ayudarte con **SSH**, **Docker**, **PostgreSQL** y **TypeScript**. 

Como nuestro motor local in-process está activo, puedes hacer cualquier consulta técnica de forma instantánea sin necesidad de iniciar ningún servidor externo (como Ollama) ni configurar claves. ¿Sobre qué tema te gustaría consultar?`;
  }

  return reply;
}
