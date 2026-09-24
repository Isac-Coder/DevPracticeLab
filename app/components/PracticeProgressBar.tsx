"use client";

import React from "react";
import { Server, Container, Database, Code2, TrendingUp, CheckCircle, Flame, Award, Rocket } from "lucide-react";
import { usePracticeProgress, ModuleType } from "@/lib/ProgressContext";

interface ModuleProgressBarProps {
  module: ModuleType;
  showDetails?: boolean;
}

export function ModuleProgressBar({ module, showDetails = true }: ModuleProgressBarProps) {
  const { getModuleStats } = usePracticeProgress();
  const stats = getModuleStats(module);

  const colors = {
    ssh: {
      bar: "bg-linear-to-r from-green-500 to-emerald-400",
      bg: "bg-green-950/40",
      border: "border-green-900/40",
      text: "text-green-400",
      accent: "text-emerald-300",
      badge: "bg-green-500/10 border-green-500/20 text-green-400",
      icon: Server,
    },
    docker: {
      bar: "bg-linear-to-r from-sky-500 to-blue-400",
      bg: "bg-sky-950/40",
      border: "border-sky-900/40",
      text: "text-sky-400",
      accent: "text-blue-300",
      badge: "bg-sky-500/10 border-sky-500/20 text-sky-400",
      icon: Container,
    },
    postgres: {
      bar: "bg-linear-to-r from-indigo-500 to-purple-400",
      bg: "bg-indigo-950/40",
      border: "border-indigo-900/40",
      text: "text-indigo-400",
      accent: "text-purple-300",
      badge: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
      icon: Database,
    },
    typescript: {
      bar: "bg-linear-to-r from-blue-500 to-cyan-400",
      bg: "bg-blue-950/40",
      border: "border-blue-900/40",
      text: "text-blue-400",
      accent: "text-cyan-300",
      badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      icon: Code2,
    },
    nextjs: {
      bar: "bg-linear-to-r from-sky-500 to-cyan-400",
      bg: "bg-sky-950/40",
      border: "border-sky-900/40",
      text: "text-sky-400",
      accent: "text-cyan-300",
      badge: "bg-sky-500/10 border-sky-500/20 text-sky-400",
      icon: Rocket,
    },
  }[module];

  const Icon = colors.icon;

  return (
    <div className={`rounded-xl border ${colors.border} ${colors.bg} p-4 backdrop-blur-sm`}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colors.badge}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-semibold text-white text-sm">
            Nivel de Práctica {stats.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${colors.text}`}>
            {stats.percentage}%
          </span>
          <span className="text-xs text-zinc-500">
            ({stats.completedTargets.length}/{stats.totalGoal} objetivos)
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-900/80 p-0.5 border border-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colors.bar}`}
          style={{ width: `${Math.max(stats.percentage, 4)}%` }}
        />
      </div>

      {showDetails && (
        <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2 border-t border-zinc-800/60 pt-2.5">
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>
              <strong className="text-white font-medium">{stats.commandsExecuted}</strong> comandos ejecutados
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              <strong className="text-white font-medium">{stats.uniqueCount}</strong> comandos distintos
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function OverallProgressDashboard() {
  const { getModuleStats, overallPercentage, totalCommandsExecuted } = usePracticeProgress();

  const sshStats = getModuleStats("ssh");
  const dockerStats = getModuleStats("docker");
  const postgresStats = getModuleStats("postgres");
  const tsStats = getModuleStats("typescript");
  const nextJsStats = getModuleStats("nextjs");

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Estado y Progreso de Práctica
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                <Award className="h-3 w-3" />
                {overallPercentage >= 80 ? "Nivel Avanzado" : overallPercentage >= 40 ? "Nivel Intermedio" : "Nivel Inicial"}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Monitoreo de comandos ejecutados y objetivos alcanzados en tus terminales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 self-end sm:self-center">
          <div className="text-right">
            <div className="text-2xl font-black text-emerald-400">{overallPercentage}%</div>
            <div className="text-[11px] text-zinc-400 font-medium">Dominio General</div>
          </div>
          <div className="h-8 w-px bg-zinc-800" />
          <div className="text-right">
            <div className="text-2xl font-black text-white">{totalCommandsExecuted}</div>
            <div className="text-[11px] text-zinc-400 font-medium">Comandos Totales</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {/* SSH Progress Bar */}
        <div className="rounded-xl border border-green-900/30 bg-green-950/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
              <Server className="h-4 w-4" />
              <span>SSH</span>
            </div>
            <span className="text-xs font-bold text-green-400">{sshStats.percentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
            <div
              className="h-full bg-linear-to-r from-green-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.max(sshStats.percentage, 3)}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-zinc-400">
            <span>{sshStats.commandsExecuted} ejecuciones</span>
            <span>{sshStats.completedTargets.length}/{sshStats.totalGoal} objetivos</span>
          </div>
        </div>

        {/* Docker Progress Bar */}
        <div className="rounded-xl border border-sky-900/30 bg-sky-950/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold">
              <Container className="h-4 w-4" />
              <span>Docker</span>
            </div>
            <span className="text-xs font-bold text-sky-400">{dockerStats.percentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
            <div
              className="h-full bg-linear-to-r from-sky-500 to-blue-400 transition-all duration-500"
              style={{ width: `${Math.max(dockerStats.percentage, 3)}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-zinc-400">
            <span>{dockerStats.commandsExecuted} ejecuciones</span>
            <span>{dockerStats.completedTargets.length}/{dockerStats.totalGoal} objetivos</span>
          </div>
        </div>

        {/* PostgreSQL Progress Bar */}
        <div className="rounded-xl border border-indigo-900/30 bg-indigo-950/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
              <Database className="h-4 w-4" />
              <span>PostgreSQL</span>
            </div>
            <span className="text-xs font-bold text-indigo-400">{postgresStats.percentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-purple-400 transition-all duration-500"
              style={{ width: `${Math.max(postgresStats.percentage, 3)}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-zinc-400">
            <span>{postgresStats.commandsExecuted} ejecuciones</span>
            <span>{postgresStats.completedTargets.length}/{postgresStats.totalGoal} objetivos</span>
          </div>
        </div>

        {/* TypeScript Progress Bar */}
        <div className="rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold">
              <Code2 className="h-4 w-4" />
              <span>TypeScript</span>
            </div>
            <span className="text-xs font-bold text-blue-400">{tsStats.percentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
            <div
              className="h-full bg-linear-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.max(tsStats.percentage, 3)}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-zinc-400">
            <span>{tsStats.commandsExecuted} ejecuciones</span>
            <span>{tsStats.completedTargets.length}/{tsStats.totalGoal} objetivos</span>
          </div>
        </div>

        {/* Next.js Progress Bar */}
        <div className="rounded-xl border border-sky-900/30 bg-sky-950/20 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sky-400 text-sm font-semibold">
              <Rocket className="h-4 w-4" />
              <span>Next.js</span>
            </div>
            <span className="text-xs font-bold text-sky-400">{nextJsStats.percentage}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
            <div
              className="h-full bg-linear-to-r from-sky-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.max(nextJsStats.percentage, 3)}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] text-zinc-400">
            <span>{nextJsStats.commandsExecuted} ejecuciones</span>
            <span>{nextJsStats.completedTargets.length}/{nextJsStats.totalGoal} objetivos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
