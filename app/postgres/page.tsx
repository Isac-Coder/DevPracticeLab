"use client";

import { useMemo } from "react";
import { Database, ArrowLeft, Table2, Search, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import SimulatedTerminal, { type TerminalConfig } from "@/app/components/SimulatedTerminal";
import { getPostgresCommands, postgresWelcome } from "./commands";

const tips = [
  {
    icon: Search,
    title: "SELECT",
    desc: "Consulta datos con filtros WHERE, ORDER BY y LIMIT.",
  },
  {
    icon: Pencil,
    title: "INSERT / UPDATE",
    desc: "Agrega y modifica registros en las tablas.",
  },
  {
    icon: Trash2,
    title: "DELETE / DROP",
    desc: "Elimina registros o tablas completas.",
  },
  {
    icon: Table2,
    title: "Comandos psql",
    desc: "Usa \\dt, \\d, \\l para explorar la base de datos.",
  },
];

export default function PostgresPage() {
  const terminalConfig: TerminalConfig = useMemo(
    () => ({
      prompt: "practica_db=# ",
      welcomeMessage: postgresWelcome,
      commands: getPostgresCommands(),
      theme: {
        bg: "bg-[#0d1117]",
        text: "text-indigo-300",
        prompt: "text-indigo-400",
        border: "border-indigo-900/50",
        header: "bg-[#161b22]",
        headerText: "text-indigo-400",
        headerDots: ["bg-red-500", "bg-yellow-500", "bg-green-500"],
      },
    }),
    []
  );

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
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Terminal */}
            <div className="lg:col-span-2">
              <SimulatedTerminal config={terminalConfig} />
            </div>

            {/* Tips sidebar */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Consejos PostgreSQL
              </h3>
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-indigo-900/30 bg-[#161b22] p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <tip.icon className="h-4 w-4 text-indigo-400" />
                    <span className="text-sm font-medium text-white">
                      {tip.title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{tip.desc}</p>
                </div>
              ))}

              <div className="rounded-xl border border-indigo-900/30 bg-indigo-950/30 p-4">
                <h4 className="mb-2 text-sm font-medium text-indigo-400">
                  🐘 Tablas disponibles
                </h4>
                <div className="space-y-1 text-xs text-zinc-300 font-mono">
                  <p>• usuarios (5 registros)</p>
                  <p>• productos (5 registros)</p>
                  <p>• pedidos (5 registros)</p>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Usa <code className="text-indigo-300">\dt</code> para listar
                  tablas
                </p>
              </div>

              <div className="rounded-xl border border-indigo-900/30 bg-[#161b22] p-4">
                <h4 className="mb-2 text-sm font-medium text-indigo-400">
                  💡 Prueba estos comandos
                </h4>
                <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
                  <p>SELECT * FROM usuarios;</p>
                  <p>SELECT nombre, email FROM usuarios WHERE edad &gt; 25;</p>
                  <p>\d productos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
