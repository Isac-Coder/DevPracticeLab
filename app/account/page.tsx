"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  Calendar,
  Save,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Server,
  Container,
  Database,
  Code2,
  Award,
  Flame,
  ArrowRight,
  Trophy,
  Zap,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { usePracticeProgress } from "@/lib/ProgressContext";
import { calculateAccountLevel } from "@/lib/accountLevel";
import { ALL_CHALLENGES } from "@/lib/challengesData";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, updateAccount } = useAuth();
  const { overallPercentage, totalCommandsExecuted, getModuleStats } = usePracticeProgress();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [availableModules, setAvailableModules] = useState<Array<{id:number; slug:string; name:string; description:string}>>([]);
  const [selectedModuleSlugs, setSelectedModuleSlugs] = useState<string[]>([]);
  const [modulesSaving, setModulesSaving] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const storageKey = user ? `devpracticelab_challenges_${user.email}` : "devpracticelab_challenges_guest";

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedChallenges(JSON.parse(saved));
      }
    } catch {
      setCompletedChallenges([]);
    }
  }, [storageKey]);

  const totalXP = useMemo(() => {
    return completedChallenges.reduce((acc, id) => {
      const ch = ALL_CHALLENGES.find((c) => c.id === id);
      return acc + (ch ? ch.xp : 0);
    }, 0);
  }, [completedChallenges]);

  const accountLevel = useMemo(() => {
    return calculateAccountLevel(completedChallenges.length, totalXP);
  }, [completedChallenges.length, totalXP]);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchModules = async () => {
      try {
        const res = await fetch("/api/modules/available");
        if (!res.ok) return;
        const data = await res.json();
        if (data.modules) {
          setAvailableModules(data.modules);
          setSelectedModuleSlugs(data.subscribedModules || data.modules.map((mod: { slug: string }) => mod.slug));
        }
      } catch {
        setAvailableModules([]);
      }
    };

    fetchModules();
  }, [user]);

  const toggleModule = (slug: string) => {
    setSelectedModuleSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((item) => item !== slug);
      }
      return [...prev, slug];
    });
  };

  const saveModuleSubscriptions = async () => {
    if (!user) return;

    setModulesSaving(true);
    try {
      const res = await fetch("/api/modules/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleSlugs: selectedModuleSlugs }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudieron guardar los módulos.");
      }

      setSuccessMsg((prev) => prev || "Tus suscripciones de módulo se guardaron correctamente.");
    } catch (error) {
      setErrorMsg((error as Error).message || "Error al guardar los módulos.");
    } finally {
      setModulesSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-700 border-t-emerald-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 text-center backdrop-blur-md shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700 text-amber-400 mb-4">
              <Lock className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Acceso Requerido</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Debes iniciar sesión para consultar y gestionar la información de tu cuenta.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentPassword) {
      setErrorMsg("Debes ingresar tu contraseña actual para autorizar los cambios.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setErrorMsg("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await updateAccount({
        currentPassword,
        username: username !== user.username ? username : undefined,
        email: email !== user.email ? email : undefined,
        newPassword: newPassword || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Error al actualizar la cuenta.");
      } else {
        setSuccessMsg(res.message || "Tu información ha sido actualizada correctamente.");
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      setErrorMsg("Error inesperado al conectar con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Miembro verificado";

  const sshStats = getModuleStats("ssh");
  const dockerStats = getModuleStats("docker");
  const postgresStats = getModuleStats("postgres");
  const tsStats = getModuleStats("typescript");
  const subscribedModulesCount = selectedModuleSlugs.length;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Header Banner */}
        <section className="border-b border-zinc-800 bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-950">
          <div className="mx-auto max-w-5xl px-6 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-2xl font-black text-zinc-950 shadow-lg shadow-emerald-500/10">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Cuenta Verificada
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 text-xs text-zinc-400 self-start sm:self-auto">
                <Calendar className="h-4 w-4 text-emerald-400" />
                <span>Registrado el <strong className="text-zinc-200">{formattedDate}</strong></span>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
          {/* Account Level Progression Banner */}
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 p-6 backdrop-blur-md shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{accountLevel.rankBadge}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Rango de Cuenta: Nivel {accountLevel.level}</span>
                    <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5">
                      {totalXP} XP Acumulados
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{accountLevel.title}</h3>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xl font-black text-emerald-400">{completedChallenges.length} / 200</div>
                  <div className="text-[11px] text-zinc-400">Retos Superados</div>
                </div>
                <Link
                  href="/challenges"
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-4 py-2.5 transition flex items-center gap-1.5 shadow-md shrink-0"
                >
                  <Trophy className="h-4 w-4" />
                  <span>Ver Retos</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Progreso hacia el siguiente nivel</span>
                <span className="text-amber-400 font-bold">{accountLevel.progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-amber-500 via-emerald-400 to-teal-400 transition-all duration-500"
                  style={{ width: `${Math.max(accountLevel.progressPercent, 5)}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">{accountLevel.description}</p>
            </div>
          </div>

          {/* Quick Metrics & Mastery Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Dominio General</span>
                <Award className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">{overallPercentage}%</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Comandos Totales</span>
                <Flame className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{totalCommandsExecuted}</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Módulos Activos</span>
                <Code2 className="h-4 w-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{subscribedModulesCount} Suscritos</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Base de Datos</span>
                <Database className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-xs font-semibold text-emerald-400 mt-1.5 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Supabase PostgreSQL
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Account Edit Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 md:p-8 backdrop-blur-md shadow-xl">
                <div className="mb-6 pb-4 border-b border-zinc-800">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-400" />
                    Editar Perfil y Seguridad
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Modifica tus datos de acceso. Para aplicar cualquier cambio, es obligatorio ingresar tu contraseña actual.
                  </p>
                </div>

                {/* Alerts */}
                {errorMsg && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{successMsg}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Username Field */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Nombre de Usuario
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                        <User className="h-4 w-4" />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>

                  {/* New Password (Optional) */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Nueva Contraseña <span className="text-zinc-500 font-normal">(Opcional, dejar en blanco para conservar la actual)</span>
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-800/80 py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Current Password Verification (REQUIRED) */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-2 mt-6">
                    <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Lock className="h-4 w-4" />
                      Contraseña Actual (Requerida para confirmar cambios)
                    </label>
                    <p className="text-[11px] text-zinc-400">
                      Por motivos de seguridad en Supabase PostgreSQL, ingresa tu contraseña actual para validar tu identidad.
                    </p>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        placeholder="Ingresa tu contraseña actual"
                        className="w-full rounded-xl border border-amber-500/40 bg-zinc-900 py-2.5 pl-4 pr-10 text-sm text-white placeholder-zinc-600 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/10"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                        <span>Guardando cambios...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Guardar Cambios en la Cuenta</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Side summary: Practice Shortcuts & Progress */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-400" />
                    Módulos de Suscripción
                  </h3>
                  <button
                    type="button"
                    onClick={saveModuleSubscriptions}
                    disabled={modulesSaving}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {modulesSaving ? "Guardando..." : "Guardar"}
                  </button>
                </div>

                <div className="space-y-3">
                  {availableModules.length === 0 ? (
                    <p className="text-xs text-zinc-500">No hay módulos disponibles en este momento.</p>
                  ) : (
                    availableModules.map((module) => {
                      const selected = selectedModuleSlugs.includes(module.slug);
                      return (
                        <button
                          type="button"
                          key={module.slug}
                          onClick={() => toggleModule(module.slug)}
                          className={`w-full rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-emerald-500/40 bg-emerald-500/10"
                              : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-bold text-white">{module.name}</div>
                              <div className="mt-0.5 text-[11px] text-zinc-400">{module.description}</div>
                            </div>
                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                              selected
                                ? "border-emerald-500 bg-emerald-500 text-zinc-950"
                                : "border-zinc-700 bg-zinc-900 text-zinc-500"
                            }`}>
                              {selected ? "✓" : ""}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-md">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4 text-emerald-400" />
                  Progreso en Terminales
                </h3>

                <div className="space-y-4">
                  {/* SSH */}
                  <Link href="/ssh" className="block group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-green-400 flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5" /> SSH
                      </span>
                      <span className="text-zinc-400 font-mono">{sshStats.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${Math.max(sshStats.percentage, 4)}%` }} />
                    </div>
                  </Link>

                  {/* Docker */}
                  <Link href="/docker" className="block group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                        <Container className="h-3.5 w-3.5" /> Docker
                      </span>
                      <span className="text-zinc-400 font-mono">{dockerStats.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${Math.max(dockerStats.percentage, 4)}%` }} />
                    </div>
                  </Link>

                  {/* PostgreSQL */}
                  <Link href="/postgres" className="block group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5" /> PostgreSQL
                      </span>
                      <span className="text-zinc-400 font-mono">{postgresStats.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.max(postgresStats.percentage, 4)}%` }} />
                    </div>
                  </Link>

                  {/* TypeScript */}
                  <Link href="/typescript" className="block group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5" /> TypeScript
                      </span>
                      <span className="text-zinc-400 font-mono">{tsStats.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${Math.max(tsStats.percentage, 4)}%` }} />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Quick Practicing CTA */}
              <div className="rounded-2xl border border-blue-900/30 bg-blue-950/20 p-6">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                  <Code2 className="h-5 w-5" />
                  <span>¡Nuevo módulo disponible!</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  Practica tipos estáticos, interfaces, genéricos, utility types y compila código TypeScript en vivo.
                </p>
                <Link
                  href="/typescript"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 transition"
                >
                  <span>Ir a Práctica TypeScript</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
