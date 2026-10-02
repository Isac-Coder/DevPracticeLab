"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Clock3, Medal, RefreshCw, Target, Trophy, Zap } from "lucide-react";
import Navbar from "@/app/components/Navbar";

interface LeaderboardEntry {
  rank: number;
  username: string;
  completedChallenges: number;
  points: number;
  averageTimeMs: number | null;
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
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = useCallback(async (): Promise<LeaderboardEntry[]> => {
    const response = await fetch("/api/challenges/leaderboard");
    const data: { error?: string; leaderboard?: LeaderboardEntry[] } = await response.json();
    if (!response.ok || !Array.isArray(data.leaderboard)) {
      throw new Error(data.error || "No se pudo cargar el ranking.");
    }
    return data.leaderboard;
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError("");
    try {
      setEntries(await fetchLeaderboard());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el ranking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    void fetchLeaderboard()
      .then((leaderboard) => {
        if (!cancelled) {
          setEntries(leaderboard);
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el ranking.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchLeaderboard]);

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
                  {entries.map((entry) => (
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
