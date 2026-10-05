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
  Calendar,
  Zap,
  Search,
  ArrowLeft,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import {
  ALL_CHALLENGES,
  calculateSpeedBonusXp,
  type ChallengeStatus,
  getCurrentCalendarWeek,
  type Challenge,
} from "@/lib/challengesData";
import { calculateAccountLevel } from "@/lib/accountLevel";
import { useChallengeMode } from "@/lib/ChallengeModeContext";
import { usePlatformMode } from "@/lib/PlatformModeContext";
import {
  TOP_NOTCH_CHALLENGES,
  type EnglishChallenge,
  type EnglishChallengeType,
} from "@/lib/englishChallengesData";
import { TOP_NOTCH_LEVELS } from "@/lib/topNotchData";
import { BookOpen, Languages, Check, X, RotateCcw } from "lucide-react";

interface ChallengeTimerRecord {
  elapsedMs: number;
  startedAt: number | null;
  finished: boolean;
}

const formatElapsedTime = (elapsedMs: number) => {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export default function ChallengesPage() {
  const { user, loading: authLoading } = useAuth();
  const { isEnglish } = usePlatformMode();
  const { setChallengeActive, setPracticeContext } = useChallengeMode();
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [challengeStatuses, setChallengeStatuses] = useState<Record<string, ChallengeStatus>>({});
  const [bonusXpByChallenge, setBonusXpByChallenge] = useState<Record<string, number>>({});
  const [timerRecords, setTimerRecords] = useState<Record<string, ChallengeTimerRecord>>({});
  const [timerNow, setTimerNow] = useState(Date.now());
  const [completionsLoading, setCompletionsLoading] = useState(true);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
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

  // English Mode Challenges State
  const [selectedEnglishLevel, setSelectedEnglishLevel] = useState<string>("all");
  const [selectedEnglishType, setSelectedEnglishType] = useState<string>("all");
  const [selectedEnglishFilter, setSelectedEnglishFilter] = useState<"all" | "pending" | "completed">("all");
  const [englishSearchQuery, setEnglishSearchQuery] = useState("");
  const [selectedEnglishChallengeId, setSelectedEnglishChallengeId] = useState<string | null>(null);
  const [completedEnglishChallenges, setCompletedEnglishChallenges] = useState<string[]>([]);
  const [englishUserInputs, setEnglishUserInputs] = useState<Record<string, string>>({});
  const [englishReorderWords, setEnglishReorderWords] = useState<Record<string, string[]>>({});
  const [englishEvalResults, setEnglishEvalResults] = useState<Record<string, { ok: boolean; msg: string; explanation?: string } | null>>({});
  const [englishActiveHints, setEnglishActiveHints] = useState<Record<string, boolean>>({});
  const [currentEnglishPage, setCurrentEnglishPage] = useState(1);
  const ENGLISH_PAGE_SIZE = 4;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`topnotch_challenges_completed_${user?.email ?? "guest"}`);
      if (saved) {
        setCompletedEnglishChallenges(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [user?.email]);

  const toggleCompleteEnglishChallenge = (chId: string, earnedXp: number) => {
    let updated: string[];
    if (completedEnglishChallenges.includes(chId)) {
      updated = completedEnglishChallenges.filter((id) => id !== chId);
    } else {
      updated = [...completedEnglishChallenges, chId];
      // Also update total English XP in localStorage
      try {
        const xpKey = `topnotch_user_xp_${user?.email ?? "guest"}`;
        const currentXp = Number(localStorage.getItem(xpKey) || "0");
        localStorage.setItem(xpKey, String(currentXp + earnedXp));
      } catch {
        // Ignore
      }
    }
    setCompletedEnglishChallenges(updated);
    try {
      localStorage.setItem(`topnotch_challenges_completed_${user?.email ?? "guest"}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleEvaluateEnglishChallenge = (ch: EnglishChallenge) => {
    let isCorrect = false;

    if (ch.type === "sentence_reorder") {
      const currentWords = englishReorderWords[ch.id] || [];
      const userSentence = currentWords.join(" ").trim().toLowerCase();
      const targetSentence = (ch.correctAnswer || "").trim().toLowerCase();
      isCorrect = userSentence === targetSentence;
    } else {
      const rawInput = (englishUserInputs[ch.id] || "").trim().toLowerCase();
      const primaryTarget = (ch.correctAnswer || "").trim().toLowerCase();
      const acceptable = (ch.acceptableAnswers || ch.correctAnswers || []).map((a) => a.trim().toLowerCase());
      isCorrect = rawInput === primaryTarget || acceptable.includes(rawInput);
    }

    const earnedXp = ch.xp ?? ch.points ?? 50;

    setEnglishEvalResults((prev) => ({
      ...prev,
      [ch.id]: {
        ok: isCorrect,
        msg: isCorrect
          ? `¡Excelente! Respuesta correcta (+${earnedXp} XP)`
          : "Respuesta incorrecta. Revisa las reglas o la pista e inténtalo de nuevo.",
        explanation: ch.explanation || ch.grammarExplanation,
      },
    }));

    if (isCorrect && !completedEnglishChallenges.includes(ch.id)) {
      toggleCompleteEnglishChallenge(ch.id, earnedXp);
    }
  };

  const currentCalendarWeek = useMemo(() => getCurrentCalendarWeek(), []);
  const userEmail = user?.email;
  const storageKey = userEmail ? `devpracticelab_challenges_${userEmail}` : "devpracticelab_challenges_guest";
  const statusStorageKey = `${storageKey}_statuses`;
  const bonusXpStorageKey = `${storageKey}_bonus_xp`;
  const timerStorageKey = `${storageKey}_timers`;
  const lockedStorageKey = `${storageKey}_locked`;
  const PAGE_SIZE = 4;

  useEffect(() => {
    setChallengeActive(selectedChallengeId !== null);
    const activeChallenge = ALL_CHALLENGES.find((challenge) => challenge.id === selectedChallengeId);
    setPracticeContext(activeChallenge
      ? { type: "challenge", module: activeChallenge.module, title: activeChallenge.title }
      : null);
  }, [selectedChallengeId, setChallengeActive, setPracticeContext]);

  useEffect(() => () => {
    setChallengeActive(false);
    setPracticeContext(null);
  }, [setChallengeActive, setPracticeContext]);

  useEffect(() => {
    if (!selectedChallengeId) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChallengeActive(false);
        setSelectedChallengeId(null);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedChallengeId]);

  useEffect(() => {
    if (authLoading) return;
    try {
      const savedTimers = localStorage.getItem(timerStorageKey);
      const parsedTimers: unknown = savedTimers ? JSON.parse(savedTimers) : {};
      if (typeof parsedTimers === "object" && parsedTimers !== null) {
        const restoredTimers: Record<string, ChallengeTimerRecord> = {};
        for (const [challengeId, timer] of Object.entries(parsedTimers)) {
          if (
            ALL_CHALLENGES.some((challenge) => challenge.id === challengeId) &&
            typeof timer === "object" &&
            timer !== null &&
            "elapsedMs" in timer &&
            typeof timer.elapsedMs === "number" &&
            "finished" in timer &&
            typeof timer.finished === "boolean"
          ) {
            restoredTimers[challengeId] = {
              elapsedMs: Math.max(0, timer.elapsedMs),
              startedAt: null,
              finished: timer.finished,
            };
          }
        }
        setTimerRecords(restoredTimers);
      }
    } catch (error) {
      console.error("No se pudieron cargar los temporizadores de retos:", error);
    }
  }, [authLoading, timerStorageKey]);

  useEffect(() => {
    if (!selectedChallengeId) return;

    const challengeId = selectedChallengeId;
    const startedAt = Date.now();
    setTimerRecords((previous) => {
      const current = previous[challengeId] ?? { elapsedMs: 0, startedAt: null, finished: false };
      if (current.finished) return previous;
      const next = { ...previous, [challengeId]: { ...current, startedAt } };
      try {
        localStorage.setItem(
          timerStorageKey,
          JSON.stringify({
            ...next,
            [challengeId]: { ...next[challengeId], startedAt: null },
          }),
        );
      } catch (error) {
        console.error("No se pudo guardar el temporizador del reto:", error);
      }
      return next;
    });

    const interval = window.setInterval(() => {
      const now = Date.now();
      setTimerNow(now);
      setTimerRecords((current) => {
        const timer = current[challengeId];
        if (!timer || timer.finished || timer.startedAt === null) return current;
        try {
          localStorage.setItem(
            timerStorageKey,
            JSON.stringify({
              ...current,
              [challengeId]: {
                ...timer,
                elapsedMs: timer.elapsedMs + now - timer.startedAt,
                startedAt: null,
              },
            }),
          );
        } catch (error) {
          console.error("No se pudo persistir el tiempo del reto:", error);
        }
        return current;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
      setTimerRecords((previous) => {
        const current = previous[challengeId];
        if (!current || current.startedAt === null || current.finished) return previous;
        const next = {
          ...previous,
          [challengeId]: {
            ...current,
            elapsedMs: current.elapsedMs + Date.now() - current.startedAt,
            startedAt: null,
          },
        };
        try {
          localStorage.setItem(timerStorageKey, JSON.stringify(next));
        } catch (error) {
          console.error("No se pudo pausar el temporizador del reto:", error);
        }
        return next;
      });
    };
  }, [selectedChallengeId, timerStorageKey]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    const loadCompletions = async () => {
      setCompletionsLoading(true);
      setCompletionError(null);
      let localCompleted: string[] = [];
      let localStatuses: Record<string, ChallengeStatus> = {};
      let localBonusXp: Record<string, number> = {};
      try {
        const saved = localStorage.getItem(storageKey);
        const parsed: unknown = saved ? JSON.parse(saved) : [];
        if (Array.isArray(parsed)) {
          localCompleted = parsed.filter(
            (id): id is string =>
              typeof id === "string" && ALL_CHALLENGES.some((challenge) => challenge.id === id),
          );
        }
        const savedStatuses = localStorage.getItem(statusStorageKey);
        const parsedStatuses: unknown = savedStatuses ? JSON.parse(savedStatuses) : {};
        if (typeof parsedStatuses === "object" && parsedStatuses !== null) {
          for (const [challengeId, status] of Object.entries(parsedStatuses)) {
            if (
              ALL_CHALLENGES.some((challenge) => challenge.id === challengeId) &&
              (status === "resuelto" || status === "erroneo" || status === "faltante")
            ) {
              localStatuses[challengeId] = status;
            }
          }
        }
        for (const challengeId of localCompleted) localStatuses[challengeId] = "resuelto";
        const savedBonusXp = localStorage.getItem(bonusXpStorageKey);
        const parsedBonusXp: unknown = savedBonusXp ? JSON.parse(savedBonusXp) : {};
        if (typeof parsedBonusXp === "object" && parsedBonusXp !== null) {
          for (const [challengeId, bonus] of Object.entries(parsedBonusXp)) {
            if (
              ALL_CHALLENGES.some((challenge) => challenge.id === challengeId) &&
              typeof bonus === "number" &&
              Number.isFinite(bonus) &&
              bonus >= 0
            ) {
              localBonusXp[challengeId] = bonus;
            }
          }
        }

        if (userEmail) {
          const response = await fetch("/api/challenges/completions");
          const data = await response.json();
          if (
            !response.ok ||
            typeof data.statuses !== "object" ||
            data.statuses === null ||
            typeof data.bonusXP !== "object" ||
            data.bonusXP === null
          ) {
            throw new Error(data.error || "No se pudo cargar el progreso de retos.");
          }

          const persistedStatuses = data.statuses as Record<string, ChallengeStatus>;
          const persistedBonusXp = data.bonusXP as Record<string, number>;
          const missingIds = localCompleted.filter((id) => persistedStatuses[id] !== "resuelto");
          if (missingIds.length > 0) {
            const migrationResponse = await fetch("/api/challenges/completions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ challengeIds: missingIds }),
            });
            const migrationData = await migrationResponse.json();
            if (
              !migrationResponse.ok ||
              typeof migrationData.statuses !== "object" ||
              migrationData.statuses === null ||
              typeof migrationData.bonusXP !== "object" ||
              migrationData.bonusXP === null
            ) {
              throw new Error(migrationData.error || "No se pudo migrar el progreso de retos.");
            }
            Object.assign(persistedStatuses, migrationData.statuses);
            Object.assign(persistedBonusXp, migrationData.bonusXP);
          }
          for (const challengeId of localCompleted) persistedStatuses[challengeId] = "resuelto";
          localStatuses = { ...localStatuses, ...persistedStatuses };
          localBonusXp = { ...localBonusXp, ...persistedBonusXp };
        }

        if (!cancelled) {
          for (const challenge of ALL_CHALLENGES) {
            localStatuses[challenge.id] ??= "faltante";
          }
          localCompleted = ALL_CHALLENGES
            .filter((challenge) => localStatuses[challenge.id] === "resuelto")
            .map((challenge) => challenge.id);
          setCompletedList(localCompleted);
          setChallengeStatuses(localStatuses);
          setBonusXpByChallenge(localBonusXp);
          localStorage.setItem(storageKey, JSON.stringify(localCompleted));
          localStorage.setItem(statusStorageKey, JSON.stringify(localStatuses));
          localStorage.setItem(bonusXpStorageKey, JSON.stringify(localBonusXp));
        }
      } catch (error) {
        console.error("Error al cargar progreso de retos:", error);
        if (!cancelled) {
          for (const challenge of ALL_CHALLENGES) {
            localStatuses[challenge.id] ??= "faltante";
          }
          localCompleted = ALL_CHALLENGES
            .filter((challenge) => localStatuses[challenge.id] === "resuelto")
            .map((challenge) => challenge.id);
          setCompletedList(localCompleted);
          setChallengeStatuses(localStatuses);
          setBonusXpByChallenge(localBonusXp);
          setCompletionError(error instanceof Error ? error.message : "No se pudo cargar el progreso de retos.");
        }
      } finally {
        if (!cancelled) setCompletionsLoading(false);
      }
    };

    loadCompletions();
    return () => {
      cancelled = true;
    };
  }, [authLoading, storageKey, statusStorageKey, bonusXpStorageKey, userEmail]);

  const getUnlockedWeekForModule = (moduleName: string) => {
    const targetModules = moduleName === "all" ? ["ssh", "docker", "postgres", "typescript"] : [moduleName];

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
    if (authLoading) return;
    try {
      const savedLocked = localStorage.getItem(lockedStorageKey);
      if (savedLocked) {
        setLockedChallenges(JSON.parse(savedLocked));
      } else {
        setLockedChallenges([]);
      }
    } catch {
      setLockedChallenges([]);
    }
  }, [authLoading, storageKey, lockedStorageKey]);

  const saveChallengeStatus = async (
    challengeId: string,
    status: ChallengeStatus,
    elapsedMs = 0,
    baseXp = 0,
    answer = "",
  ) => {
    let earnedBonus = status === "resuelto" ? calculateSpeedBonusXp(baseXp, elapsedMs) : 0;
    if (userEmail) {
      try {
        const response = await fetch("/api/challenges/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId, status, elapsedMs, answer }),
        });
        const data = await response.json();
        if (
          !response.ok ||
          !data.success ||
          typeof data.bonusXP?.[challengeId] !== "number"
        ) {
          throw new Error(data.error || "No se pudo guardar el estado del reto.");
        }
        earnedBonus = data.bonusXP[challengeId];
      } catch (error) {
        console.error("Error al guardar el estado del reto:", error);
        setCompletionError(error instanceof Error ? error.message : "No se pudo guardar el estado del reto.");
        return false;
      }
    }

    const nextStatuses = { ...challengeStatuses, [challengeId]: status };
    const nextBonusXp = { ...bonusXpByChallenge, [challengeId]: earnedBonus };
    const nextCompleted = ALL_CHALLENGES
      .filter((challenge) => nextStatuses[challenge.id] === "resuelto")
      .map((challenge) => challenge.id);
    setChallengeStatuses(nextStatuses);
    setBonusXpByChallenge(nextBonusXp);
    setCompletedList(nextCompleted);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextCompleted));
      localStorage.setItem(statusStorageKey, JSON.stringify(nextStatuses));
      localStorage.setItem(bonusXpStorageKey, JSON.stringify(nextBonusXp));
    } catch (e) {
      console.error("No se pudo actualizar la copia local del estado de retos:", e);
    }
    if (status === "resuelto") {
      setTimerRecords((previous) => {
        const current = previous[challengeId] ?? { elapsedMs, startedAt: null, finished: true };
        const finishedTimer = {
          ...current,
          elapsedMs,
          startedAt: null,
          finished: true,
        };
        const next = { ...previous, [challengeId]: finishedTimer };
        try {
          localStorage.setItem(timerStorageKey, JSON.stringify(next));
        } catch (error) {
          console.error("No se pudo guardar el tiempo final del reto:", error);
        }
        return next;
      });
    }
    setCompletionError(null);
    return true;
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
    if (
      completionsLoading ||
      authLoading ||
      completedList.includes(challenge.id) ||
      lockedChallenges.includes(challenge.id)
    ) return false;
    return challenge.week === pendingWeek;
  };

  const handleTestAnswer = async (challenge: Challenge) => {
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
      const timer = timerRecords[challenge.id];
      const elapsedMs = timer
        ? timer.elapsedMs + (timer.startedAt === null ? 0 : Date.now() - timer.startedAt)
        : 0;
      const earnedSpeedBonus = calculateSpeedBonusXp(challenge.xp, elapsedMs);
      const saved = await saveChallengeStatus(
        challenge.id,
        "resuelto",
        elapsedMs,
        challenge.xp,
        input,
      );
      if (!saved) {
        setEvalResults((prev) => ({
          ...prev,
          [challenge.id]: {
            ok: false,
            msg: "No se pudo guardar tu progreso. Revisa el aviso de estado y vuelve a intentarlo.",
          },
        }));
        return;
      }
      setShowSolution((prev) => ({ ...prev, [challenge.id]: true }));
      setAttemptsByChallenge((prev) => ({ ...prev, [challenge.id]: 0 }));
      setEvalResults((prev) => ({
        ...prev,
        [challenge.id]: {
          ok: true,
          msg: `¡Reto completado con éxito! Has ganado +${challenge.xp + earnedSpeedBonus} XP, incluyendo +${earnedSpeedBonus} XP por velocidad.`,
        },
      }));
      return;
    }

    const previousAttempts = attemptsByChallenge[challenge.id] ?? 0;
    const nextAttempts = previousAttempts + 1;
    setAttemptsByChallenge((prev) => ({ ...prev, [challenge.id]: nextAttempts }));
    const savedErrorStatus = await saveChallengeStatus(challenge.id, "erroneo");
    if (!savedErrorStatus) {
      setEvalResults((prev) => ({
        ...prev,
        [challenge.id]: {
          ok: false,
          msg: "Respuesta incorrecta. No se pudo guardar el estado; revisa el aviso e inténtalo de nuevo.",
        },
      }));
      return;
    }

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
      return acc + (ch ? ch.xp + (bonusXpByChallenge[id] ?? 0) : 0);
    }, 0);
  }, [completedList, bonusXpByChallenge]);

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

  const filteredEnglishChallenges = useMemo(() => {
    return TOP_NOTCH_CHALLENGES.filter((ch) => {
      if (selectedEnglishLevel !== "all" && ch.levelId !== selectedEnglishLevel) return false;
      if (selectedEnglishType !== "all" && ch.type !== selectedEnglishType) return false;
      if (selectedEnglishFilter === "pending" && completedEnglishChallenges.includes(ch.id)) return false;
      if (selectedEnglishFilter === "completed" && !completedEnglishChallenges.includes(ch.id)) return false;

      if (englishSearchQuery.trim()) {
        const q = englishSearchQuery.toLowerCase();
        const matchesTitle = ch.title.toLowerCase().includes(q);
        const matchesPrompt = ch.prompt.toLowerCase().includes(q);
        const matchesGrammar = (ch.grammarPoint || ch.category || "").toLowerCase().includes(q);
        const matchesKeywords = (ch.keywords || []).some((k) => k.toLowerCase().includes(q));
        if (!matchesTitle && !matchesPrompt && !matchesGrammar && !matchesKeywords) return false;
      }
      return true;
    });
  }, [selectedEnglishLevel, selectedEnglishType, selectedEnglishFilter, englishSearchQuery, completedEnglishChallenges]);

  if (isEnglish) {
    const totalEnglishXp = completedEnglishChallenges.reduce((sum, chId) => {
      const ch = TOP_NOTCH_CHALLENGES.find((c) => c.id === chId);
      return sum + (ch?.xp ?? 0);
    }, 0);

    const totalEnglishPages = Math.max(1, Math.ceil(filteredEnglishChallenges.length / ENGLISH_PAGE_SIZE));
    const safeEnglishPage = Math.min(currentEnglishPage, totalEnglishPages);
    const paginatedEnglishChallenges = filteredEnglishChallenges.slice(
      (safeEnglishPage - 1) * ENGLISH_PAGE_SIZE,
      safeEnglishPage * ENGLISH_PAGE_SIZE,
    );

    const visibleEnglishPageNumbers = Array.from({ length: totalEnglishPages }, (_, i) => i + 1).filter(
      (page) => {
        if (totalEnglishPages <= 7) return true;
        const start = Math.max(1, Math.min(safeEnglishPage - 2, totalEnglishPages - 4));
        const end = Math.min(totalEnglishPages, start + 4);
        return page >= start && page <= end;
      }
    );

    return (
      <div className="flex min-h-screen flex-col bg-[#030814] text-slate-100 transition-colors duration-300">
        <Navbar />

        <main className="flex-1 pb-16">
          {/* Hero Section */}
          <section className="border-b border-blue-900/50 bg-gradient-to-b from-[#07152b] to-[#030814]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                    <Trophy className="h-4 w-4" />
                    <span>Top Notch English Challenges (A1 — C1)</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    Retos Dinámicos de Gramática y Comunicación
                  </h1>
                  <p className="text-sm leading-relaxed text-slate-300">
                    Pon a prueba tu dominio de la gramática y el vocabulario según los libros de Top Notch & Summit. Completa ejercicios interactivos de orden de palabras, corrección de errores, transformación de tiempos y respuestas situacionales.
                  </p>
                </div>

                {/* Progress / XP Stats Card */}
                <div className="rounded-2xl border border-sky-400/30 bg-blue-950/60 p-6 shadow-xl shadow-sky-500/5 min-w-[280px]">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tu Rendimiento en Inglés</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">{totalEnglishXp}</span>
                    <span className="text-xs font-bold text-sky-400">XP Acumulados</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-blue-900/60">
                    <span>Retos resueltos:</span>
                    <span className="font-bold text-emerald-400">
                      {completedEnglishChallenges.length} / {TOP_NOTCH_CHALLENGES.length}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/ranking"
                      className="block text-center rounded-xl bg-sky-400 hover:bg-sky-300 text-zinc-950 py-2 text-xs font-bold transition shadow"
                    >
                      Ver Ranking de Inglés
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Filters Bar */}
          <div className="border-b border-blue-900/40 bg-[#07152b]/60 sticky top-16 z-10 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedEnglishFilter("all")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedEnglishFilter === "all"
                        ? "bg-sky-400 text-zinc-950 shadow-md"
                        : "border border-blue-900/60 bg-blue-950/40 text-slate-300 hover:text-white"
                    }`}
                  >
                    Todos ({TOP_NOTCH_CHALLENGES.length})
                  </button>
                  <button
                    onClick={() => setSelectedEnglishFilter("pending")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedEnglishFilter === "pending"
                        ? "bg-sky-400 text-zinc-950 shadow-md"
                        : "border border-blue-900/60 bg-blue-950/40 text-slate-300 hover:text-white"
                    }`}
                  >
                    Pendientes ({TOP_NOTCH_CHALLENGES.length - completedEnglishChallenges.length})
                  </button>
                  <button
                    onClick={() => setSelectedEnglishFilter("completed")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedEnglishFilter === "completed"
                        ? "bg-emerald-500 text-zinc-950 shadow-md"
                        : "border border-blue-900/60 bg-blue-950/40 text-slate-300 hover:text-white"
                    }`}
                  >
                    Completados ({completedEnglishChallenges.length})
                  </button>
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={selectedEnglishLevel}
                    onChange={(e) => setSelectedEnglishLevel(e.target.value)}
                    className="rounded-xl border border-blue-900 bg-[#07152b] px-3 py-1.5 text-xs font-bold text-white focus:border-sky-400 focus:outline-none"
                  >
                    <option value="all">Todos los Libros Top Notch</option>
                    {TOP_NOTCH_LEVELS.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.bookTitle} ({lvl.cefrLevel})
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedEnglishType}
                    onChange={(e) => setSelectedEnglishType(e.target.value)}
                    className="rounded-xl border border-blue-900 bg-[#07152b] px-3 py-1.5 text-xs font-bold text-white focus:border-sky-400 focus:outline-none"
                  >
                    <option value="all">Todas las Dinámicas</option>
                    <option value="fill_in_the_blank">Completar Espacio</option>
                    <option value="error_hunt">Caza de Errores</option>
                    <option value="tense_transform">Transformación de Tiempo</option>
                    <option value="sentence_reorder">Ordenar Oración</option>
                    <option value="dialogue_completion">Diálogo Situacional</option>
                  </select>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar reto por regla, palabra clave o enunciado..."
                  value={englishSearchQuery}
                  onChange={(e) => setEnglishSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-blue-900 bg-blue-950/50 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div>
                Mostrando <strong className="text-white">{filteredEnglishChallenges.length}</strong> retos (Página {safeEnglishPage} de {totalEnglishPages})
              </div>

              {/* Top notch pagination header control */}
              {totalEnglishPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentEnglishPage((p) => Math.max(1, p - 1))}
                    disabled={safeEnglishPage === 1}
                    className="rounded-lg border border-blue-900 bg-blue-950/60 px-2.5 py-1 text-xs font-bold text-slate-300 disabled:opacity-40 hover:text-white"
                  >
                    ← Anterior
                  </button>
                  <span className="text-xs font-bold text-sky-400">
                    {safeEnglishPage} / {totalEnglishPages}
                  </span>
                  <button
                    onClick={() => setCurrentEnglishPage((p) => Math.min(totalEnglishPages, p + 1))}
                    disabled={safeEnglishPage === totalEnglishPages}
                    className="rounded-lg border border-blue-900 bg-blue-950/60 px-2.5 py-1 text-xs font-bold text-slate-300 disabled:opacity-40 hover:text-white"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {paginatedEnglishChallenges.map((ch) => {
                const isDone = completedEnglishChallenges.includes(ch.id);
                const evalRes = englishEvalResults[ch.id];
                const showHint = englishActiveHints[ch.id];
                const currentReorder = englishReorderWords[ch.id] || [];

                return (
                  <div
                    key={ch.id}
                    className={`rounded-2xl border p-6 space-y-4 transition shadow-lg ${
                      isDone
                        ? "border-emerald-500/40 bg-emerald-950/20"
                        : "border-blue-900/60 bg-[#07152b] hover:border-blue-700"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="rounded-md bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                            {ch.levelName}
                          </span>
                          <span className="rounded-md bg-blue-900/50 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                            {ch.unit}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white">{ch.title}</h3>
                        <p className="text-xs text-sky-400 font-medium mt-0.5">{ch.grammarPoint}</p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                          +{ch.xp} XP
                        </span>
                        {isDone && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Completado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Prompt Box */}
                    <div className="rounded-xl border border-blue-900/60 bg-blue-950/40 p-4 space-y-2">
                      <p className="text-xs text-slate-400 font-medium">Instrucción:</p>
                      <p className="text-sm font-semibold text-white leading-relaxed">{ch.prompt}</p>
                    </div>

                    {/* Dynamic Challenge Interaction according to type */}
                    <div className="space-y-3">
                      {/* TYPE 1: sentence_reorder */}
                      {ch.type === "sentence_reorder" && ch.scrambledWords && (
                        <div className="space-y-3">
                          <div className="rounded-xl border border-blue-900/80 bg-blue-950/70 p-3 min-h-[44px] flex flex-wrap items-center gap-2">
                            {currentReorder.length === 0 ? (
                              <span className="text-xs text-slate-500 italic">
                                Haz clic en las palabras de abajo para formar la oración...
                              </span>
                            ) : (
                              currentReorder.map((word, wIdx) => (
                                <button
                                  key={wIdx}
                                  onClick={() => {
                                    const nextWords = currentReorder.filter((_, idx) => idx !== wIdx);
                                    setEnglishReorderWords((prev) => ({ ...prev, [ch.id]: nextWords }));
                                  }}
                                  className="rounded-lg bg-sky-500/20 border border-sky-400/40 px-2.5 py-1 text-xs font-bold text-sky-200 hover:bg-red-950 hover:border-red-500 hover:text-red-200 transition"
                                >
                                  {word} ✕
                                </button>
                              ))
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {ch.scrambledWords.map((word, wIdx) => {
                              const occurrencesInTarget = ch.scrambledWords!.filter((w) => w === word).length;
                              const occurrencesInSelected = currentReorder.filter((w) => w === word).length;
                              const isAllUsed = occurrencesInSelected >= occurrencesInTarget;

                              return (
                                <button
                                  key={wIdx}
                                  disabled={isAllUsed}
                                  onClick={() => {
                                    const nextWords = [...currentReorder, word];
                                    setEnglishReorderWords((prev) => ({ ...prev, [ch.id]: nextWords }));
                                  }}
                                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                    isAllUsed
                                      ? "opacity-30 border border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed"
                                      : "border border-blue-800 bg-blue-900/60 text-slate-200 hover:border-sky-400 hover:text-white"
                                  }`}
                                >
                                  {word}
                                </button>
                              );
                            })}

                            {currentReorder.length > 0 && (
                              <button
                                onClick={() => setEnglishReorderWords((prev) => ({ ...prev, [ch.id]: [] }))}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-900/60 bg-red-950/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-900/60 transition"
                              >
                                <RotateCcw className="h-3 w-3" /> Reiniciar
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TYPE 2: multiple choice (options provided) */}
                      {ch.options && ch.type !== "sentence_reorder" && (
                        <div className="space-y-2">
                          {ch.options.map((opt, oIdx) => {
                            const isSelected = englishUserInputs[ch.id] === opt;
                            return (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-3 rounded-xl p-3 text-xs cursor-pointer transition border ${
                                  isSelected
                                    ? "border-sky-400 bg-sky-500/20 text-white font-semibold"
                                    : "border-blue-900/60 bg-blue-950/40 text-slate-300 hover:border-blue-700"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`opt-${ch.id}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => setEnglishUserInputs((prev) => ({ ...prev, [ch.id]: opt }))}
                                  className="text-sky-500 focus:ring-sky-400"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* TYPE 3: text input (fill_in_the_blank or tense_transform without fixed options) */}
                      {!ch.options && ch.type !== "sentence_reorder" && (
                        <div>
                          <input
                            type="text"
                            placeholder="Escribe tu respuesta aquí..."
                            value={englishUserInputs[ch.id] || ""}
                            onChange={(e) => setEnglishUserInputs((prev) => ({ ...prev, [ch.id]: e.target.value }))}
                            className="w-full rounded-xl border border-blue-900 bg-blue-950/50 p-3 text-xs text-white placeholder-slate-500 focus:border-sky-400 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>

                    {/* Hint Section */}
                    {showHint && (
                      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200 flex items-start gap-2">
                        <HelpCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <span className="font-bold">Pista:</span> {ch.hint}
                        </div>
                      </div>
                    )}

                    {/* Feedback result */}
                    {evalRes && (
                      <div
                        className={`rounded-xl border p-3.5 text-xs ${
                          evalRes.ok
                            ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                            : "border-red-500/40 bg-red-950/30 text-red-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold">
                          {evalRes.ok ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-red-400" />}
                          <span>{evalRes.msg}</span>
                        </div>
                        {evalRes.explanation && (
                          <p className="mt-1.5 text-[11px] opacity-90 leading-relaxed">
                            {evalRes.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Actions footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-900/50">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEnglishActiveHints((prev) => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-300 transition"
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                          <span>{showHint ? "Ocultar pista" : "Ver pista"}</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleEvaluateEnglishChallenge(ch)}
                        className="rounded-xl bg-sky-400 hover:bg-sky-300 text-zinc-950 font-bold text-xs px-5 py-2 transition shadow-md shadow-sky-500/10"
                      >
                        Validar Reto
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalEnglishPages > 1 && (
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentEnglishPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeEnglishPage === 1}
                  className="rounded-xl border border-blue-900 bg-blue-950/70 px-4 py-2 text-xs font-bold text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {visibleEnglishPageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentEnglishPage(page)}
                      className={`h-8 w-8 rounded-lg border transition ${
                        safeEnglishPage === page
                          ? "border-sky-400 bg-sky-400 text-zinc-950 font-bold shadow-md shadow-sky-400/20"
                          : "border-blue-900/80 bg-blue-950/60 text-slate-300 hover:border-sky-400/60 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentEnglishPage((prev) => Math.min(totalEnglishPages, prev + 1))}
                  disabled={safeEnglishPage === totalEnglishPages}
                  className="rounded-xl border border-blue-900 bg-blue-950/70 px-4 py-2 text-xs font-bold text-slate-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
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
            {completionsLoading && <span className="ml-2">Cargando progreso…</span>}
          </div>

          {completionError && (
            <div role="alert" className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
              {completionError}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {paginatedChallenges.map((ch) => {
              if (selectedChallengeId && selectedChallengeId !== ch.id) return null;

              const isDone = completedList.includes(ch.id);
              const isBlocked = lockedChallenges.includes(ch.id);
              const challengeStatus = challengeStatuses[ch.id] ?? "faltante";
              const hasErrorStatus = challengeStatus === "erroneo";
              const isFinalized = isDone || isBlocked;
              const isWritable = isChallengeActive(ch);
              const attemptsUsed = attemptsByChallenge[ch.id] ?? 0;
              const canRevealSolution = isDone || isBlocked || attemptsUsed >= 3;
              const evalRes = evalResults[ch.id];
              const shouldShowSolution = Boolean((showSolution[ch.id] && attemptsUsed >= 3) || isDone || isBlocked);
              const timer = timerRecords[ch.id] ?? { elapsedMs: 0, startedAt: null, finished: false };
              const elapsedMs =
                timer.elapsedMs +
                (!timer.finished && timer.startedAt !== null ? timerNow - timer.startedAt : 0);
              const speedBonusPreview = calculateSpeedBonusXp(ch.xp, elapsedMs);

              if (!selectedChallengeId) {
                return (
                  <button
                    key={ch.id}
                    type="button"
                    disabled={completionsLoading || authLoading}
                    onClick={() => {
                      setChallengeActive(true);
                      setSelectedChallengeId(ch.id);
                    }}
                    className={`rounded-2xl border p-6 text-left text-base font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                      completionsLoading || authLoading
                        ? "cursor-wait border-zinc-800 bg-zinc-900/60 opacity-60"
                        : isDone
                        ? "border-emerald-500/50 bg-emerald-950/40 hover:border-emerald-400"
                        : hasErrorStatus
                        ? "border-red-500/50 bg-red-950/40 hover:border-red-400"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-600"
                    }`}
                    aria-label={`Abrir reto: ${ch.title}`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>{ch.title}</span>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${
                        isDone
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : hasErrorStatus
                          ? "border-red-500/40 bg-red-500/10 text-red-300"
                          : "border-zinc-700 bg-zinc-950/50 text-zinc-400"
                      }`}>
                        {challengeStatus === "erroneo" ? "Erróneo" : challengeStatus}
                      </span>
                    </span>
                  </button>
                );
              }

              return (
                <div
                  key={ch.id}
                  className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-8"
                  role="dialog"
                  aria-modal="true"
                  aria-label={ch.title}
                >
                  <div
                    className={`animate-challenge-expand max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border p-5 shadow-2xl sm:p-8 flex flex-col justify-between backdrop-blur-md ${
                    isDone
                      ? "border-emerald-500/40 bg-emerald-950/10 shadow-lg shadow-emerald-500/5"
                      : isBlocked || hasErrorStatus
                      ? "border-red-500/30 bg-red-950/10 shadow-lg shadow-red-500/5"
                      : "border-zinc-700 bg-zinc-900"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setChallengeActive(false);
                      setSelectedChallengeId(null);
                    }}
                    className="mb-5 inline-flex w-fit items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a los retos
                  </button>
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
                          +{ch.xp + (isDone ? bonusXpByChallenge[ch.id] ?? 0 : 0)} XP
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
                        {!isDone && !isBlocked && hasErrorStatus && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Erróneo
                          </span>
                        )}
                        {!isDone && !isBlocked && !hasErrorStatus && (
                          <span className="rounded border border-zinc-700 bg-zinc-950/60 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-400">
                            Faltante
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">{ch.title}</h3>
                    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs">
                      <span className="font-mono font-bold text-white">
                        Tiempo: {formatElapsedTime(elapsedMs)}
                      </span>
                      {isDone ? (
                        <span className="font-semibold text-emerald-300">
                          Bono obtenido: +{bonusXpByChallenge[ch.id] ?? 0} XP
                        </span>
                      ) : (
                        <span className="text-amber-300">
                          Bono por velocidad ahora: +{speedBonusPreview} XP
                        </span>
                      )}
                      <span className="text-zinc-500">El bono disminuye hasta llegar a 0 tras 30 minutos.</span>
                    </div>
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
