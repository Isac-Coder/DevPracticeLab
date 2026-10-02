"use client";

import { createContext, useContext, useState } from "react";

const ChallengeModeContext = createContext<{
  challengeActive: boolean;
  setChallengeActive: (active: boolean) => void;
}>({
  challengeActive: false,
  setChallengeActive: () => {},
});

export function ChallengeModeProvider({ children }: { children: React.ReactNode }) {
  const [challengeActive, setChallengeActive] = useState(false);

  return (
    <ChallengeModeContext.Provider value={{ challengeActive, setChallengeActive }}>
      {children}
    </ChallengeModeContext.Provider>
  );
}

export function useChallengeMode() {
  return useContext(ChallengeModeContext);
}
