"use client";

import { ArrowLeft, Code2, Layers, Shield, Sparkles, Box, FileCode, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import PracticeAuthGuard from "@/app/components/PracticeAuthGuard";
import { ModuleProgressBar } from "@/app/components/PracticeProgressBar";
import CodePracticeEditor from "@/app/components/CodePracticeEditor";
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

const starterCode = `type User = {
  id: number;
  name: string;
  role: "admin" | "editor";
};

const users: User[] = [
  { id: 1, name: "Ana", role: "admin" },
  { id: 2, name: "Luis", role: "editor" },
];

function getUserSummary(user: User) {
  return user.name + " (" + user.role + ")";
}

console.log(users.map(getUserSummary));
`;

export default function TypeScriptPage() {
  const { recordCommand } = usePracticeProgress();

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
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Code2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Práctica <span className="text-blue-400">TypeScript</span>
                </h1>
                <p className="text-zinc-400">
                  Editor de código con validación en tiempo real para tipos, interfaces, genéricos y utility types.
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
                subtitle="Escribe tu código y compílalo para ver errores con TypeScript"
                accent="blue"
                fileName="app.ts"
                initialCode={starterCode}
                moduleKey="typescript"
                onRun={(command) => recordCommand("typescript", command)}
              />

              <div className="space-y-4">
                <div className="rounded-xl border border-blue-900/30 bg-[#0f1b3d]/60 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Consejos TypeScript
                  </div>
                  {tips.map((tip, i) => (
                    <div
                      key={i}
                      className="mb-3 rounded-lg border border-blue-900/20 bg-blue-950/30 p-3 last:mb-0"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <tip.icon className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{tip.title}</span>
                      </div>
                      <p className="text-xs text-zinc-400">{tip.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-blue-900/30 bg-blue-950/30 p-4">
                  <h4 className="mb-2 text-sm font-medium text-blue-400 flex items-center gap-1.5">
                    <FileCode className="h-4 w-4" />
                    Archivos sugeridos
                  </h4>
                  <div className="space-y-1 text-xs text-zinc-300 font-mono">
                    <p>• app.ts</p>
                    <p>• user.ts</p>
                    <p>• generics.ts</p>
                    <p>• tsconfig.json</p>
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
