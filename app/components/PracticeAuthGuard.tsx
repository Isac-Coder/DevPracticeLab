"use client";

import React from "react";
import Link from "next/link";
import { Lock, LogIn, UserPlus, ShieldAlert, ArrowLeft, Terminal, LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface PracticeAuthGuardProps {
  children: React.ReactNode;
  moduleName: string;
  moduleIcon: LucideIcon;
  themeColor: "green" | "sky" | "indigo";
}

export default function PracticeAuthGuard({
  children,
  moduleName,
  moduleIcon: ModuleIcon,
  themeColor,
}: PracticeAuthGuardProps) {
  const { user, loading } = useAuth();

  const colorStyles = {
    green: {
      border: "border-green-500/30",
      bg: "bg-green-500/10",
      text: "text-green-400",
      btn: "bg-green-500 hover:bg-green-400 text-zinc-950",
    },
    sky: {
      border: "border-sky-500/30",
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      btn: "bg-sky-500 hover:bg-sky-400 text-zinc-950",
    },
    indigo: {
      border: "border-indigo-500/30",
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      btn: "bg-indigo-500 hover:bg-indigo-400 text-white",
    },
  }[themeColor];

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 text-center backdrop-blur-md">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
        <p className="mt-4 text-sm text-zinc-400">Verificando credenciales de acceso...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center backdrop-blur-md shadow-2xl md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800/80 border border-zinc-700 text-amber-400 shadow-inner mb-6">
          <Lock className="h-10 w-10" />
        </div>

        <div className="mx-auto max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400 mb-3">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Acceso Requerido</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Inicia sesión para practicar {moduleName}
          </h2>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
            Para acceder a las terminales interactivas, guardar tu historial y medir tu barra de progreso en tiempo real, es necesario contar con una cuenta activa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition shadow-lg ${colorStyles.btn}`}
            >
              <LogIn className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </Link>

            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <UserPlus className="h-4 w-4" />
              <span>Crear Cuenta</span>
            </Link>
          </div>

          <div className="mt-8 border-t border-zinc-800/80 pt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
