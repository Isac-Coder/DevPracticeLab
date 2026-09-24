"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Server,
  Container,
  Database,
  Code2,
  Rocket,
  Calendar,
  Flame,
  Award,
  Zap,
  Search,
  Filter,
  Check,
  RotateCcw,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import {
  ALL_CHALLENGES,
  getCurrentCalendarWeek,
  type Challenge,
} from "@/lib/challengesData";
import { calculateAccountLevel } from "@/lib/accountLevel";

export default function ChallengesPage() {
  const { user } = useAuth();
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [lockedChallenges, setLockedChallenges] = useState<string[]>([]);
  const [activeHint, setActiveHint] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState<Record<string, boolean>>({});
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [attemptsByChallenge, setAttemptsByChallenge] = useState<Record<string, number>>({});
  const [evalResults, setEvalResults] = useState<Record<string, { ok: boolean; msg: string } | null>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "weekly" | "pending" | "completed">("weekly");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<number>(getCurrentCalendarWeek());

  const currentCalendarWeek = useMemo(() => getCurrentCalendarWeek(), []);
  const storageKey = user ? `devpracticelab_challenges_${user.email}` : "devpracticelab_challenges_guest";
  const lockedStorageKey = `${storageKey}_locked`;
  const PAGE_SIZE = 6;

  const getUnlockedWeekForModule = (moduleName: string) => {
    const targetModules = moduleName === "all" ? ["ssh", "docker", "postgres", "typescript", "nextjs"] : [moduleName];

    let unlockedWeek = 1;

    for (let week = 1; week <= 50; week++) {
      const weekCompleted = targetModules.every((module) => {
        const weekChallenges = ALL_CHALLENGES.filter((challenge) => challenge.module === module && challenge.week === week);
        return weekChallenges.length > 0 && weekChallenges.every((challenge) => completedList.includes(challenge.id));
      });

      if (weekCompleted) {
        unlockedWeek = week;
      } else {
        break;
      }
    }

    return unlockedWeek;
  };

  const maxUnlockedWeek = useMemo(() => getUnlockedWeekForModule(selectedModule), [completedList, selectedModule]);
  const pendingWeek = useMemo(() => Math.min(currentCalendarWeek, maxUnlockedWeek), [currentCalendarWeek, maxUnlockedWeek]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedList(JSON.parse(saved));
      } else {
        setCompletedList([]);
      }

      const savedLocked = localStorage.getItem(lockedStorageKey);
      if (savedLocked) {
        setLockedChallenges(JSON.parse(savedLocked));
      } else {
        setLockedChallenges([]);
      }
    } catch {
      setCompletedList([]);
      setLockedChallenges([]);
    }
  }, [storageKey, lockedStorageKey]);

  const markCompleted = (challengeId: string) => {
    if (completedList.includes(challengeId)) return;
    const next = [...completedList, challengeId];
    setCompletedList(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const lockChallenge = (challengeId: string) => {
    if (lockedChallenges.includes(challengeId)) return;
    const next = [...lockedChallenges, challengeId];
    setLockedChallenges(next);
    try {
      localStorage.setItem(lockedStorageKey, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const isChallengeActive = (challenge: Challenge) => {
    if (completedList.includes(challenge.id) || lockedChallenges.includes(challenge.id)) return false;
    return challenge.week === pendingWeek;
  };

  const handleTestAnswer = (challenge: Challenge) => {
    if (completedList.includes(challenge.id) || lockedChallenges.includes(challenge.id)) {
      setShowSolution((prev) => ({ ...prev, [challenge.id]: true }));
      return;
    }

    if (challenge.week !== pendingWeek) {
      setEvalResults((prev) => ({
        ...prev,
        [challenge.id]: {
          ok: false,
          msg: `Este reto pertenece a la semana ${challenge.week}. Debes completar la semana ${pendingWeek} antes de poder escribirlo.`,
        },
      }));
      return;
    }

    const input = (userInputs[challenge.id] || "").trim().toLowerCase();
    if (!input) {
      setEvalResults((prev) => ({
        ...prev,
        [challenge.id]: { ok: false, msg: "Por favor escribe tu comando o solución antes de validar." },
      }));
      return;
    }

    const matchesExpected = challenge.expectedKeywords.some((kw) =>
      input.includes(kw.toLowerCase())
    );
    const hasTagsMatch = challenge.tags.some((t) => input.includes(t.toLowerCase()));

    if (matchesExpected || (input.length > 6 && hasTagsMatch)) {
      setShowSolution((prev) => ({ ...prev, [challenge.id]: true }));
      setAttemptsByChallenge((prev) => ({ ...prev, [challenge.id]: 0 }));
      markCompleted(challenge.id);
      setEvalResults((prev) => ({
        ...prev,
        [challenge.id]: {
          ok: true,
          msg: `¡Reto completado con éxito! Has ganado +${challenge.xp} XP y subido tu puntuación de cuenta.`,
        },
      }));
      return;
    }

    const previousAttempts = attemptsByChallenge[challenge.id] ?? 0;
    const nextAttempts = previousAttempts + 1;
    setAttemptsByChallenge((prev) => ({ ...prev, [challenge.id]: nextAttempts }));

    if (nextAttempts >= 3) {
      setShowSolution((prev) => ({ ...prev, [challenge.id]: true }));
      lockChallenge(challenge.id);
      setEvalResults((prev) => ({
        ...prev,
        [challenge.id]: {
          ok: false,
          msg: `Has agotado tus 3 intentos fallidos. La solución ya está visible y este reto queda bloqueado hasta la próxima rotación.`,
        },
      }));
      return;
    }

    setEvalResults((prev) => ({
      ...prev,
      [challenge.id]: {
        ok: false,
        msg: `Respuesta incorrecta. Intento ${nextAttempts}/3. Te quedan ${3 - nextAttempts} oportunidades antes de revelar la solución.`,
      },
    }));
  };

  const totalXP = useMemo(() => {
    return completedList.reduce((acc, id) => {
      const ch = ALL_CHALLENGES.find((c) => c.id === id);
      return acc + (ch ? ch.xp : 0);
    }, 0);
  }, [completedList]);

  const accountLevel = useMemo(() => {
    return calculateAccountLevel(completedList.length, totalXP);
  }, [completedList.length, totalXP]);

  const filteredChallenges = useMemo(() => {
    return ALL_CHALLENGES.filter((ch) => {
      if (selectedModule !== "all" && ch.module !== selectedModule) return false;
      if (selectedDifficulty !== "all" && ch.difficulty !== selectedDifficulty) return false;

      const isCompleted = completedList.includes(ch.id);
      const isLocked = lockedChallenges.includes(ch.id);
      if (selectedFilter === "weekly" && ch.week !== selectedWeek) return false;
      if (selectedFilter === "pending" && (isCompleted || isLocked)) return false;
      if (selectedFilter === "completed" && !isCompleted) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ch.title.toLowerCase().includes(q);
        const matchObj = ch.objective.toLowerCase().includes(q);
        const matchTags = ch.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchObj && !matchTags) return false;
      }

      return true;
    });
  }, [selectedModule, selectedDifficulty, selectedFilter, selectedWeek, searchQuery, completedList, lockedChallenges]);

  const totalPages = Math.max(1, Math.ceil(filteredChallenges.length / PAGE_SIZE));
  const paginatedChallenges = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredChallenges.slice(start, start + PAGE_SIZE);
  }, [filteredChallenges, currentPage, totalPages]);

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return Array.from({ length: 5 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const targetWeek = Math.min(currentCalendarWeek, maxUnlockedWeek);
    setSelectedWeek((prev) => (prev > targetWeek ? targetWeek : prev));
  }, [currentCalendarWeek, maxUnlockedWeek]);

  useEffect(() => {
    if (selectedFilter === "weekly" && selectedWeek > maxUnlockedWeek) {
      setSelectedWeek(maxUnlockedWeek);
    }
  }, [selectedFilter, selectedWeek, maxUnlockedWeek]);

  const getModuleIcon = (mod: string) => {
    switch (mod) {
      case "ssh":
        return <Server className="h-4 w-4 text-green-400" />;
      case "docker":
        return <Container className="h-4 w-4 text-sky-400" />;
      case "postgres":
        return <Database className="h-4 w-4 text-indigo-400" />;
      case "typescript":
        return <Code2 className="h-4 w-4 text-blue-400" />;
      case "nextjs":
        return <Rocket className="h-4 w-4 text-sky-400" />;
      default:
        return <Target className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Fácil":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Intermedio":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Avanzado":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-zinc-800 text-zinc-300";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-1 pb-16">
        {/* Hero Section & Account Level Progression */}
        <section className="border-b border-zinc-800 bg-linear-to-br from-zinc-900 via-zinc-950 to-zinc-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <Trophy className="h-4 w-4" />
                  <span>{ALL_CHALLENGES.length} Retos Semanales (50 por Módulo)</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Desafíos & Niveles de Maestría
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Cada semana rota un nuevo set de retos para cada tecnología. Resuelve problemas reales de SSH, Docker, SQL, TypeScript y Next.js para acumular XP y desbloquear rangos de cuenta.
                </p>
              </div>

              {/* Account Level Card */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-md shadow-2xl min-w-[300px] sm:min-w-[340px]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{accountLevel.rankBadge}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nivel {accountLevel.level}</span>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 text-[10px] font-bold text-emerald-400">
                          {totalXP} XP
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white">{accountLevel.title}</h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">{completedList.length}/{ALL_CHALLENGES.length}</span>
                    <div className="text-[10px] text-zinc-500">Completados</div>
                  </div>
                </div>

                {/* Progress bar to next level */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-zinc-400">
                    <span>Progreso siguiente nivel</span>
                    <span>{accountLevel.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
                    <div
                      className="h-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${Math.max(accountLevel.progressPercent, 5)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 pt-1">{accountLevel.description}</p>
                </div>
              </div>
            </div>

            {/* Current Active Week Banner */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Retos de la Semana #{currentCalendarWeek} en curso
                    <span className="rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 border border-amber-500/30">
                      Activo ahora
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Se rota un reto por tecnología cada semana del año (1 a 50 semanas).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedWeek(currentCalendarWeek);
                    setSelectedFilter("weekly");
                  }}
                  className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 px-3.5 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Ver Semana #{currentCalendarWeek}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Search Bar */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter("weekly")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedFilter === "weekly"
                    ? "bg-amber-500 text-zinc-950 shadow-md"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                }`}
              >
                Semana #{selectedWeek}
              </button>

              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedFilter === "all"
                    ? "bg-white text-zinc-950 shadow-md"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                }`}
              >
                Todos los {ALL_CHALLENGES.length} Retos
              </button>

              <button
                onClick={() => setSelectedFilter("pending")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedFilter === "pending"
                    ? "bg-emerald-500 text-zinc-950 shadow-md"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                }`}
              >
                Pendientes ({ALL_CHALLENGES.length - completedList.length})
              </button>

              <button
                onClick={() => setSelectedFilter("completed")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedFilter === "completed"
                    ? "bg-emerald-500 text-zinc-950 shadow-md"
                    : "border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                }`}
              >
                Completados ({completedList.length})
              </button>
            </div>

            {/* Week Selector Dropdown & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {selectedFilter === "weekly" && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span>Semana:</span>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(Number(e.target.value))}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white focus:border-amber-500 focus:outline-none"
                  >
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Semana #{w} {w === currentCalendarWeek ? "(Actual)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Module Filter */}
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">Todos los Módulos</option>
                <option value="ssh">SSH (50)</option>
                <option value="docker">Docker (50)</option>
                <option value="postgres">PostgreSQL (50)</option>
                <option value="typescript">TypeScript (50)</option>
                <option value="nextjs">Next.js (50)</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">Todas las Dificultades</option>
                <option value="Fácil">Fácil</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por palabra clave, comando o etiqueta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Challenges List Grid */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <div className="mb-4 text-xs text-zinc-400">
            Mostrando <strong className="text-white">{filteredChallenges.length}</strong> retos encontrados
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {paginatedChallenges.map((ch) => {
              const isDone = completedList.includes(ch.id);
              const isBlocked = lockedChallenges.includes(ch.id);
              const isFinalized = isDone || isBlocked;
              const isWritable = isChallengeActive(ch);
              const attemptsUsed = attemptsByChallenge[ch.id] ?? 0;
              const canRevealSolution = isDone || isBlocked || attemptsUsed >= 3;
              const evalRes = evalResults[ch.id];
              const shouldShowSolution = Boolean((showSolution[ch.id] && attemptsUsed >= 3) || isDone || isBlocked);

              return (
                <div
                  key={ch.id}
                  className={`rounded-2xl border p-6 flex flex-col justify-between backdrop-blur-md transition-all ${
                    isDone
                      ? "border-emerald-500/40 bg-emerald-950/10 shadow-lg shadow-emerald-500/5"
                      : isBlocked
                      ? "border-red-500/30 bg-red-950/10 shadow-lg shadow-red-500/5"
                      : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                  }`}
                >
                  <div>
                    {/* Card Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-950 text-xs font-semibold text-white">
                          {getModuleIcon(ch.module)}
                          <span className="capitalize">{ch.module}</span>
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${getDifficultyBadge(ch.difficulty)}`}>
                          {ch.difficulty}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500">
                          Semana #{ch.week}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <Zap className="h-3 w-3" />
                          +{ch.xp} XP
                        </span>
                        {isDone && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Completado
                          </span>
                        )}
                        {!isDone && !isBlocked && isWritable && (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Sparkles className="h-3.5 w-3.5" />
                            Disponible
                          </span>
                        )}
                        {!isDone && !isWritable && !isBlocked && (
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Calendar className="h-3.5 w-3.5" />
                            Pendiente
                          </span>
                        )}
                        {isBlocked && !isDone && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Bloqueado
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{ch.title}</h3>
                    <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                      {ch.objective}
                    </p>

                    {/* Hints dropdown */}
                    <div className="mb-4">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveHint((prev) => ({
                            ...prev,
                            [ch.id]: !prev[ch.id],
                          }))
                        }
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-400 transition cursor-pointer"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>{activeHint[ch.id] ? "Ocultar pistas" : "Ver pistas del reto"}</span>
                      </button>

                      {activeHint[ch.id] && (
                        <div className="mt-2.5 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs text-zinc-400 space-y-1">
                          {ch.hints.map((hint, idx) => (
                            <p key={idx}>• {hint}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submission and Validation Input */}
                  <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={
                          isFinalized
                            ? "Este reto ya no acepta más intentos"
                            : !isWritable
                            ? `Disponible solo en la semana ${pendingWeek}`
                            : "Escribe tu comando o solución aquí..."
                        }
                        value={userInputs[ch.id] || ""}
                        disabled={isFinalized || !isWritable}
                        onChange={(e) =>
                          setUserInputs((prev) => ({
                            ...prev,
                            [ch.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (isWritable && !isFinalized && e.key === "Enter") handleTestAnswer(ch);
                        }}
                        className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <button
                        onClick={() => isWritable && !isFinalized && handleTestAnswer(ch)}
                        disabled={isFinalized || !isWritable}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 text-xs font-bold transition shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Validar
                      </button>
                    </div>

                    {/* Validation message */}
                    {evalRes && (
                      <div
                        className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${
                          evalRes.ok
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border border-red-500/30 text-red-400"
                        }`}
                      >
                        {evalRes.ok ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <p>{evalRes.msg}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      <Link
                        href={`/${ch.module}`}
                        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition"
                      >
                        <span>Abrir en Terminal {ch.module}</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          if (!canRevealSolution) return;
                          setShowSolution((prev) => ({
                            ...prev,
                            [ch.id]: !prev[ch.id],
                          }));
                        }}
                        disabled={!canRevealSolution}
                        className="text-[11px] transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 text-zinc-500 hover:text-zinc-300"
                      >
                        {showSolution[ch.id] ? "Ocultar Solución" : canRevealSolution ? "¿Ver Solución?" : "Solución disponible al completar o tras 3 fallos"}
                      </button>
                    </div>

                    {shouldShowSolution && (
                      <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap">
                        {ch.solution}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                {visiblePageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded-lg border transition ${
                      currentPage === page
                        ? "border-emerald-500 bg-emerald-500 text-zinc-950 font-bold"
                        : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-bold text-zinc-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
