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

type DocSection = "ssh" | "docker" | "postgres" | "typescript";

const MODULE_TABS = [
  { id: "ssh" as DocSection, title: "SSH", icon: Server, color: "text-green-400", border: "border-green-500/30" },
  { id: "docker" as DocSection, title: "Docker", icon: Container, color: "text-sky-400", border: "border-sky-500/30" },
  { id: "postgres" as DocSection, title: "PostgreSQL", icon: Database, color: "text-indigo-400", border: "border-indigo-500/30" },
  { id: "typescript" as DocSection, title: "TypeScript", icon: Code2, color: "text-blue-400", border: "border-blue-500/30" },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<DocSection>("ssh");
  const [docData, setDocData] = useState<LiveDocResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

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
    fetchDocs(activeTab, debouncedQuery);
  }, [activeTab, debouncedQuery, fetchDocs]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const currentTabInfo = MODULE_TABS.find((t) => t.id === activeTab)!;
  const Icon = currentTabInfo.icon;

  const isConceptualModule = activeTab === "typescript";

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
  const filteredWebResults = docData?.webResults ?? [];
  const hasExternalResults = filteredWebResults.length > 0;

  const filteredTopics = docData?.content.topics ?? [];

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
            <div className="relative w-full flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder={isConceptualModule ? `Buscar conceptos o temas en ${currentTabInfo.title}...` : `Buscar comandos o conceptos en ${currentTabInfo.title}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/3 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
          </div>

          {loading ? (
              <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center backdrop-blur-md">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
              <p className="mt-4 text-xs text-zinc-400">Descargando documentación en vivo desde la web oficial...</p>
            </div>
          ) : docData ? (
            <>
              {/* Module Main Overview Card */}
              <div className="rounded-3xl border border-white/10 bg-white/2 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_60px_rgba(2,6,23,0.7)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-500/5">
                      <Icon className={`h-6 w-6 ${currentTabInfo.color}`} />
                    </div>
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-bold text-white">{docData.content.title}</h2>
                        <span className="rounded-full border border-white/10 bg-white/4 px-2.5 py-0.5 text-[11px] font-mono text-zinc-300">
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
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/3 px-3 py-2 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-white/5"
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

              <div className="space-y-4 font-serif text-zinc-900 bg-white p-8 rounded-lg shadow-sm border border-zinc-200">
                <div className="flex items-center justify-between border-b border-zinc-300 pb-4 mb-6">
                  <div className="flex items-center gap-4 text-3xl font-bold text-zinc-950">
                    <Layers className="h-8 w-8 text-sky-700" />
                    <h3>{docData.content.title}</h3>
                  </div>
                </div>

                <div className="bg-zinc-50 p-6 rounded-lg border-l-4 border-sky-600 mb-8">
                  <p className="text-sm text-zinc-700 leading-relaxed italic">
                    {docData.content.summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {hasExternalResults && (
                    <div className="md:col-span-2 p-4 rounded-xl border border-white/5 bg-white/5">
                      <h4 className="text-sm font-semibold text-emerald-400 mb-3">Resultados de búsqueda web:</h4>
                      <div className="space-y-3">
                        {filteredWebResults?.map((result, idx) => (
                          <a key={idx} href={result.url} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-lg hover:bg-white/10 transition">
                            <span className="text-sm font-bold text-white">{result.title}</span>
                            <p className="text-xs text-zinc-400 mt-0.5">{result.summary}</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {filteredTopics?.map((topic, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="text-xl font-semibold text-zinc-900 border-b border-zinc-200 pb-2">{topic.title}</h4>
                      <p className="text-sm text-zinc-700 leading-relaxed">{topic.body}</p>
                      {topic.codeSample && (
                        <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-md text-xs overflow-x-auto">
                          <code>{topic.codeSample}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-300">
                    <h4 className="text-lg font-semibold text-zinc-900 mb-4">Referencias externas</h4>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-sky-800">
                        {docData.content.quickLinks.map((link, idx) => (
                            <li key={idx}><a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{link.title}</a></li>
                        ))}
                    </ul>
                </div>
              </div>

              {/* Technical Guides & Code Architecture */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-bold text-white">
                  <Workflow className="h-5 w-5 text-emerald-400" />
                  <h3>Guías Técnicas & Casos de Uso del Mundo Real</h3>
                </div>

                {/* Resultados Web */}
                {filteredWebResults && filteredWebResults.length > 0 && (
                  <div className="grid gap-6 lg:grid-cols-2 mb-8">
                    {filteredWebResults.map((result, idx) => (
                      <div key={idx} className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5">
                        <h4 className="text-sm font-bold text-sky-200 mb-2">{result.title}</h4>
                        <p className="text-xs text-zinc-400 mb-3">{result.summary}</p>
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">Ver fuente original</a>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                  {filteredTopics?.map((topic, idx) => (
                    <div
                      key={idx}
                      className="rounded-3xl border border-white/10 bg-white/2 p-6 flex flex-col justify-between backdrop-blur-md shadow-[0_12px_30px_rgba(2,6,23,0.5)]"
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
