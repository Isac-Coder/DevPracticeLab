"use client";

import { useMemo } from "react";
import { Server, ArrowLeft, Shield, Key, FileUp, Network } from "lucide-react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import SimulatedTerminal, { type TerminalConfig } from "@/app/components/SimulatedTerminal";
import { getSSHCommands, sshWelcome, handleSSHPassword } from "./commands";

const tips = [
  {
    icon: Shield,
    title: "Autenticación segura",
    desc: "Usa claves SSH en lugar de contraseñas para mayor seguridad.",
  },
  {
    icon: Key,
    title: "ssh-keygen",
    desc: "Genera pares de claves RSA o Ed25519 para autenticación.",
  },
  {
    icon: FileUp,
    title: "SCP & SFTP",
    desc: "Transfiere archivos de forma segura entre máquinas.",
  },
  {
    icon: Network,
    title: "Port Forwarding",
    desc: "Redirige puertos locales y remotos a través de túneles SSH.",
  },
];

export default function SSHPage() {
  const terminalConfig: TerminalConfig = useMemo(
    () => ({
      prompt: "root@localhost:~# ",
      welcomeMessage: sshWelcome,
      commands: getSSHCommands(),
      onPasswordSubmit: handleSSHPassword,
      theme: {
        bg: "bg-gray-950",
        text: "text-green-400",
        prompt: "text-green-500",
        border: "border-green-900/50",
        header: "bg-gray-900",
        headerText: "text-green-400",
        headerDots: ["bg-red-500", "bg-yellow-500", "bg-green-500"],
      },
    }),
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-green-900/30 bg-gradient-to-br from-green-950/50 via-gray-950 to-gray-950">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-green-400"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
                <Server className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Práctica <span className="text-green-400">SSH</span>
                </h1>
                <p className="text-zinc-400">
                  Secure Shell — Conexiones remotas seguras a servidores
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
                Consejos SSH
              </h3>
              {tips.map((tip, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-green-900/30 bg-gray-900/50 p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <tip.icon className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-white">
                      {tip.title}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{tip.desc}</p>
                </div>
              ))}

              <div className="rounded-xl border border-green-900/30 bg-green-950/30 p-4">
                <h4 className="mb-2 text-sm font-medium text-green-400">
                  🖥️ Servidores disponibles
                </h4>
                <div className="space-y-1 text-xs text-zinc-300 font-mono">
                  <p>• 192.168.1.100 (Ubuntu)</p>
                  <p>• 10.0.0.50 (Debian)</p>
                  <p>• servidor.ejemplo.com (CentOS)</p>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Usuario: <code className="text-green-300">root</code>
                </p>
                <p className="text-xs text-zinc-500">
                  Contraseña: <code className="text-green-300">A12345678</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
