"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Clock3, Medal, RefreshCw, Target, Trophy, Zap, Award, Languages, Sparkles, BookOpen } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { usePlatformMode } from "@/lib/PlatformModeContext";
import { TOP_NOTCH_LEVELS } from "@/lib/topNotchData";
import { TOP_NOTCH_CHALLENGES } from "@/lib/englishChallengesData";

interface LeaderboardEntry {
  rank: number;
  username: string;
  completedChallenges: number;
  points: number;
  averageTimeMs: number | null;
}

interface EnglishLeaderboardEntry {
  rank: number;
  username: string;
  levelBadge: string;
  cefr: string;
  completedChallenges: number;
  points: number;
  accuracy: string;
}

const formatAverageTime = (elapsedMs: number | null) => {
  if (elapsedMs === null) return "Sin datos";

  const totalSeconds = Math.round(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${seconds} s`;
  return `${seconds} s`;
};

export default function RankingPage() {
  const { user } = useAuth();
  const { isEnglish } = usePlatformMode();
  const [entries, setEntries] = useState<(LeaderboardEntry | EnglishLeaderboardEntry)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userEnglishXp, setUserEnglishXp] = useState(0);

  useEffect(() => {
    // Recalcular XP local si es necesario o cargar de BD si es posible
    // Por ahora, lógica simplificada basada en puntos de las entradas
    if (isEnglish) {
       const userEntry = entries.find(e => e.username.includes("Tú"));
       if (userEntry && 'points' in userEntry) setUserEnglishXp(userEntry.points);
    }
  }, [entries, isEnglish]);

  const fetchLeaderboard = useCallback(async (mode: 'dev' | 'english'): Promise<(LeaderboardEntry | EnglishLeaderboardEntry)[]> => {
    const response = await fetch(`/api/challenges/leaderboard?mode=${mode}`);
    const data: { error?: string; leaderboard?: (LeaderboardEntry | EnglishLeaderboardEntry)[] } = await response.json();
    if (!response.ok || !Array.isArray(data.leaderboard)) {
      throw new Error(data.error || "No se pudo cargar el ranking.");
    }
    return data.leaderboard;
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      const mode = isEnglish ? 'english' : 'dev';
      setEntries(await fetchLeaderboard(mode));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el ranking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [isEnglish]);


  if (isEnglish) {
    // Determine user level badge
    let currentBadge = "Fundamentals Starter";
    let currentCefr = "A1";
    if (userEnglishXp >= 1500) {
      currentBadge = "Summit Master";
      currentCefr = "C1";
    } else if (userEnglishXp >= 1000) {
      currentBadge = "Summit Communicator";
      currentCefr = "B2+";
    } else if (userEnglishXp >= 700) {
      currentBadge = "Top Notch Fluent";
      currentCefr = "B1+";
    } else if (userEnglishXp >= 400) {
      currentBadge = "Top Notch Explorer";
      currentCefr = "A2+";
    } else if (userEnglishXp >= 200) {
      currentBadge = "Top Notch Builder";
      currentCefr = "A2";
    }

    const currentUserName = user?.username || (user?.email ? user.email.split("@")[0] : "Estudiante");

    const englishEntries = entries as EnglishLeaderboardEntry[];

    return (
      <div className="flex min-h-screen flex-col bg-[#030814] text-slate-100 transition-colors duration-300">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 space-y-10">
          {/* Hero Banner */}
          <section className="rounded-3xl border border-sky-400/30 bg-linear-to-br from-[#07152b] via-[#0d2244] to-[#030814] p-6 sm:p-9 shadow-xl shadow-sky-500/5">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                  <Languages className="h-4 w-4" />
                  <span>Top Notch & Summit Global English League</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Ranking de Inglés Comunicativo
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
                  Clasificación de estudiantes según su puntuación XP obtenida al resolver retos gramaticales, ordenar oraciones, corregir estructuras y dominar los 6 libros de la serie Top Notch.
                </p>
              </div>

              {/* User summary card */}
              <div className="flex items-center gap-4 rounded-2xl border border-sky-400/30 bg-blue-950/70 p-5 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-300">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Tu Rango Actual</p>
                  <p className="text-base font-bold text-white flex items-center gap-2">
                    <span>{userEnglishXp >= 2800 ? "Summit 2 Master" : userEnglishXp >= 1800 ? "Summit 1 Advanced" : userEnglishXp >= 1100 ? "Top Notch 3 Fluent" : userEnglishXp >= 650 ? "Top Notch 2 Intermediate" : userEnglishXp >= 300 ? "Top Notch 1 Speaker" : "Fundamentals Explorer"}</span>
                  </p>
                  <p className="text-xs text-sky-400 font-bold mt-0.5">{userEnglishXp} XP Acumulados</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* ... */}
          
          {/* English Leaderboard Table */}
          <section className="overflow-hidden rounded-3xl border border-blue-900/60 bg-[#07152b]/80 shadow-xl">
            <div className="flex items-center justify-between border-b border-blue-900/60 px-6 py-4 bg-blue-950/40">
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-sky-400" />
                <h2 className="font-bold text-white">Tabla de Posiciones — Top Estudiantes de Inglés</h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Actualizado en tiempo real</span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-10 text-center text-slate-400">Cargando ranking...</div>
              ) : error ? (
                <div className="p-10 text-center text-red-400">{error}</div>
              ) : (
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-blue-950/60 text-xs uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Posición</th>
                    <th className="px-6 py-4">Estudiante</th>
                    <th className="px-6 py-4">Rango</th>
                    <th className="px-6 py-4">Nivel MCER</th>
                    <th className="px-6 py-4">Retos</th>
                    <th className="px-6 py-4">Puntos</th>
                    <th className="px-6 py-4">Precisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-900/40">
                  {englishEntries.map((entry) => {
                    const isCurrentUser = entry.username.includes(currentUserName);
                    return (
                      <tr
                        key={entry.rank}
                        className={`transition ${
                          isCurrentUser
                            ? "bg-sky-500/15 font-semibold"
                            : "hover:bg-blue-900/20"
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-white">#{entry.rank}</td>
                        <td className="px-6 py-4 font-bold text-white">{entry.username}</td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-300">{entry.levelBadge}</td>
                        <td className="px-6 py-4 text-xs font-bold text-sky-300">{entry.cefr}</td>
                        <td className="px-6 py-4 text-slate-300">{entry.completedChallenges}</td>
                        <td className="px-6 py-4 font-bold text-sky-300">{entry.points} XP</td>
                        <td className="px-6 py-4 text-emerald-400 font-semibold">{entry.accuracy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <section className="mb-8 rounded-3xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 via-zinc-900 to-zinc-950 p-6 sm:p-9">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                <Trophy className="h-4 w-4" />
                Comunidad DevPracticeLab
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ranking de retos
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
                Clasificación por puntos obtenidos al resolver retos. El tiempo promedio considera los retos completados con temporizador registrado.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                void loadLeaderboard();
              }}
              disabled={loading}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-amber-400/50 hover:text-white disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </section>

        {error && (
          <div role="alert" className="mb-5 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
            <Medal className="h-5 w-5 text-amber-300" />
            <h2 className="font-bold text-white">Mejores participantes</h2>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-zinc-400">Cargando ranking…</div>
          ) : error ? (
            <div className="p-10 text-center text-sm text-zinc-500">
              El ranking volverá a mostrarse cuando se recupere la conexión con la base de datos.
            </div>
          ) : entries.length === 0 ? (
            <div className="p-10 text-center">
              <Trophy className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
              <p className="font-semibold text-zinc-200">Aún no hay retos completados</p>
              <p className="mt-1 text-sm text-zinc-500">Completa un reto para aparecer en el ranking.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="bg-zinc-950/60 text-xs uppercase tracking-wider text-zinc-500">
                    <th scope="col" className="px-5 py-4 font-semibold">Ranking</th>
                    <th scope="col" className="px-5 py-4 font-semibold">Nombre</th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      <span className="inline-flex items-center gap-2"><Target className="h-3.5 w-3.5" />Retos</span>
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      <span className="inline-flex items-center gap-2"><Zap className="h-3.5 w-3.5" />Puntos</span>
                    </th>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      <span className="inline-flex items-center gap-2"><Clock3 className="h-3.5 w-3.5" />Tiempo promedio</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {(entries as LeaderboardEntry[]).map((entry) => (
                    <tr key={`${entry.rank}-${entry.username}`} className="transition hover:bg-zinc-800/30">
                      <td className="px-5 py-4">
                        <span className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 font-black ${
                          entry.rank === 1
                            ? "bg-amber-400/15 text-amber-300"
                            : entry.rank === 2
                              ? "bg-zinc-300/10 text-zinc-200"
                              : entry.rank === 3
                                ? "bg-orange-500/10 text-orange-300"
                                : "bg-zinc-800 text-zinc-400"
                        }`}>
                          #{entry.rank}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-white">{entry.username}</td>
                      <td className="px-5 py-4 text-zinc-300">{entry.completedChallenges}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-amber-300">{entry.points.toLocaleString("es-MX")} XP</span>
                      </td>
                      <td className="px-5 py-4 text-zinc-300">{formatAverageTime(entry.averageTimeMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
