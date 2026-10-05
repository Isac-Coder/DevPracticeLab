"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Trash2,
  Minimize2,
  Maximize2,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Pencil,
  Square,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useChallengeMode } from "@/lib/ChallengeModeContext";
import { usePlatformMode } from "@/lib/PlatformModeContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// Define the interface for AI configurations
interface AiConfig {
  model: string;
  isActive: boolean;
  // Assuming other properties might exist but are not directly used or known
}

const QUICK_PROMPTS = [
  { label: "🐳 Docker Compose", text: "¿Cómo crear un archivo docker-compose.yml para una base de datos PostgreSQL y Node.js?" },
  { label: "🛡️ Claves SSH", text: "¿Cómo generar una clave SSH segura con Ed25519 y subirla al servidor?" },
  { label: "🏷️ TypeScript Generics", text: "¿Cómo funcionan los genéricos en TypeScript con un ejemplo práctico?" },
  { label: "⚡ Next.js Server Components", text: "¿Cuál es la diferencia entre Server Components y Client Components en Next.js?" },
  { label: "📊 PostgreSQL JSONB", text: "¿Cómo indexar y consultar una columna JSONB en PostgreSQL?" },
];

// Function to generate a unique ID
const generateUniqueId = () => {
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const createWelcomeMessage = (): Message => ({
  id: "welcome",
  role: "assistant",
  content: "¡Hola! 👋 Soy tu asistente técnico de **DevPracticeLab**. ¿Tienes alguna duda sobre **SSH**, **Docker**, **PostgreSQL**, **TypeScript** o **Next.js**?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
});

const isMessageHistory = (value: unknown): value is Message[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(
    (message) =>
      typeof message === "object" &&
      message !== null &&
      "id" in message &&
      typeof message.id === "string" &&
      "role" in message &&
      (message.role === "user" || message.role === "assistant") &&
      "content" in message &&
      typeof message.content === "string" &&
      "timestamp" in message &&
      typeof message.timestamp === "string",
  );

export default function AiChatbot() {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { challengeActive, practiceContext } = useChallengeMode();
  const { isEnglish } = usePlatformMode();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadedChatStorageKey, setLoadedChatStorageKey] = useState<string | null>(null);

  const userEmail = user?.email;
  const chatStorageKey = userEmail ? `devpracticelab_chat_${userEmail}` : "devpracticelab_chat_guest";

  const [messages, setMessages] = useState<Message[]>(() => [createWelcomeMessage()]);

  useEffect(() => {
    if (authLoading) return;

    try {
      const saved = userEmail ? localStorage.getItem(chatStorageKey) : null;
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (isMessageHistory(parsed)) {
          setMessages(parsed);
        } else {
          setMessages([createWelcomeMessage()]);
        }
      } else {
        setMessages([createWelcomeMessage()]);
      }
    } catch (e) {
      console.error("Failed to load messages from localStorage:", e);
      setMessages([createWelcomeMessage()]);
    }
    setLoadedChatStorageKey(userEmail ? chatStorageKey : null);
  }, [authLoading, chatStorageKey, userEmail]);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [currentModelName, setCurrentModelName] = useState<string>("gemini-3.5-flash-lite");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestControllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => requestControllerRef.current?.abort(), []);

  useEffect(() => {
    if (authLoading || !userEmail || loadedChatStorageKey !== chatStorageKey) return;

    try {
      localStorage.setItem(chatStorageKey, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to save messages to localStorage:", e);
    }
  }, [authLoading, messages, chatStorageKey, loadedChatStorageKey, userEmail]);

  useEffect(() => {
    const fetchActiveProvider = async () => {
      try {
        const res = await fetch("/api/ai-keys");
        if (res.ok) {
          const data = await res.json();
          if (data.configs) {
            const activeConf = data.configs.find((c: AiConfig) => c.isActive) || data.configs[0];
            if (activeConf?.model) {
              setCurrentModelName(activeConf.model);
            }
          }
        }
      } catch {
        // no-op
      }
    };

    if (isOpen) {
      fetchActiveProvider();
      const interval = setInterval(fetchActiveProvider, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const ENGLISH_QUICK_PROMPTS = [
    { label: "📖 Present Perfect vs Simple Past", text: "¿Cuál es la diferencia entre el Present Perfect y el Simple Past en Top Notch 2?" },
    { label: "💬 Tag Questions", text: "¿Cómo se forman y cuándo se usan las Tag Questions en Top Notch 3?" },
    { label: "🗣️ Modal Verbs", text: "¿Cómo usar modals for speculation (must, might, could) en Summit 1?" },
    { label: "✍️ Passive Voice", text: "¿Cómo convertir una oración activa a pasiva en inglés formal?" },
  ];

  const activeQuickPrompts = isEnglish ? ENGLISH_QUICK_PROMPTS : QUICK_PROMPTS;
  const activePracticeContext = pathname.startsWith("/courses") && practiceContext?.type === "course"
    ? practiceContext
    : pathname.startsWith("/challenges") && challengeActive && practiceContext?.type === "challenge"
    ? practiceContext
    : null;

  const moduleNames: Record<string, string> = {
    ssh: "SSH",
    docker: "Docker",
    postgres: "PostgreSQL",
    typescript: "TypeScript",
  };

  // Determinar módulo actual a partir del pathname
  const currentModule = (() => {
    if (activePracticeContext) {
      return `${moduleNames[activePracticeContext.module] ?? activePracticeContext.module}${activePracticeContext.level ? ` · ${activePracticeContext.level}` : ""}`;
    }
    if (pathname.includes("/ssh")) return "SSH";
    if (pathname.includes("/docker")) return "Docker";
    if (pathname.includes("/postgres")) return "PostgreSQL";
    if (pathname.includes("/typescript")) return "TypeScript";
    if (pathname.includes("/challenges")) return "Retos técnicos";
    if (pathname.includes("/docs")) return "Documentación";
    return undefined;
  })();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const waitForRetry = (duration: number, signal: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException("Solicitud cancelada", "AbortError"));
        return;
      }

      const timeout = window.setTimeout(() => {
        signal.removeEventListener("abort", abortWait);
        resolve();
      }, duration);
      const abortWait = () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Solicitud cancelada", "AbortError"));
      };

      signal.addEventListener("abort", abortWait, { once: true });
    });

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  if (!user) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || loading) return;

    const userMessage: Message = {
      id: generateUniqueId(),
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);
    const controller = new AbortController();
    requestControllerRef.current = controller;

    try {
      let attempts = 0;
      let res;
      let success = false;

      while (attempts < 3 && !success) {
        attempts++;
        try {
          res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
              messages: newMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              moduleContext: currentModule,
                practiceContext: activePracticeContext,
            }),
          });

          if (res.ok) {
            success = true;
          } else {
            // If it's a 429 or 503, we definitely want to retry. 
            // For other errors, we might still retry in case of transient network issues.
            if (res.status !== 400 && res.status !== 401 && res.status !== 403) {
              console.warn(`Chat API attempt ${attempts} failed with status ${res.status}. Retrying...`);
              if (attempts < 3) await waitForRetry(1000 * attempts, controller.signal);
            } else {
              break; // Stop retrying on client errors
            }
          }
        } catch (fetchErr) {
          if (controller.signal.aborted) throw fetchErr;
          console.error(`Chat API attempt ${attempts} network error:`, fetchErr);
          if (attempts < 3) await waitForRetry(1000 * attempts, controller.signal);
        }
      }

      if (!res || !res.ok) {
        let errorMessage = res ? `El servidor respondió con ${res.status}.` : "No se pudo conectar con Gemini después de varios intentos.";
        if (res) {
          const errorData = await res.json().catch(() => ({}));
          if (typeof errorData.error === "string") errorMessage = errorData.error;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.model) {
        setCurrentModelName(data.model);
      }

      const botMessage: Message = {
        id: generateUniqueId(),
        role: "assistant",
        content: data.reply || "No pude procesar la consulta en este momento.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      if (!controller.signal.aborted) {
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            role: "assistant",
            content: `⚠️ ${error instanceof Error ? error.message : "Hubo un error de conexión al consultar a Gemini."}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } finally {
      if (requestControllerRef.current === controller) {
        requestControllerRef.current = null;
        setLoading(false);
      }
    }
  };

  const cancelRequest = () => requestControllerRef.current?.abort();

  const reuseMessageForEditing = (content: string) => {
    setInputMessage(content);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const clearChat = () => {
    setMessages([{
      ...createWelcomeMessage(),
      content: "Chat reiniciado. ¿En qué te puedo ayudar hoy?",
    }]);
  };

  // Renderizador simple de Markdown (bloques de código, negritas y enlaces)
  const renderFormattedMessage = (content: string, msgId: string) => {
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Texto previo al bloque de código
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      // Bloque de código
      parts.push({
        type: "code",
        lang: match[1] || "text",
        code: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return (
      <div className="space-y-2 text-xs leading-relaxed">
        {parts.map((part, index) => {
          if (part.type === "code") {
            const blockId = `${msgId}-code-${index}`;
            return (
              <div
                key={index}
                className="my-2 overflow-hidden rounded-xl border border-white/10 bg-[#070d14] font-mono text-[11px]"
              >
                <div className="flex items-center justify-between border-b border-white/8 bg-white/2 px-3 py-1.5 text-[10px] text-zinc-400">
                  <span className="uppercase tracking-wider font-semibold text-emerald-400/90">{part.lang}</span>
                  <button
                    onClick={() => copyCode(part.code || "", blockId)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition cursor-pointer"
                  >
                    {copiedId === blockId ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 text-zinc-200 overflow-x-auto whitespace-pre leading-normal">
                  <code>{part.code}</code>
                </pre>
              </div>
            );
          }

          // Formateo de texto en línea (negritas, enlaces y código en línea)
          const lines = part.content?.split("\n") || [];
          return (
            <div key={index} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                if (!line.trim()) return <div key={lIdx} className="h-1" />;

                // Renderizar viñetas
                const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
                const cleanLine = isBullet ? line.trim().substring(2) : line;

                // Reemplazos de inline markdown
                const formattedLine = cleanLine
                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-emerald-300 font-mono text-[10px]">$1</code>')
                  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-400 underline hover:text-emerald-300" target="_blank" rel="noopener noreferrer">$1</a>');

                return (
                  <div key={lIdx} className={isBullet ? "flex items-start gap-1.5 pl-2" : ""}>
                    {isBullet && <span className="text-emerald-400 select-none">•</span>}
                    <span
                      dangerouslySetInnerHTML={{ __html: formattedLine }}
                      className="wrap-break-word"
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`fixed bottom-5 right-5 flex flex-col items-end ${challengeActive ? "z-70" : "z-50"}`}>
      {/* Ventana del Chatbot */}
      {isOpen && (
        <div
          className={`mb-3 w-[94vw] max-w-120 rounded-3xl border transition-all duration-200 flex flex-col overflow-hidden ${
            isEnglish
              ? "border-sky-400/30 bg-[#07152b]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(56,189,248,0.15)]"
              : "border-white/15 bg-[#091017]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.12)]"
          } ${isMinimized ? "h-14" : "h-160 max-h-[88vh]"}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/3 px-4 py-3 select-none">
            <div className="flex items-center gap-2.5">
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-xl border ${
                  isEnglish
                    ? "border-sky-400/40 bg-sky-500/20 text-sky-300"
                    : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isEnglish ? "bg-sky-400" : "bg-emerald-400"
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isEnglish ? "bg-sky-400" : "bg-emerald-400"
                    }`}
                  ></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">
                    {isEnglish ? "TopNotch AI Tutor" : "DevPracticeBot"}
                  </h3>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.2 text-[9px] font-semibold transition cursor-pointer flex items-center gap-1 text-amber-300">
                    Gemini
                    <span className="text-[8px] opacity-70">✨</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  {currentModule && (
                    <span>
                      Contexto: <strong className="text-zinc-200">{currentModule}</strong>
                    </span>
                  )}
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span className="font-mono text-[9px] text-zinc-400 truncate max-w-32">
                      Gemini: {currentModelName}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  onClick={clearChat}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition"
                  title="Limpiar conversación"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition"
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white transition"
                title="Cerrar chat"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Body del Chat (cuando no está minimizado) */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((msg) => {
                  const isUser = msg.role === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!isUser && (
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border mt-0.5 ${
                            isEnglish
                              ? "border-sky-400/40 bg-sky-500/20 text-sky-300"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          }`}
                        >
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 ${
                          isUser
                            ? isEnglish
                              ? "border border-sky-400/40 bg-sky-500/20 text-white shadow-sm"
                              : "border border-emerald-500/30 bg-emerald-500/15 text-white shadow-sm"
                            : "border border-white/10 bg-white/4 text-zinc-200"
                        }`}
                      >
                        {isUser ? (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          renderFormattedMessage(msg.content, msg.id)
                        )}
                        <div className="mt-1.5 flex items-center justify-between gap-3">
                          <span className="text-[9px] text-zinc-500">{msg.timestamp}</span>
                          {isUser && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleSendMessage(msg.content)}
                                disabled={loading}
                                aria-label="Repetir esta petición"
                                title="Repetir petición"
                                className="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                              >
                                <RotateCcw className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => reuseMessageForEditing(msg.content)}
                                disabled={loading}
                                aria-label="Editar esta petición como nueva"
                                title="Editar y reutilizar"
                                className="rounded-md p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {isUser && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 mt-0.5">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs pl-8">
                    <div className="flex gap-1">
                      <span
                        className={`h-1.5 w-1.5 rounded-full animate-bounce ${
                          isEnglish ? "bg-sky-400" : "bg-emerald-400"
                        }`}
                      ></span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${
                          isEnglish ? "bg-sky-400" : "bg-emerald-400"
                        }`}
                      ></span>
                      <span
                        className={`h-1.5 w-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${
                          isEnglish ? "bg-sky-400" : "bg-emerald-400"
                        }`}
                      ></span>
                    </div>
                    <span className="text-[11px]">Consultando a Gemini...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sugerencias Rápidas */}
              {messages.length <= 2 && (
                <div className="px-3 pb-2 border-t border-white/5 pt-2">
                  <p className="text-[10px] text-zinc-500 mb-1.5 px-1 font-medium">Preguntas frecuentes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeQuickPrompts.slice(0, 3).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt.text)}
                        className={`rounded-full border px-2.5 py-1 text-[10px] transition cursor-pointer ${
                          isEnglish
                            ? "border-sky-400/30 bg-sky-950/40 text-sky-200 hover:border-sky-400 hover:bg-sky-500/20 hover:text-white"
                            : "border-white/10 bg-white/3 text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-200"
                        }`}
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Footer */}
              <div className="border-t border-white/10 bg-white/2 p-3">
                <div className="relative flex items-center">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      isEnglish
                        ? "Haz una pregunta sobre gramática o conversación en inglés..."
                        : `Pregúntale al bot sobre ${currentModule || "programación"}...`
                    }
                    className={`w-full resize-none rounded-2xl border bg-black/40 py-2.5 pl-3.5 pr-11 text-xs text-white placeholder-zinc-500 focus:outline-none max-h-24 ${
                      isEnglish
                        ? "border-sky-400/30 focus:border-sky-400/70 focus:ring-1 focus:ring-sky-400/30"
                        : "border-white/10 focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-500/20"
                    }`}
                  />
                  {loading ? (
                    <button
                      type="button"
                      onClick={cancelRequest}
                      className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-400 cursor-pointer shadow-md"
                      title="Cancelar solicitud"
                      aria-label="Cancelar solicitud"
                    >
                      <Square className="h-3 w-3 fill-current" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim()}
                      className={`absolute right-2 flex h-7 w-7 items-center justify-center rounded-xl transition disabled:opacity-40 cursor-pointer shadow-md ${
                        isEnglish
                          ? "bg-sky-400 text-zinc-950 hover:bg-sky-300 disabled:hover:bg-sky-400"
                          : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:hover:bg-emerald-500"
                      }`}
                      title="Enviar mensaje"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-zinc-500">
                  <span>Enter para enviar</span>
                  <Link
                    href="/account"
                    className={`hover:underline ${
                      isEnglish ? "text-sky-400/80 hover:text-sky-300" : "text-emerald-400/80 hover:text-emerald-300"
                    }`}
                  >
                    Configurar API Key
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Botón flotante para abrir el Chatbot */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className={`group relative flex cursor-pointer items-center gap-2.5 rounded-full p-3 font-semibold text-zinc-950 transition-all hover:scale-105 sm:px-4 sm:py-3 ${
            isEnglish
              ? "border border-sky-400/40 bg-linear-to-r from-sky-400 via-cyan-300 to-sky-400 shadow-[0_10px_30px_rgba(56,189,248,0.35)] hover:shadow-[0_15px_40px_rgba(56,189,248,0.5)]"
              : "border border-emerald-400/40 bg-linear-to-r from-emerald-500 to-teal-500 shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)]"
          }`}
          title={isEnglish ? "Tutor de Inglés Gemini" : activePracticeContext ? "Pedir una pista al tutor" : "Asistente de IA Gemini"}
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <Sparkles className="h-5 w-5 animate-pulse text-zinc-950" />
          </span>
          <span className="hidden sm:inline-block text-xs font-bold tracking-tight">
            {isEnglish ? "TopNotch IA" : activePracticeContext ? "Tutor IA" : "Asistente IA"}
          </span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isEnglish ? "bg-sky-300" : "bg-emerald-300"
              }`}
            ></span>
            <span
              className={`relative inline-flex rounded-full h-3 w-3 ${
                isEnglish ? "bg-sky-200" : "bg-emerald-200"
              }`}
            ></span>
          </span>
        </button>
      )}
    </div>
  );
}
