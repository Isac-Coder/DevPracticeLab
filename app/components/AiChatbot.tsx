"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
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
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  { label: "🐳 Docker Compose", text: "¿Cómo crear un archivo docker-compose.yml para una base de datos PostgreSQL y Node.js?" },
  { label: "🛡️ Claves SSH", text: "¿Cómo generar una clave SSH segura con Ed25519 y subirla al servidor?" },
  { label: "🏷️ TypeScript Generics", text: "¿Cómo funcionan los genéricos en TypeScript con un ejemplo práctico?" },
  { label: "⚡ Next.js Server Components", text: "¿Cuál es la diferencia entre Server Components y Client Components en Next.js?" },
  { label: "📊 PostgreSQL JSONB", text: "¿Cómo indexar y consultar una columna JSONB en PostgreSQL?" },
];

export default function AiChatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "¡Hola! 👋 Soy tu asistente técnico de **DevPracticeLab**. ¿Tienes alguna duda sobre **SSH**, **Docker**, **PostgreSQL**, **TypeScript** o **Next.js**?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<"gemini" | "ollama">("gemini");
  const [currentModelName, setCurrentModelName] = useState<string>("gemini-3.7-flash");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Obtener proveedor activo de la base de datos al abrir
  useEffect(() => {
    const fetchActiveProvider = async () => {
      try {
        const res = await fetch("/api/ai-keys");
        if (res.ok) {
          const data = await res.json();
          if (data.activeProvider) {
            setSelectedProvider(data.activeProvider);
          }
          if (data.configs) {
            const activeConf = data.configs.find((c: any) => c.isActive) || data.configs[0];
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
    }
  }, [isOpen]);

  // Determinar módulo actual a partir del pathname
  const currentModule = (() => {
    if (pathname.includes("/ssh")) return "SSH";
    if (pathname.includes("/docker")) return "Docker";
    if (pathname.includes("/postgres")) return "PostgreSQL";
    if (pathname.includes("/typescript")) return "TypeScript";
    if (pathname.includes("/nextjs")) return "Next.js";
    if (pathname.includes("/challenges")) return "Retos técnicos";
    if (pathname.includes("/docs")) return "Documentación";
    return undefined;
  })();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || loading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          moduleContext: currentModule,
          providerOverride: selectedProvider,
        }),
      });

      if (!res.ok) {
        throw new Error("Error en la respuesta del servidor.");
      }

      const data = await res.json();
      if (data.provider) {
        setSelectedProvider(data.provider);
      }
      if (data.model) {
        setCurrentModelName(data.model);
      }

      const botMessage: Message = {
        id: `msg-bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || "No pude procesar la consulta en este momento.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: "assistant",
          content: "⚠️ Hubo un error de conexión al consultar el asistente. Intenta de nuevo.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
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
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat reiniciado. ¿En qué te puedo ayudar hoy?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
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
                <div className="flex items-center justify-between border-b border-white/8 bg-white/[0.02] px-3 py-1.5 text-[10px] text-zinc-400">
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
                      className="break-words"
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Ventana del Chatbot */}
      {isOpen && (
        <div
          className={`mb-3 w-[92vw] max-w-[420px] rounded-3xl border border-white/15 bg-[#091017]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.12)] transition-all duration-200 flex flex-col overflow-hidden ${
            isMinimized ? "h-14" : "h-[560px] max-h-[82vh]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-4 py-3 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-300">
                <Sparkles className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-wide">DevPracticeBot</h3>
                  <button
                    onClick={() => setSelectedProvider(selectedProvider === "gemini" ? "ollama" : "gemini")}
                    className={`rounded-full border px-2 py-0.2 text-[9px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                      selectedProvider === "gemini"
                        ? "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        : "border-sky-500/30 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20"
                    }`}
                    title="Clic para alternar entre Gemini y Ollama"
                  >
                    <span>{selectedProvider === "gemini" ? "Gemini" : "Ollama"}</span>
                    <span className="text-[8px] opacity-70">⇄</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  {currentModule && (
                    <span>
                      Contexto: <strong className="text-zinc-200">{currentModule}</strong>
                    </span>
                  )}
                  <span className="text-zinc-600">•</span>
                  <span className="font-mono text-[9px] text-zinc-400 truncate max-w-28">{currentModelName}</span>
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
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 mt-0.5">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 ${
                          isUser
                            ? "border border-emerald-500/30 bg-emerald-500/15 text-white shadow-sm"
                            : "border border-white/10 bg-white/[0.04] text-zinc-200"
                        }`}
                      >
                        {isUser ? (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          renderFormattedMessage(msg.content, msg.id)
                        )}
                        <span className="mt-1.5 block text-[9px] text-zinc-500 text-right">
                          {msg.timestamp}
                        </span>
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
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]"></span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                    <span className="text-[11px]">Consultando a {selectedProvider === "gemini" ? "Gemini" : "Ollama"}...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Sugerencias Rápidas */}
              {messages.length <= 2 && (
                <div className="px-3 pb-2 border-t border-white/5 pt-2">
                  <p className="text-[10px] text-zinc-500 mb-1.5 px-1 font-medium">Preguntas frecuentes:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.slice(0, 3).map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-200 transition cursor-pointer"
                      >
                        {prompt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Footer */}
              <div className="border-t border-white/10 bg-white/[0.02] p-3">
                <div className="relative flex items-center">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Pregúntale al bot sobre ${currentModule || "programación"}...`}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 py-2.5 pl-3.5 pr-11 text-xs text-white placeholder-zinc-500 focus:border-emerald-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 max-h-24"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || loading}
                    className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-500 cursor-pointer shadow-md"
                    title="Enviar mensaje"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-zinc-500">
                  <span>Enter para enviar</span>
                  <Link href="/account" className="text-emerald-400/80 hover:text-emerald-300 hover:underline">
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
          className="group relative flex items-center gap-2.5 rounded-full border border-emerald-400/40 bg-linear-to-r from-emerald-500 to-teal-500 p-3 sm:px-4 sm:py-3 font-semibold text-zinc-950 shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition-all hover:scale-105 hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] cursor-pointer"
          title="Asistente de IA Gemini"
        >
          <span className="relative flex h-5 w-5 items-center justify-center">
            <Sparkles className="h-5 w-5 text-zinc-950 animate-pulse" />
          </span>
          <span className="hidden sm:inline-block text-xs font-bold tracking-tight">
            Asistente IA
          </span>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-200"></span>
          </span>
        </button>
      )}
    </div>
  );
}
