"use client";

import { useMemo } from "react";
import { Container, ArrowLeft, Box, Layers, HardDrive, GitBranch } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import SimulatedTerminal, { type TerminalConfig } from "@/app/components/SimulatedTerminal";
import PracticeAuthGuard from "@/app/components/PracticeAuthGuard";
import { ModuleProgressBar } from "@/app/components/PracticeProgressBar";
import { usePracticeProgress } from "@/lib/ProgressContext";
import { getDockerCommands, dockerWelcome } from "./commands";

const tips = [
  {
    icon: Box,
    title: "Contenedores",
    desc: "Instancias ligeras y aisladas que ejecutan aplicaciones.",
  },
  {
    icon: Layers,
    title: "Imágenes",
    desc: "Plantillas inmutables para crear contenedores.",
  },
  {
    icon: HardDrive,
    title: "Volúmenes",
    desc: "Persistencia de datos más allá del ciclo de vida del contenedor.",
  },
  {
    icon: GitBranch,
    title: "Docker Compose",
    desc: "Orquestación de múltiples contenedores con un solo archivo.",
  },
];

export default function DockerPage() {
  const { recordCommand } = usePracticeProgress();

  const terminalConfig: TerminalConfig = useMemo(
    () => ({
      prompt: "root@docker-host:~# ",
      welcomeMessage: dockerWelcome,
      commands: getDockerCommands(),
      onCommandRun: (cmd: string) => recordCommand("docker", cmd),
      theme: {
        bg: "bg-slate-950",
        text: "text-sky-300",
        prompt: "text-sky-400",
        border: "border-sky-900/50",
        header: "bg-slate-900",
        headerText: "text-sky-400",
        headerDots: ["bg-red-500", "bg-yellow-500", "bg-green-500"],
      },
    }),
    [recordCommand]
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-sky-900/30 bg-gradient-to-br from-sky-950/50 via-slate-950 to-slate-950">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-sky-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
                <Container className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Práctica <span className="text-sky-400">Docker</span>
                </h1>
                <p className="text-zinc-400">
                  Containerización — Gestiona contenedores y microservicios
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <PracticeAuthGuard
            moduleName="Docker"
            moduleIcon={Container}
            themeColor="sky"
          >
            <div className="mb-6">
              <ModuleProgressBar module="docker" />
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Terminal */}
              <div className="lg:col-span-2">
                <SimulatedTerminal config={terminalConfig} />
              </div>

              {/* Tips sidebar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Consejos Docker
                </h3>
                {tips.map((tip, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-sky-900/30 bg-slate-900/50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <tip.icon className="h-4 w-4 text-sky-400" />
                      <span className="text-sm font-medium text-white">
                        {tip.title}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400">{tip.desc}</p>
                  </div>
                ))}

                <div className="rounded-xl border border-sky-900/30 bg-sky-950/30 p-4">
                  <h4 className="mb-2 text-sm font-medium text-sky-400">
                    🐳 Contenedores activos
                  </h4>
                  <div className="space-y-1 text-xs text-zinc-300 font-mono">
                    <p>• web-server (nginx:latest)</p>
                    <p>• api-backend (node:20-alpine)</p>
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Usa <code className="text-sky-300">docker ps</code> para verlos
                  </p>
                </div>
              </div>
            </div>
          </PracticeAuthGuard>
        </div>
      </main>
    </div>
  );
}
