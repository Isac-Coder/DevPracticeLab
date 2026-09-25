"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Server,
  Container,
  Database,
  Code2,
  Terminal,
  Layers,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Globe,
  ExternalLink,
  Workflow,
  Copy,
  Check,
  Search,
  Rocket,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import type { LiveDocResponse } from "@/app/api/docs/route";

type DocSection = "ssh" | "docker" | "postgres" | "typescript" | "nextjs";

const MODULE_TABS = [
  { id: "ssh" as DocSection, title: "SSH", icon: Server, color: "text-green-400", border: "border-green-500/30" },
  { id: "docker" as DocSection, title: "Docker", icon: Container, color: "text-sky-400", border: "border-sky-500/30" },
  { id: "postgres" as DocSection, title: "PostgreSQL", icon: Database, color: "text-indigo-400", border: "border-indigo-500/30" },
  { id: "typescript" as DocSection, title: "TypeScript", icon: Code2, color: "text-blue-400", border: "border-blue-500/30" },
  { id: "nextjs" as DocSection, title: "Next.js", icon: Rocket, color: "text-sky-300", border: "border-sky-400/30" },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<DocSection>("ssh");
  const [docData, setDocData] = useState<LiveDocResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    // Removed Gemini API key loading from localStorage
  }, []);

  const fetchDocs = useCallback(async (moduleName: DocSection, query = "", apiKey = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ module: moduleName });
      if (query.trim()) params.set("search", query.trim());
      if (apiKey.trim()) params.set("apiKey", apiKey.trim());
      const res = await fetch(`/api/docs?${params.toString()}&t=${Date.now()}`);
      if (res.ok) {
        const data: LiveDocResponse = await res.json();
        setDocData(data);
      }
    } catch (e) {
      console.error("Error fetching docs from internet source:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs(activeTab, searchQuery);
  }, [activeTab, searchQuery, fetchDocs]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const currentTabInfo = MODULE_TABS.find((t) => t.id === activeTab)!;
  const Icon = currentTabInfo.icon;

  const isConceptualModule = activeTab === "typescript" || activeTab === "nextjs";

  const filteredCommands = docData?.content.officialCommands.filter(
    (c) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      const tokens = query.split(/\s+/).filter(Boolean);
      return tokens.every(token => 
        c.name.toLowerCase().includes(token) || 
        c.description.toLowerCase().includes(token) || 
        c.syntax.toLowerCase().includes(token)
      );
    }
  );

  const hasLocalResults = (filteredCommands?.length ?? 0) > 0;
  const hasExternalResults = (docData?.webResults?.length ?? 0) > 0;

  const filteredTopics = docData?.content.topics.filter(
    (t) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      const tokens = query.split(/\s+/).filter(Boolean);
      return tokens.every(token => 
        t.title.toLowerCase().includes(token) || 
        t.body.toLowerCase().includes(token)
      );
    }
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#050a0f] text-zinc-100">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header Hero */}
        <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_40%),linear-gradient(180deg,#0b1117_0%,#050a0f_100%)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300/90">
                <BookOpen className="h-4 w-4" />
                <span>Documentación oficial sincronizada</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1.5 text-[10px] text-emerald-200/90 font-medium backdrop-blur-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <Globe className="h-3.5 w-3.5" />
                  <span>En línea</span>
                </div>

                <button
                  onClick={() => fetchDocs(activeTab)}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                  title="Recargar documentación desde la fuente oficial"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-emerald-300" : ""}`} />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>

            <h1 className="mb-3 text-3xl sm:text-4xl font-black tracking-tight text-white/95">
              Guías técnicas y referencia de comandos
            </h1>
            <p className="max-w-3xl text-sm sm:text-base text-zinc-300 leading-relaxed">
              Consulta la documentación oficial y actualizada para{' '}
              <strong className="text-white">SSH</strong>,{' '}
              <strong className="text-white">Docker</strong>,{' '}
              <strong className="text-white">PostgreSQL</strong>,{' '}
              <strong className="text-white">TypeScript</strong> y{' '}
              <strong className="text-white">Next.js</strong>.
            </p>

            <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
              {MODULE_TABS.map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-100 shadow-[0_0_0_1px_rgba(52,211,153,0.3)]"
                        : "border border-white/10 bg-white/3 text-zinc-300 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <TabIcon className="h-4 w-4" />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
          {/* Search Bar */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative max-w-md flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder={isConceptualModule ? `Buscar conceptos o temas en ${currentTabInfo.title}...` : `Buscar comandos o conceptos en ${currentTabInfo.title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center backdrop-blur-md">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
              <p className="mt-4 text-xs text-zinc-400">Descargando documentación en vivo desde la web oficial...</p>
            </div>
          ) : docData ? (
            <>
              {/* Module Main Overview Card */}
              <div className="rounded-[28px] border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_60px_rgba(2,6,23,0.7)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/5">
                      <Icon className={`h-6 w-6 ${currentTabInfo.color}`} />
                    </div>
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-bold text-white">{docData.content.title}</h2>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
                          {docData.version}
                        </span>
                      </div>
                      <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <Globe className="h-3 w-3 text-emerald-300" />
                        Fuente oficial: <strong className="text-zinc-200">{docData.source}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={docData.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.05]"
                    >
                      <span>Web oficial</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <Link
                      href={`/${activeTab}`}
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-400/90 hover:bg-emerald-300 text-zinc-950 px-4 py-2 text-xs font-bold transition shadow-[0_10px_30px_rgba(52,211,153,0.18)]"
                    >
                      <Terminal className="h-3.5 w-3.5" />
                      <span>Ir a terminal</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>

                <p className="mt-6 text-sm text-zinc-300 leading-relaxed">
                  {docData.content.summary}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {docData.content.quickLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:border-emerald-400/35 hover:bg-emerald-500/8"
                    >
                      <span>{link.title}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Official Commands Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg font-bold text-white">
                    <Layers className="h-5 w-5 text-emerald-400" />
                    <h3>{isConceptualModule ? "Conceptos clave y referencias oficiales" : "Comandos Oficiales & Sintaxis"}</h3>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {searchQuery.trim()
                      ? `${(filteredCommands?.length || 0) + (docData?.webResults?.length || 0)} ${(filteredCommands?.length || 0) + (docData?.webResults?.length || 0) === 1 ? "resultado encontrado" : "resultados encontrados"}`
                      : `${filteredCommands?.length || 0} referencias listadas`}
                  </span>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/[0.02] overflow-hidden shadow-[0_16px_40px_rgba(2,6,23,0.5)]">
                  <div className="divide-y divide-white/8">
                    {hasLocalResults && filteredCommands ? (
                      filteredCommands.map((cmd, idx) => (
                        <div
                          key={`cmd-${idx}`}
                          className="p-4 sm:p-5 transition hover:bg-white/[0.02]"
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex items-center gap-3 min-w-[160px]">
                              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2.5 py-1.5 text-[11px] font-bold font-mono text-emerald-200">
                                {cmd.name}
                              </span>
                            </div>

                            <div className="flex-1 rounded-2xl border border-white/8 bg-[#0c1319]/80 p-3 sm:p-4">
                              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                                <div className="space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300 font-bold">
                                    Para qué sirve
                                  </p>
                                  <p className="text-xs text-zinc-300 leading-relaxed">{cmd.description}</p>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 font-bold">
                                    Cómo se usa
                                  </p>

                                  <div className="flex items-center gap-2 rounded-xl border border-white/8 bg-zinc-950/90 px-2.5 py-2 text-[11px] font-mono text-zinc-200 overflow-x-auto">
                                    {!isConceptualModule && <span className="text-zinc-500 select-none">$</span>}
                                    <span className="truncate">{cmd.syntax || "Se usa según el contexto del módulo."}</span>
                                    <button
                                      onClick={() => copyToClipboard(cmd.syntax || "")}
                                      className="ml-2 shrink-0 text-zinc-400 hover:text-white transition cursor-pointer"
                                      title={isConceptualModule ? "Copiar ejemplo" : "Copiar sintaxis"}
                                    >
                                      {copiedCode === cmd.syntax ? (
                                        <Check className="h-3.5 w-3.5 text-green-400" />
                                      ) : (
                                        <Copy className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : null}

                    {hasExternalResults && docData?.webResults ? (
                      docData.webResults.map((result, idx) => (
                        <div
                          key={`web-${idx}`}
                          className="p-4 sm:p-5 transition hover:bg-amber-500/[0.02] bg-amber-500/[0.01]"
                        >
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                            <div className="flex flex-col gap-2 min-w-[160px]">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-200">
                                <Globe className="h-3 w-3 text-amber-400" />
                                {result.title}
                              </span>
                              <span className="text-[9px] uppercase tracking-[0.14em] text-amber-400/80 font-semibold px-1">
                                Documentación oficial
                              </span>
                            </div>

                            <div className="flex-1 rounded-2xl border border-amber-500/20 bg-[#0c1319]/90 p-3 sm:p-4">
                              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                                <div className="space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-amber-300 font-bold">
                                    Información oficial
                                  </p>
                                  <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                                    {result.summary}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 font-bold">
                                    Referencia Web
                                  </p>
                                  {result.url ? (
                                    <a
                                      href={result.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-medium text-amber-200 transition hover:bg-amber-500/15"
                                    >
                                      <span>Ver en sitio oficial</span>
                                      <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                  ) : (
                                    <span className="text-xs text-zinc-500 italic">Fuente oficial en vivo</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : null}

                    {!hasLocalResults && !hasExternalResults ? (
                      <div className="p-8 text-center text-xs text-zinc-400">
                        <Search className="h-6 w-6 mx-auto mb-2 text-zinc-600" />
                        <p className="font-semibold text-zinc-300">
                          {searchQuery.trim()
                            ? `No se encontraron referencias para "${searchQuery}"`
                            : "No hay referencias disponibles para este módulo"}
                        </p>
                        <p className="text-zinc-500 mt-1">
                          Prueba buscando con palabras clave como comandos, conceptos o sintaxis.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Technical Guides & Code Architecture */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-bold text-white">
                  <Workflow className="h-5 w-5 text-emerald-400" />
                  <h3>Guías Técnicas & Casos de Uso del Mundo Real</h3>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {filteredTopics?.map((topic, idx) => (
                    <div
                      key={idx}
                      className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6 flex flex-col justify-between backdrop-blur-md shadow-[0_12px_30px_rgba(2,6,23,0.5)]"
                    >
                      <div className="space-y-3 mb-4">
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/15 bg-emerald-500/6 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-200">
                          <Sparkles className="h-3 w-3" />
                          Tema clave {idx + 1}
                        </span>
                        <h4 className="text-base font-bold text-white">{topic.title}</h4>
                        <p className="text-xs text-zinc-300 leading-relaxed">{topic.body}</p>
                      </div>

                      {topic.codeSample && (
                        <div className="relative rounded-2xl border border-white/8 bg-[#0a1218] p-4 font-mono text-xs overflow-x-auto">
                          <div className="mb-2 flex items-center justify-between border-b border-white/8 pb-2 text-[10px] text-zinc-500">
                            <span>EJEMPLO / CONFIGURACIÓN</span>
                            <button
                              onClick={() => copyToClipboard(topic.codeSample!)}
                              className="flex items-center gap-1 text-zinc-400 hover:text-white transition cursor-pointer"
                            >
                              {copiedCode === topic.codeSample ? (
                                <>
                                  <Check className="h-3 w-3 text-green-400" />
                                  <span className="text-green-400">Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copiar</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="text-zinc-300 whitespace-pre leading-relaxed">{topic.codeSample}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-xs text-zinc-400">
              No se pudo sincronizar la información. Intenta presionar el botón "Actualizar".
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
