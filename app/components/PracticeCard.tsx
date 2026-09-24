"use client";

import Link from "next/link";
import { Lock, CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { usePracticeProgress, ModuleType } from "@/lib/ProgressContext";

interface PracticeCardProps {
  href: string;
  moduleType?: ModuleType;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  features: string[];
}

export default function PracticeCard({
  href,
  moduleType,
  title,
  description,
  icon: Icon,
  gradient,
  iconColor,
  features,
}: PracticeCardProps) {
  const { user } = useAuth();
  const { getModuleStats } = usePracticeProgress();

  const modKey = moduleType || (href.replace("/", "") as ModuleType);
  const stats = modKey && ["ssh", "docker", "postgres", "typescript", "nextjs"].includes(modKey)
    ? getModuleStats(modKey)
    : null;

  return (
    <Link href={user ? href : "/login"} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1`}
      >
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${gradient}`}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800 ${iconColor}`}
            >
              <Icon className="h-7 w-7" />
            </div>

            {!user ? (
              <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-400">
                <Lock className="h-3 w-3" />
                Requiere login
              </span>
            ) : (
              stats && (
                <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  {stats.percentage}%
                </span>
              )
            )}
          </div>

          <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
          <p className="mb-4 text-sm leading-relaxed text-zinc-400">
            {description}
          </p>

          {/* Mini progress bar if logged in */}
          {user && stats && (
            <div className="mb-4 rounded-lg bg-zinc-950/60 p-2.5 border border-zinc-800/80">
              <div className="flex justify-between text-[11px] text-zinc-400 mb-1.5">
                <span>Progreso</span>
                <span className="font-semibold text-white">{stats.commandsExecuted} comandos ({stats.completedTargets.length}/{stats.totalGoal})</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className={`h-full ${gradient} transition-all duration-500`}
                  style={{ width: `${Math.max(stats.percentage, 4)}%` }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                <div className={`h-1.5 w-1.5 rounded-full ${iconColor.replace("text-", "bg-")}`} />
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between text-sm font-medium text-zinc-400 transition-colors group-hover:text-white border-t border-zinc-800/60 pt-4">
            <span>{user ? "Comenzar práctica" : "Iniciar sesión para practicar"}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
