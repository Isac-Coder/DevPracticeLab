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
        const selectedConfig = providerOverride
          ? configs.find((c) => c.provider === providerOverride)
          : (configs.find((c) => c.is_active) || configs[0]);

        if (selectedConfig) {
          provider = selectedConfig.provider || "gemini";
          apiKey = selectedConfig.api_key || "";
          baseUrl = selectedConfig.base_url || (selectedConfig.provider === "ollama" ? "http://localhost:11434" : "");
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

Reglas para tus respuestas:
1. Sé conciso, claro y directo al grano.
2. Si incluyes código o comandos, usa bloques markdown con sintaxis resaltada (\`\`\`bash, \`\`\`typescript, \`\`\`sql, etc.).
3. Explica qué hace el código y por qué es una buena práctica.
4. Responde siempre en español.`;

    // ==========================================
    // EJECUCIÓN CON OLLAMA
    // ==========================================
    if (provider === "ollama") {
      const ollamaUrl = (baseUrl || "http://localhost:11434").replace(/\/+$/, "");
      const selectedModel = model || "llama3";

      const ollamaMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content,
        })),
      ];

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (apiKey) {
          headers["Authorization"] = `Bearer ${apiKey}`;
        }

        const res = await fetch(`${ollamaUrl}/api/chat`, {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            model: selectedModel,
            messages: ollamaMessages,
            stream: false,
          }),
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errText = await res.text();
          console.error("Error respuesta Ollama:", res.status, errText);
          return NextResponse.json({
            reply: `⚠️ Error de Ollama (${res.status}): Asegúrate de que el modelo \`${selectedModel}\` esté disponible en tu Ollama local ejecutando: \`ollama run ${selectedModel}\`.`,
            provider: "ollama",
            model: selectedModel,
          });
        }

        const data = await res.json();
        const replyText = data?.message?.content || "No se recibió respuesta de Ollama.";

        return NextResponse.json({
          reply: replyText,
          provider: "ollama",
          model: selectedModel,
          needsKey: false,
        });
      } catch (ollamaErr: any) {
        clearTimeout(timeoutId);
        console.error("Error al conectar con Ollama:", ollamaErr);
        if (ollamaErr.name === "AbortError") {
          return NextResponse.json({
            reply: `⏱️ La consulta a Ollama (${selectedModel}) tardó demasiado. Prueba con un modelo más ligero como \`llama3.2\` o haz una pregunta más corta.`,
            provider: "ollama",
          });
        }
        return NextResponse.json({
          reply: `⚠️ No se pudo conectar al servidor de Ollama en \`${ollamaUrl}\`.\n\n**Para solucionarlo:**\n1. Inicia Ollama en tu computadora (\`ollama serve\` o abre la app de Ollama).\n2. Descarga el modelo deseado (ej: \`ollama run ${selectedModel}\`).\n3. O configura otra URL en [Mi Cuenta](/account).`,
          provider: "ollama",
          needsKey: false,
        });
      }
    }

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
    const timeoutId = setTimeout(() => controller.abort(), 18000);

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

      return NextResponse.json({
        reply: "Ocurrió un error al consultar con Gemini API. Por favor intenta de nuevo en unos momentos.",
        provider: "gemini",
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
