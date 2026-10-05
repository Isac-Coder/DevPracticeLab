"use client";

import { useState, useMemo, useEffect } from "react";
import { Server, Container, Database, Code2 } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { usePlatformMode } from "@/lib/PlatformModeContext";
import { ENGLISH_GRAMMAR_DOCS } from "@/lib/englishDocsData";

type DocSection = "ssh" | "docker" | "postgres" | "typescript";

const MODULE_TABS = [
  { id: "ssh" as DocSection, title: "SSH", icon: Server },
  { id: "docker" as DocSection, title: "Docker", icon: Container },
  { id: "postgres" as DocSection, title: "PostgreSQL", icon: Database },
  { id: "typescript" as DocSection, title: "TypeScript", icon: Code2 },
];

const ENGLISH_BOOKS = [
  { id: "fundamentals", title: "Top Notch Fundamentals" },
  { id: "tn1", title: "Top Notch 1" },
  { id: "tn2", title: "Top Notch 2" },
  { id: "tn3", title: "Top Notch 3" },
  { id: "summit1", title: "Summit 1" },
  { id: "summit2", title: "Summit 2" },
];

export default function DocsPage() {
  const { isEnglish } = usePlatformMode();
  const [activeTab, setActiveTab] = useState<DocSection>("ssh");
  const [activeBook, setActiveBook] = useState("fundamentals");
  const [activeDocId, setActiveDocId] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    if (!isEnglish) return [];
    return ENGLISH_GRAMMAR_DOCS.filter(doc => doc.bookLevelId === activeBook);
  }, [isEnglish, activeBook]);

  useEffect(() => {
    if (isEnglish) {
      setActiveDocId(filteredDocs[0]?.id || null);
    }
  }, [activeBook, isEnglish, filteredDocs]);

  const activeDoc = useMemo(() => {
    return isEnglish ? ENGLISH_GRAMMAR_DOCS.find(d => d.id === activeDocId) : null;
  }, [activeDocId, isEnglish]);

  return (
    <div className="min-h-screen bg-[#030814] text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {isEnglish
            ? ENGLISH_BOOKS.map(book => (
                <button
                  key={book.id}
                  onClick={() => setActiveBook(book.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    activeBook === book.id
                      ? "bg-sky-500 text-zinc-950"
                      : "bg-blue-950/40 text-slate-300 hover:bg-blue-950"
                  }`}
                >
                  {book.title}
                </button>
              ))
            : MODULE_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as DocSection)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTab === tab.id
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-blue-950/40 text-slate-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.title}
                </button>
              ))}
        </div>

        {isEnglish ? (
          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            <aside className="space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unidades</h2>
              <div className="space-y-1">
                {filteredDocs.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocId(doc.id)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition ${
                      activeDocId === doc.id
                        ? "bg-sky-500/20 text-sky-300 border border-sky-400/30"
                        : "text-slate-300 hover:bg-blue-950/50"
                    }`}
                  >
                    {doc.topicTitle}
                  </button>
                ))}
              </div>
            </aside>
            <section className="rounded-3xl border border-blue-900/60 bg-[#07152b] p-8">
              {activeDoc ? (
                <div className="space-y-6">
                  <header>
                    <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">{activeDoc.category}</span>
                    <h1 className="text-3xl font-black text-white mt-2">{activeDoc.topicTitle}</h1>
                    <p className="text-slate-300 mt-4 leading-relaxed italic border-l-2 border-sky-400 pl-4">{activeDoc.summary}</p>
                  </header>
                  
                  <div className="bg-blue-950/30 p-5 rounded-xl border border-blue-900/50">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Estructura / Fórmula</h3>
                    <code className="text-sky-300 font-mono text-sm bg-black/30 p-2 rounded block">{activeDoc.formula}</code>
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">Reglas de Uso</h3>
                      <ul className="list-disc list-inside space-y-2 text-slate-300 text-sm">
                          {activeDoc.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                      </ul>
                  </div>

                  <div className="space-y-4">
                      <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">Ejemplos Clave</h3>
                      <div className="grid gap-3">
                          {activeDoc.examples.map((ex, i) => (
                            <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-white font-semibold">{ex.en}</p>
                                <p className="text-slate-400 text-sm mt-1">{ex.es}</p>
                                {ex.note && <p className="text-xs text-sky-400/80 mt-2 font-mono italic">Note: {ex.note}</p>}
                            </div>
                          ))}
                      </div>
                  </div>

                  {activeDoc.commonMistakes && activeDoc.commonMistakes.length > 0 && (
                  <div className="space-y-4 border-t border-red-900/30 pt-6">
                      <h3 className="text-sm font-bold text-red-300">Errores Comunes</h3>
                      <div className="grid gap-3">
                          {activeDoc.commonMistakes.map((mistake, i) => (
                            <div key={i} className="bg-red-950/20 p-4 rounded-xl border border-red-900/30">
                                <p className="text-red-300 text-sm line-through">❌ {mistake.wrong}</p>
                                <p className="text-emerald-300 text-sm font-bold mt-1">✅ {mistake.correct}</p>
                                <p className="text-slate-400 text-xs mt-2">{mistake.explanation}</p>
                            </div>
                          ))}
                      </div>
                  </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-slate-400">Selecciona un tema.</div>
              )}
            </section>
          </div>
        ) : (
          <div className="text-slate-400">Página de documentación técnica para {activeTab}.</div>
        )}
      </main>
    </div>
  );
}
