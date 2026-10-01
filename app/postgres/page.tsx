"use client";

import { useState } from "react";
import { Database, ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import CodePracticeEditor from "@/app/components/CodePracticeEditor";
import PracticeAuthGuard from "@/app/components/PracticeAuthGuard";
import { ModuleProgressBar } from "@/app/components/PracticeProgressBar";
import { usePracticeProgress } from "@/lib/ProgressContext";
import { tables } from "@/app/postgres/commands";

const getColumnType = (column: string) => {
  if (column.includes("id") || column.includes("_id")) return "int";
  if (column.includes("_at") || column.includes("fecha")) return "timestamp";
  if (column.includes("precio") || column.includes("total")) return "decimal";
  if (column.includes("email") || column.includes("nombre") || column.includes("ciudad") || column.includes("categoria") || column.includes("pais") || column.includes("direccion") || column.includes("telefono")) return "varchar";
  if (column.includes("cantidad") || column.includes("stock")) return "int";
  return "text";
};

export default function PostgresPage() {
  const { recordCommand } = usePracticeProgress();
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<{ ok: boolean; output: string[]; summary: string } | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1117]">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-indigo-900/30 bg-gradient-to-br from-indigo-950/50 via-[#0d1117] to-[#0d1117]">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400">
                <Database className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Práctica <span className="text-indigo-400">PostgreSQL</span>
                </h1>
                <p className="text-zinc-400">
                  Base de datos relacional — Consultas SQL interactivas
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <PracticeAuthGuard
            moduleName="PostgreSQL"
            moduleIcon={Database}
            themeColor="indigo"
          >
            <div className="mb-6">
              <ModuleProgressBar module="postgres" />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
              <CodePracticeEditor
                title="Editor SQL PostgreSQL"
                accent="indigo"
                fileName="query.sql"
                initialCode="-- Escribe tu consulta SQL aquí"
                moduleKey="postgres"
                onRun={(cmd) => recordCommand("postgres", cmd)}
                onResult={setQueryResult}
              />

              {/* Dynamic Table Sidebar */}
              <div className="space-y-4">
                <div className="rounded-xl border border-indigo-900/30 bg-indigo-950/30 p-4">
                  <h4 className="mb-2 text-sm font-medium text-indigo-400">🐘 Tablas disponibles</h4>
                  <div className="space-y-2 text-xs text-zinc-300 font-mono">
                    {Object.entries(tables).map(([name, table]) => (
                      <div key={name} className="rounded-lg border border-indigo-800/20 bg-[#0b1328]">
                        <button
                          type="button"
                          onClick={() => setSelectedTable((current) => (current === name ? null : name))}
                          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[11px] font-semibold text-indigo-200 transition hover:bg-indigo-500/5"
                        >
                          <span>{name}</span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <span>{table.rows.length} filas</span>
                            <ChevronDown className={`h-3.5 w-3.5 transition ${selectedTable === name ? "rotate-180" : ""}`} />
                          </span>
                        </button>

                        {selectedTable === name && (
                          <div className="border-t border-indigo-900/30 px-3 py-2 text-[10px] text-zinc-400">
                            <div className="mb-1 flex items-center justify-between gap-2 font-semibold text-zinc-200">
                              <span>{name}</span>
                              <span className="text-zinc-500">estructura</span>
                            </div>
                            <div className="space-y-1">
                              {table.columns.map((column) => (
                                <div key={`${name}-${column}`} className="flex items-center justify-between gap-2 rounded px-1">
                                  <span className="text-zinc-200">{column}</span>
                                  <span className="text-zinc-500">{getColumnType(column)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-indigo-900/30 bg-indigo-950/30 p-4">
                  <h4 className="mb-2 text-sm font-medium text-indigo-400">Resultado de la consulta</h4>
                  <div className="max-h-64 overflow-auto rounded-lg border border-indigo-800/20 bg-[#0b1328] p-3 font-mono text-[11px] text-zinc-200">
                    {queryResult ? (
                      <pre className="whitespace-pre-wrap leading-5 text-zinc-200">{queryResult.output.join("\n")}</pre>
                    ) : (
                      <div className="text-zinc-500">Presiona “Compilar” para ver el resultado.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </PracticeAuthGuard>
        </div>
      </main>
    </div>
  );
}
