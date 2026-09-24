"use client";

import {
  ArrowLeft,
  CheckCircle2,
  FileCode,
  LayoutTemplate,
  Layers3,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import PracticeAuthGuard from "@/app/components/PracticeAuthGuard";
import { ModuleProgressBar } from "@/app/components/PracticeProgressBar";
import CodePracticeEditor from "@/app/components/CodePracticeEditor";
import { usePracticeProgress } from "@/lib/ProgressContext";

const starterCode = `export default function HomePage() {
  const title = "Bienvenido a Next.js";
  const items = ["App Router", "Server Components", "Client Components"];

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold text-sky-700">{title}</h1>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-gray-700">• {item}</li>
        ))}
      </ul>
    </main>
  );
}
`;

const tips = [
  {
    icon: Layers3,
    title: "App Router",
    desc: "Cada carpeta de app/ representa una ruta de la aplicación y puede contener layouts, pages y rutas API.",
  },
  {
    icon: LayoutTemplate,
    title: "Server vs Client",
    desc: "Usa 'use client' solo en componentes interactivos; el resto puede ser server-side por defecto.",
  },
  {
    icon: ShieldCheck,
    title: "Props y tipos",
    desc: "Define props con TypeScript para evitar errores de render y composición de componentes.",
  },
];

export default function NextJsPage() {
  const { recordCommand } = usePracticeProgress();

  return (
    <div className="flex min-h-screen flex-col bg-[#050d1a]">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-sky-900/30 bg-gradient-to-br from-sky-950/60 via-[#050d1a] to-[#050d1a]">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-sky-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Rocket className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Práctica <span className="text-sky-400">Next.js</span>
                </h1>
                <p className="text-zinc-400">
                  Editor de componentes con compilación para detectar errores de JSX, props y estructura del App Router.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <PracticeAuthGuard
            moduleName="Next.js"
            moduleIcon={Rocket}
            themeColor="sky"
          >
            <div className="mb-6">
              <ModuleProgressBar module="nextjs" />
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.7fr_0.9fr]">
              <CodePracticeEditor
                title="Editor Next.js"
                subtitle="Escribe un componente y valida si hay errores de render o JSX"
                accent="sky"
                fileName="app/page.tsx"
                initialCode={starterCode}
                moduleKey="nextjs"
                onRun={(command) => recordCommand("nextjs", command)}
              />

              <div className="space-y-4">
                <div className="rounded-xl border border-sky-900/30 bg-sky-950/40 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-sky-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Puntos clave
                  </div>
                  {tips.map((tip, index) => (
                    <div
                      key={index}
                      className="mb-3 rounded-lg border border-sky-900/20 bg-sky-950/30 p-3 last:mb-0"
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <tip.icon className="h-4 w-4 text-sky-400" />
                        <span className="text-sm font-medium text-white">{tip.title}</span>
                      </div>
                      <p className="text-xs text-zinc-400">{tip.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-sky-900/30 bg-sky-950/30 p-4">
                  <h4 className="mb-2 text-sm font-medium text-sky-400 flex items-center gap-1.5">
                    <FileCode className="h-4 w-4" />
                    Archivos típicos
                  </h4>
                  <div className="space-y-1 text-xs text-zinc-300 font-mono">
                    <p>• app/page.tsx</p>
                    <p>• app/layout.tsx</p>
                    <p>• app/globals.css</p>
                    <p>• app/components/Card.tsx</p>
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
