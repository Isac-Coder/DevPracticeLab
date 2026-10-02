"use client";

import { createContext, useContext, useState } from "react";

export interface PracticeContextValue {
  type: "challenge" | "course";
  module: string;
  level?: string;
  title?: string;
}

const ChallengeModeContext = createContext<{
  challengeActive: boolean;
  setChallengeActive: (active: boolean) => void;
  practiceContext: PracticeContextValue | null;
  setPracticeContext: (context: PracticeContextValue | null) => void;
}>({
  challengeActive: false,
  setChallengeActive: () => {},
  practiceContext: null,
  setPracticeContext: () => {},
});

export function ChallengeModeProvider({ children }: { children: React.ReactNode }) {
  const [challengeActive, setChallengeActive] = useState(false);
  const [practiceContext, setPracticeContext] = useState<PracticeContextValue | null>(null);

  return (
    <ChallengeModeContext.Provider value={{ challengeActive, setChallengeActive, practiceContext, setPracticeContext }}>
      {children}
    </ChallengeModeContext.Provider>
  );
}

export function useChallengeMode() {
  return useContext(ChallengeModeContext);
}
