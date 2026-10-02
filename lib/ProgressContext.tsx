"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type ModuleType = "ssh" | "docker" | "postgres" | "typescript";

export interface ModuleProgress {
  commandsExecuted: number;
  uniqueCommands: string[];
  lastPracticed: string | null;
}

export interface ModuleCompletionProgress {
  challengesCompleted: number;
  challengesTotal: number;
  courseLessonsCompleted: number;
  courseLessonsTotal: number;
}

export interface ProgressState {
  ssh: ModuleProgress;
  docker: ModuleProgress;
  postgres: ModuleProgress;
  typescript: ModuleProgress;
}

const MODULE_TARGETS: Record<ModuleType, { name: string; targetCommands: string[]; totalGoal: number }> = {
  ssh: {
    name: "SSH",
    targetCommands: ["ssh", "ssh-keygen", "ssh-copy-id", "scp", "sftp", "ls", "cd", "pwd", "cat", "whoami"],
    totalGoal: 10,
  },
  docker: {
    name: "Docker",
    targetCommands: ["run", "ps", "images", "pull", "stop", "rm", "rmi", "network", "volume", "compose"],
    totalGoal: 10,
  },
  postgres: {
    name: "PostgreSQL",
    targetCommands: ["select", "insert", "update", "delete", "create", "drop", "\\dt", "\\d", "\\l", "\\du"],
    totalGoal: 10,
  },
  typescript: {
    name: "TypeScript",
    targetCommands: ["tsc", "ts-node", "type", "interface", "enum", "generics", "strict", "eval", "build", "check"],
    totalGoal: 10,
  },
};

const initialProgress: ProgressState = {
  ssh: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
  docker: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
  postgres: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
  typescript: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
};

interface ProgressContextType {
  progress: ProgressState;
  completions: Record<ModuleType, ModuleCompletionProgress>;
  recordCommand: (module: ModuleType, rawCommand: string) => void;
  getModuleStats: (module: ModuleType) => {
    name: string;
    commandsExecuted: number;
    uniqueCount: number;
    totalGoal: number;
    percentage: number;
    lastPracticed: string | null;
    targetCommands: string[];
    completedTargets: string[];
    challengesCompleted: number;
    challengesTotal: number;
    courseLessonsCompleted: number;
    courseLessonsTotal: number;
  };
  overallPercentage: number;
  totalCommandsExecuted: number;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const emptyCompletions: Record<ModuleType, ModuleCompletionProgress> = {
  ssh: { challengesCompleted: 0, challengesTotal: 50, courseLessonsCompleted: 0, courseLessonsTotal: 50 },
  docker: { challengesCompleted: 0, challengesTotal: 50, courseLessonsCompleted: 0, courseLessonsTotal: 50 },
  postgres: { challengesCompleted: 0, challengesTotal: 50, courseLessonsCompleted: 0, courseLessonsTotal: 50 },
  typescript: { challengesCompleted: 0, challengesTotal: 50, courseLessonsCompleted: 0, courseLessonsTotal: 50 },
};

const moduleFromChallengeId = (challengeId: string): ModuleType | null => {
  const moduleKey = challengeId.split("-w")[0];
  return moduleKey === "ssh" || moduleKey === "docker" || moduleKey === "postgres" || moduleKey === "typescript"
    ? moduleKey
    : null;
};

const moduleFromCourseProgressKey = (progressKey: string): ModuleType | null => {
  const [moduleKey] = progressKey.split(":");
  return moduleKey === "ssh" || moduleKey === "docker" || moduleKey === "postgres" || moduleKey === "typescript"
    ? moduleKey
    : null;
};

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(initialProgress);
  const [completions, setCompletions] = useState<Record<ModuleType, ModuleCompletionProgress>>(emptyCompletions);

  const storageKey = user ? `devpracticelab_progress_${user.email}` : "devpracticelab_progress_guest";

  // Load from localStorage whenever user or storageKey changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeout = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setProgress({
            ssh: {
              commandsExecuted: parsed.ssh?.commandsExecuted || 0,
              uniqueCommands: parsed.ssh?.uniqueCommands || [],
              lastPracticed: parsed.ssh?.lastPracticed || null,
            },
            docker: {
              commandsExecuted: parsed.docker?.commandsExecuted || 0,
              uniqueCommands: parsed.docker?.uniqueCommands || [],
              lastPracticed: parsed.docker?.lastPracticed || null,
            },
            postgres: {
              commandsExecuted: parsed.postgres?.commandsExecuted || 0,
              uniqueCommands: parsed.postgres?.uniqueCommands || [],
              lastPracticed: parsed.postgres?.lastPracticed || null,
            },
            typescript: {
              commandsExecuted: parsed.typescript?.commandsExecuted || 0,
              uniqueCommands: parsed.typescript?.uniqueCommands || [],
              lastPracticed: parsed.typescript?.lastPracticed || null,
            },
          });
        } else {
          setProgress(initialProgress);
        }
      } catch {
        setProgress(initialProgress);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [storageKey]);

  useEffect(() => {
    if (!user) {
      const timeout = window.setTimeout(() => setCompletions(emptyCompletions), 0);
      return () => window.clearTimeout(timeout);
    }

    let cancelled = false;
    const refreshCompletions = async () => {
      try {
        const [challengeResponse, courseResponse] = await Promise.all([
          fetch("/api/challenges/completions", { cache: "no-store" }),
          fetch("/api/courses/progress", { cache: "no-store" }),
        ]);
        if (!challengeResponse.ok || !courseResponse.ok) return;
        const challengeData: { completed?: unknown } = await challengeResponse.json();
        const courseData: { progress?: unknown } = await courseResponse.json();
        const next = structuredClone(emptyCompletions);

        if (Array.isArray(challengeData.completed)) {
          for (const challengeId of challengeData.completed) {
            if (typeof challengeId !== "string") continue;
            const moduleKey = moduleFromChallengeId(challengeId);
            if (moduleKey) next[moduleKey].challengesCompleted += 1;
          }
        }

        if (typeof courseData.progress === "object" && courseData.progress !== null && !Array.isArray(courseData.progress)) {
          for (const [progressKey, lessons] of Object.entries(courseData.progress)) {
            const moduleKey = moduleFromCourseProgressKey(progressKey);
            if (moduleKey && Array.isArray(lessons)) {
              next[moduleKey].courseLessonsCompleted += lessons.filter((lesson) => typeof lesson === "string").length;
            }
          }
        }

        if (!cancelled) setCompletions(next);
      } catch (error) {
        console.error("No se pudieron cargar los hitos de progreso:", error);
      }
    };

    void refreshCompletions();
    const interval = window.setInterval(refreshCompletions, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user]);

  // Save to localStorage whenever progress changes
  const saveProgress = useCallback(
    (newState: ProgressState) => {
      setProgress(newState);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newState));
        } catch (e) {
          console.error("Error al guardar progreso en localStorage:", e);
        }
      }
    },
    [storageKey]
  );

  const recordCommand = useCallback(
    (module: ModuleType, rawCommand: string) => {
      const trimmed = rawCommand.trim();
      if (!trimmed || trimmed === "clear") return;

      const normalizedCmd = trimmed.split(/\s+/)[0].toLowerCase();

      setProgress((prev) => {
        const currentModule = prev[module];
        const uniqueSet = new Set(currentModule.uniqueCommands);
        uniqueSet.add(normalizedCmd);

        const updated: ProgressState = {
          ...prev,
          [module]: {
            commandsExecuted: currentModule.commandsExecuted + 1,
            uniqueCommands: Array.from(uniqueSet),
            lastPracticed: new Date().toISOString(),
          },
        };

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {
            console.error("Error al persistir progreso:", e);
          }
        }
        return updated;
      });
    },
    [storageKey]
  );

  const getModuleStats = useCallback(
    (module: ModuleType) => {
      const mod = progress[module];
      const targetInfo = MODULE_TARGETS[module];
      const moduleCompletions = completions[module];
      const completedTargets = targetInfo.targetCommands.filter((t) =>
        mod.uniqueCommands.includes(t.toLowerCase())
      );

      const challengePercent = (moduleCompletions.challengesCompleted / moduleCompletions.challengesTotal) * 100;
      const coursePercent = (moduleCompletions.courseLessonsCompleted / moduleCompletions.courseLessonsTotal) * 100;
      const commandPercent = (completedTargets.length / targetInfo.totalGoal) * 100;
      const activityPercent = Math.min(100, mod.commandsExecuted * 5);
      const calculated = Math.min(100, Math.round(
        challengePercent * 0.5 + coursePercent * 0.3 + commandPercent * 0.15 + activityPercent * 0.05,
      ));

      return {
        name: targetInfo.name,
        commandsExecuted: mod.commandsExecuted,
        uniqueCount: mod.uniqueCommands.length,
        totalGoal: targetInfo.totalGoal,
        percentage: calculated,
        lastPracticed: mod.lastPracticed,
        targetCommands: targetInfo.targetCommands,
        completedTargets,
        challengesCompleted: moduleCompletions.challengesCompleted,
        challengesTotal: moduleCompletions.challengesTotal,
        courseLessonsCompleted: moduleCompletions.courseLessonsCompleted,
        courseLessonsTotal: moduleCompletions.courseLessonsTotal,
      };
    },
    [completions, progress]
  );

  const statsSSH = getModuleStats("ssh");
  const statsDocker = getModuleStats("docker");
  const statsPostgres = getModuleStats("postgres");
  const statsTypeScript = getModuleStats("typescript");

  const overallPercentage = Math.round(
    (statsSSH.percentage + statsDocker.percentage + statsPostgres.percentage + statsTypeScript.percentage) / 4
  );

  const totalCommandsExecuted =
    progress.ssh.commandsExecuted +
    progress.docker.commandsExecuted +
    progress.postgres.commandsExecuted +
    progress.typescript.commandsExecuted;

  const resetProgress = useCallback(() => {
    saveProgress(initialProgress);
  }, [saveProgress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        completions,
        recordCommand,
        getModuleStats,
        overallPercentage,
        totalCommandsExecuted,
        resetProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function usePracticeProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("usePracticeProgress debe usarse dentro de un ProgressProvider");
  }
  return context;
}
