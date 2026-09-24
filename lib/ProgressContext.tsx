"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

export type ModuleType = "ssh" | "docker" | "postgres" | "typescript" | "nextjs";

export interface ModuleProgress {
  commandsExecuted: number;
  uniqueCommands: string[];
  lastPracticed: string | null;
}

export interface ProgressState {
  ssh: ModuleProgress;
  docker: ModuleProgress;
  postgres: ModuleProgress;
  typescript: ModuleProgress;
  nextjs: ModuleProgress;
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
  nextjs: {
    name: "Next.js",
    targetCommands: ["next", "app", "layout", "page", "route", "use client", "server", "render", "build", "lint"],
    totalGoal: 10,
  },
};

const initialProgress: ProgressState = {
  ssh: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
  docker: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
  postgres: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
  typescript: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
  nextjs: { commandsExecuted: 0, uniqueCommands: [], lastPracticed: null },
};

interface ProgressContextType {
  progress: ProgressState;
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
  };
  overallPercentage: number;
  totalCommandsExecuted: number;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressState>(initialProgress);

  const storageKey = user ? `devpracticelab_progress_${user.email}` : "devpracticelab_progress_guest";

  // Load from localStorage whenever user or storageKey changes
  useEffect(() => {
    if (typeof window === "undefined") return;
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
          nextjs: {
            commandsExecuted: parsed.nextjs?.commandsExecuted || 0,
            uniqueCommands: parsed.nextjs?.uniqueCommands || [],
            lastPracticed: parsed.nextjs?.lastPracticed || null,
          },
        });
      } else {
        setProgress(initialProgress);
      }
    } catch {
      setProgress(initialProgress);
    }
  }, [storageKey]);

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
      const completedTargets = targetInfo.targetCommands.filter((t) =>
        mod.uniqueCommands.includes(t.toLowerCase())
      );

      // Percentage is calculated based on completed target goals + activity weighting
      const targetPercent = (completedTargets.length / targetInfo.totalGoal) * 100;
      const activityBonus = Math.min(20, mod.commandsExecuted * 2);
      const calculated = Math.min(100, Math.round(targetPercent * 0.8 + activityBonus));

      return {
        name: targetInfo.name,
        commandsExecuted: mod.commandsExecuted,
        uniqueCount: mod.uniqueCommands.length,
        totalGoal: targetInfo.totalGoal,
        percentage: calculated,
        lastPracticed: mod.lastPracticed,
        targetCommands: targetInfo.targetCommands,
        completedTargets,
      };
    },
    [progress]
  );

  const statsSSH = getModuleStats("ssh");
  const statsDocker = getModuleStats("docker");
  const statsPostgres = getModuleStats("postgres");
  const statsTypeScript = getModuleStats("typescript");
  const statsNextJs = getModuleStats("nextjs");

  const overallPercentage = Math.round(
    (statsSSH.percentage + statsDocker.percentage + statsPostgres.percentage + statsTypeScript.percentage + statsNextJs.percentage) / 5
  );

  const totalCommandsExecuted =
    progress.ssh.commandsExecuted +
    progress.docker.commandsExecuted +
    progress.postgres.commandsExecuted +
    progress.typescript.commandsExecuted +
    progress.nextjs.commandsExecuted;

  const resetProgress = useCallback(() => {
    saveProgress(initialProgress);
  }, [saveProgress]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
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
