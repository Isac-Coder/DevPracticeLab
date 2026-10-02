"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
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
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import type { LiveDocResponse } from "@/app/api/docs/route";
import type { WebDocumentationResult } from "@/app/api/docs/search/route";

type DocSection = "ssh" | "docker" | "postgres" | "typescript";

const renderDocumentation = (markdown: string) =>
  markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const codeBlock = block.match(/^```([\w+-]*)\n([\s\S]*?)```$/);
      if (codeBlock) {
        return (
          <pre key={index} className="overflow-x-auto rounded-xl border border-white/10 bg-[#070d13] p-4 text-xs leading-relaxed text-zinc-200">
            <code>{codeBlock[2].trim()}</code>
          </pre>
        );
      }

      const heading = block.match(/^#{1,4}\s+(.+)$/);
      if (heading) {
        return <h4 key={index} className="pt-3 text-lg font-bold text-white">{heading[1]}</h4>;
      }

      const listItems = block
        .split("\n")
        .filter((line) => /^\s*(?:[-*+]|\d+\.)\s+/.test(line));
      if (listItems.length > 0) {
        return (
          <ul key={index} className="list-disc space-y-2 pl-6 text-sm leading-relaxed text-zinc-300">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex}>
                {item.replace(/^\s*(?:[-*+]|\d+\.)\s+/, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`([^`]+)`/g, "$1")}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={index} className="whitespace-pre-line text-sm leading-7 text-zinc-300">
          {block.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`([^`]+)`/g, "$1")}
        </p>
      );
    });

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
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WebDocumentationResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchRefreshKey, setSearchRefreshKey] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchDocs = useCallback(async (moduleName: DocSection) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/docs?module=${moduleName}&t=${Date.now()}`);
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
    const timeout = window.setTimeout(() => {
      void fetchDocs(activeTab);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [activeTab, fetchDocs]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      if (!submittedQuery.trim()) {
        setSearchResults([]);
        setSearchError("");
        setSearchLoading(false);
        return;
      }

      const search = async () => {
        setSearchLoading(true);
        setSearchError("");
        try {
          const params = new URLSearchParams({ module: activeTab, query: submittedQuery.trim() });
          const response = await fetch(`/api/docs/search?${params}`, { signal: controller.signal });
          const data: { error?: string; results?: WebDocumentationResult[] } = await response.json();
          if (!response.ok) throw new Error(data.error || "No se pudo buscar la documentación.");
          setSearchResults(data.results ?? []);
        } catch (error) {
          if (!controller.signal.aborted) {
            setSearchError(error instanceof Error ? error.message : "No se pudo buscar la documentación.");
            setSearchResults([]);
          }
        } finally {
          if (!controller.signal.aborted) setSearchLoading(false);
        }
      };

      void search();
    }, 0);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [activeTab, submittedQuery, searchRefreshKey]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    if (query === submittedQuery) {
      setSearchRefreshKey((current) => current + 1);
    } else {
      setSubmittedQuery(query);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const currentTabInfo = MODULE_TABS.find((t) => t.id === activeTab)!;
  const Icon = currentTabInfo.icon;

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
                  onClick={() => submittedQuery.trim() ? setSearchRefreshKey((current) => current + 1) : fetchDocs(activeTab)}
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
          <form onSubmit={submitSearch} className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder={`Buscar documentación actualizada de ${currentTabInfo.title} en la web...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/10 bg-white/3 py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-zinc-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading || !searchQuery.trim()}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2.5 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/50 hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Search className="h-4 w-4" />
              Buscar
            </button>
          </form>

          {submittedQuery.trim() ? (
            searchLoading ? (
              <div className="flex min-h-75 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
                <p className="mt-4 text-sm text-zinc-300">Buscando y descargando documentación oficial actualizada…</p>
              </div>
            ) : searchError ? (
              <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-200">
                {searchError}
              </div>
            ) : searchResults.length > 0 ? (
              <section aria-live="polite" className="space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Documentación encontrada en la web</p>
                    <h2 className="mt-1 text-xl font-bold text-white">Resultados para &ldquo;{submittedQuery}&rdquo;</h2>
                  </div>
                  <p className="text-xs text-zinc-500">{searchResults.length} documentos oficiales</p>
                </div>

                {searchResults.map((result) => (
                  <article key={result.url} className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-xl">
                    <header className="border-b border-white/10 bg-white/3 px-5 py-4 sm:px-7">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                            <Globe className="h-3.5 w-3.5" />
                            Fuente oficial actual
                          </div>
                          <h3 className="text-lg font-bold text-white sm:text-xl">{result.title}</h3>
                          <p className="mt-1 break-all text-xs text-zinc-500">{new URL(result.url).hostname}</p>
                          {result.language === "en" && (
                            <p className="mt-2 text-xs text-amber-300" role="status">
                              Traducción al español no disponible; se muestra el contenido original en inglés.
                            </p>
                          )}
                        </div>
                        {result.publishedAt && (
                          <p className="text-xs text-zinc-500">
                            Actualizado: {new Date(result.publishedAt).toLocaleDateString()}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-zinc-500">
                          Consultado: {new Date(result.retrievedAt).toLocaleString()}
                        </p>
                      </div>
                      {result.summary && (
                        <p className="mt-4 border-l-2 border-emerald-400/60 pl-3 text-sm leading-relaxed text-zinc-300">
                          {result.summary}
                        </p>
                      )}
                    </header>
                    <div className="space-y-4 px-5 py-6 sm:px-7">
                      {renderDocumentation(result.content)}
                    </div>
                    <footer className="border-t border-white/8 px-5 py-3 text-[11px] text-zinc-500 sm:px-7">
                      Contenido recuperado de la documentación oficial en{" "}
                      {new URL(result.url).hostname}.{" "}
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-emerald-300 hover:underline">
                        Abrir fuente original
                      </a>
                    </footer>
                  </article>
                ))}
              </section>
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
                <Search className="mx-auto mb-3 h-7 w-7 text-zinc-500" />
                <p className="font-semibold text-zinc-200">No se encontró documentación para “{submittedQuery}”.</p>
                <p className="mt-2 text-sm text-zinc-500">Prueba con otros términos. La búsqueda consulta fuentes oficiales actuales del módulo seleccionado.</p>
              </div>
            )
          ) : loading ? (
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
              No se pudo sincronizar la información. Intenta presionar el botón &quot;Actualizar&quot;.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
