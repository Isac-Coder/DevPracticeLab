"use client";

import { ArrowLeft, Box, Code2, FileCode, Layers, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import CodePracticeEditor, { type EditorFile } from "@/app/components/CodePracticeEditor";
import PracticeAuthGuard from "@/app/components/PracticeAuthGuard";
import { ModuleProgressBar } from "@/app/components/PracticeProgressBar";
import { usePracticeProgress } from "@/lib/ProgressContext";

const tips = [
  {
    icon: Layers,
    title: "Type vs Interface",
    desc: "Usa interfaces para objetos y POO; usa type para uniones, primitivos y tuplas.",
  },
  {
    icon: Sparkles,
    title: "Tipos Genéricos",
    desc: "Crea componentes y funciones reutilizables con parámetros de tipo <T>.",
  },
  {
    icon: Shield,
    title: "Modo Estricto",
    desc: "strictNullChecks y noImplicitAny previenen errores antes de llegar a producción.",
  },
  {
    icon: Box,
    title: "Utility Types",
    desc: "Aprovecha Partial<T>, Pick<T, K>, Omit<T, K> y Record<K, V> para transformar tipos.",
  },
];

const starterCode = "";

export default function TypeScriptPage() {
  const { recordCommand } = usePracticeProgress();
  const [files, setFiles] = useState<EditorFile[]>([]);

  return (
    <div className="flex min-h-screen flex-col bg-[#070d1e]">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-blue-900/30 bg-gradient-to-br from-blue-950/60 via-[#070d1e] to-[#070d1e]">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Code2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Práctica <span className="text-blue-400">TypeScript</span>
                </h1>
                <p className="text-zinc-400">
                  Editor de código con validación para tipos, interfaces, genéricos y utility types.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <PracticeAuthGuard
            moduleName="TypeScript"
            moduleIcon={Code2}
            themeColor="sky"
          >
            <div className="mb-6">
              <ModuleProgressBar module="typescript" />
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.7fr_0.9fr]">
              <CodePracticeEditor
                title="Editor TypeScript"
                accent="blue"
                fileName="app.ts"
                initialCode={starterCode}
                moduleKey="typescript"
                onRun={(command) => recordCommand("typescript", command)}
                onFilesChange={setFiles}
              />

              <div className="space-y-4">
                <div className="rounded-xl border border-blue-900/30 bg-blue-950/30 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-300">
                    <FileCode className="h-4 w-4" />
                    Archivos creados
                  </div>
                  <div className="space-y-1 text-xs font-mono text-zinc-300">
                    {files.map((file) => (
                      <p key={file.id}>• {file.name}</p>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
                  <div className="mb-3 text-sm font-semibold text-blue-300">Sugerencias</div>
                  <div className="space-y-3">
                    {tips.map(({ icon: Icon, title, desc }) => (
                      <div key={title} className="flex gap-3 rounded-lg border border-blue-900/20 bg-[#091426] p-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{title}</p>
                          <p className="text-xs leading-5 text-zinc-400">{desc}</p>
                        </div>
                      </div>
                    ))}
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
