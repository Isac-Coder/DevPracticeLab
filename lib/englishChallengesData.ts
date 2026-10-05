export type EnglishChallengeType =
  | "fill_in_the_blank"
  | "error_hunt"
  | "tense_transform"
  | "sentence_reorder"
  | "dialogue_completion";

export type EnglishBookLevel =
  | "fundamentals"
  | "tn1"
  | "tn2"
  | "tn3"
  | "summit1"
  | "summit2";

export interface EnglishChallenge {
  id: string;
  bookLevel: EnglishBookLevel;
  levelId?: string;
  levelName?: string;
  bookTitle: string;
  cefr: string;
  week: number;
  title: string;
  challengeType: EnglishChallengeType;
  type?: EnglishChallengeType;
  category: string;
  points: number;
  xp?: number;
  targetDurationSeconds: number;
  prompt: string;
  contextScenario?: string;
  scrambledTokens?: string[];
  scrambledWords?: string[];
  options?: string[];
  correctAnswers: string[]; // Possible valid text answers (normalized)
  correctAnswer?: string;
  acceptableAnswers?: string[];
  hint: string;
  grammarExplanation: string;
  grammarPoint?: string;
  explanation?: string;
  topNotchUnit: string;
  unit?: string;
  keywords?: string[];
}

export const ALL_ENGLISH_CHALLENGES: EnglishChallenge[] = [
  // --- TOP NOTCH FUNDAMENTALS (A1) ---
  {
    id: "eng-fund-01",
    bookLevel: "fundamentals",
    bookTitle: "Top Notch Fundamentals",
    cefr: "A1",
    week: 1,
    title: "Verb To Be & Professional Introductions",
    challengeType: "fill_in_the_blank",
    category: "Verb Tenses",
    points: 50,
    targetDurationSeconds: 45,
    prompt: "Complete the sentence with the correct form of 'to be': 'They ________ (be) software engineers at the technology hub.'",
    contextScenario: "Presenting team members during an onboarding meeting.",
    correctAnswers: ["are", "'re", "are."],
    hint: "El pronombre 'they' es tercera persona plural, por lo que rige 'are'.",
    grammarExplanation: "Subject pronoun 'they' always takes 'are' in the present tense.",
    topNotchUnit: "Top Notch Fundamentals — Unit 1: Getting Acquainted"
  },
  {
    id: "eng-fund-02",
    bookLevel: "fundamentals",
    bookTitle: "Top Notch Fundamentals",
    cefr: "A1",
    week: 1,
    title: "Possessive Adjectives in the Workspace",
    challengeType: "fill_in_the_blank",
    category: "Vocabulary & Mechanics",
    points: 50,
    targetDurationSeconds: 40,
    prompt: "Fill in the blank with the appropriate possessive adjective: 'Carlos loves his new laptop, and Maria also brought ________ laptop to the lab.'",
    contextScenario: "Identifying equipment owners in the office.",
    correctAnswers: ["her", "her."],
    hint: "El adjetivo posesivo para 'she' / Maria es 'her'.",
    grammarExplanation: "Use 'her' to refer to a possession belonging to a singular female subject.",
    topNotchUnit: "Top Notch Fundamentals — Unit 2: People and Occupations"
  },
  {
    id: "eng-fund-03",
    bookLevel: "fundamentals",
    bookTitle: "Top Notch Fundamentals",
    cefr: "A1",
    week: 1,
    title: "Simple Present Routine Rebuilder",
    challengeType: "sentence_reorder",
    category: "Sentence Structure",
    points: 75,
    targetDurationSeconds: 60,
    prompt: "Reconstruct the scrambled words into a grammatically correct routine statement.",
    scrambledTokens: ["starts", "at", "The", "morning", "meeting", "9:00", "AM", "every"],
    correctAnswers: [
      "The morning meeting starts at 9:00 AM every day",
      "The morning meeting starts at 9:00 AM",
      "The meeting starts at 9:00 AM every morning"
    ],
    hint: "Sujeto ('The morning meeting') + Verbo en 3ra persona ('starts') + Preposición de hora ('at 9:00 AM').",
    grammarExplanation: "In Simple Present, singular non-human subjects take the 3rd person singular verb form with '-s'.",
    topNotchUnit: "Top Notch Fundamentals — Unit 4: Daily Routines"
  },

  // --- TOP NOTCH 1 (A2) ---
  {
    id: "eng-tn1-01",
    bookLevel: "tn1",
    bookTitle: "Top Notch 1",
    cefr: "A2",
    week: 2,
    title: "Present Continuous Action in Progress",
    challengeType: "fill_in_the_blank",
    category: "Verb Tenses",
    points: 80,
    targetDurationSeconds: 50,
    prompt: "Complete the sentence with the Present Continuous of 'write': 'Right now, the team lead ________ (write) the deployment documentation.'",
    contextScenario: "Reporting immediate progress in the chat channel.",
    correctAnswers: ["is writing", "'s writing", "is writing."],
    hint: "Usa el auxiliar 'is' + el gerundio de 'write' eliminando la 'e' final ('writing').",
    grammarExplanation: "Present Continuous requires 'am/is/are' + verb-ing. 'Write' drops the silent 'e' before adding '-ing'.",
    topNotchUnit: "Top Notch 1 — Unit 3: On the Job"
  },
  {
    id: "eng-tn1-02",
    bookLevel: "tn1",
    bookTitle: "Top Notch 1",
    cefr: "A2",
    week: 2,
    title: "Simple Past Irregular Verb Hunt",
    challengeType: "error_hunt",
    category: "Verb Tenses",
    points: 90,
    targetDurationSeconds: 60,
    prompt: "Find and correct the incorrect verb in this sentence: 'Yesterday our lead engineer builded a new test container.' Type ONLY the correct past tense verb.",
    correctAnswers: ["built"],
    hint: "El verbo 'build' es irregular; su pasado simple no añade '-ed'.",
    grammarExplanation: "'Build' is an irregular verb. Past simple is 'built', not 'builded'.",
    topNotchUnit: "Top Notch 1 — Unit 7: Past Events and Experiences"
  },
  {
    id: "eng-tn1-03",
    bookLevel: "tn1",
    bookTitle: "Top Notch 1",
    cefr: "A2",
    week: 2,
    title: "Future Plans with 'Be Going To'",
    challengeType: "sentence_reorder",
    category: "Verb Tenses",
    points: 85,
    targetDurationSeconds: 55,
    prompt: "Reconstruct the sentence describing a planned system upgrade next Monday.",
    scrambledTokens: ["are", "upgrade", "We", "the", "servers", "to", "going", "next", "Monday"],
    correctAnswers: [
      "We are going to upgrade the servers next Monday",
      "We're going to upgrade the servers next Monday"
    ],
    hint: "Estructura de futuro: Sujeto + are + going + to + verbo base ('upgrade').",
    grammarExplanation: "'Be going to' expresses pre-planned intentions or scheduled events.",
    topNotchUnit: "Top Notch 1 — Unit 5: Future Events"
  },

  // --- TOP NOTCH 2 (B1) ---
  {
    id: "eng-tn2-01",
    bookLevel: "tn2",
    bookTitle: "Top Notch 2",
    cefr: "B1",
    week: 3,
    title: "Present Perfect with 'Ever' & 'Never'",
    challengeType: "fill_in_the_blank",
    category: "Verb Tenses",
    points: 100,
    targetDurationSeconds: 50,
    prompt: "Complete the interview question: 'Have you ever ________ (configure) a high-availability PostgreSQL cluster?'",
    contextScenario: "Technical job interview for senior cloud position.",
    correctAnswers: ["configured", "configured?"],
    hint: "Usa el participio pasado del verbo regular 'configure'.",
    grammarExplanation: "Present perfect questions about life experience use 'Have you ever' + Past Participle (V3).",
    topNotchUnit: "Top Notch 2 — Unit 1: Life Experiences"
  },
  {
    id: "eng-tn2-02",
    bookLevel: "tn2",
    bookTitle: "Top Notch 2",
    cefr: "B1",
    week: 3,
    title: "Modal Discrimination: Obligation vs Optionality",
    challengeType: "dialogue_completion",
    category: "Modals & Auxiliaries",
    points: 110,
    targetDurationSeconds: 60,
    prompt: "Choose the correct phrase: 'Tomorrow is an official holiday, so you ________ come into the office, but you may work remotely if you wish.'",
    options: [
      "must not",
      "don't have to",
      "shouldn't have",
      "ought not"
    ],
    correctAnswers: ["don't have to", "dont have to"],
    hint: "'Must not' significa prohibido. 'Don't have to' indica que no hay obligación pero es opcional.",
    grammarExplanation: "'Don't have to' conveys lack of obligation (it is optional), while 'must not' expresses strict prohibition.",
    topNotchUnit: "Top Notch 2 — Unit 5: Workplace Guidelines"
  },
  {
    id: "eng-tn2-03",
    bookLevel: "tn2",
    bookTitle: "Top Notch 2",
    cefr: "B1",
    week: 3,
    title: "Gerunds after Prepositions",
    challengeType: "fill_in_the_blank",
    category: "Sentence Structure",
    points: 95,
    targetDurationSeconds: 45,
    prompt: "Fill in the blank with the appropriate form of 'test': 'Before ________ (test) the code in staging, make sure your environment variables are configured.'",
    correctAnswers: ["testing", "testing."],
    hint: "Cualquier verbo colocado inmediatamente después de una preposición ('before') debe adoptar la forma gerundio (-ing).",
    grammarExplanation: "Prepositions ('before', 'after', 'for', 'by') are always followed by the gerund form (-ing).",
    topNotchUnit: "Top Notch 2 — Unit 7: Technical Procedures"
  },

  // --- TOP NOTCH 3 (B1+) ---
  {
    id: "eng-tn3-01",
    bookLevel: "tn3",
    bookTitle: "Top Notch 3",
    cefr: "B1+",
    week: 4,
    title: "Passive Voice Architecture Transformer",
    challengeType: "tense_transform",
    category: "Sentence Structure",
    points: 130,
    targetDurationSeconds: 60,
    prompt: "Transform this active sentence into the Present Simple Passive Voice: 'The firewall blocks unauthorized IP addresses.'",
    correctAnswers: [
      "Unauthorized IP addresses are blocked by the firewall.",
      "Unauthorized IP addresses are blocked by the firewall",
      "Unauthorized IP addresses are blocked"
    ],
    hint: "Objeto plural ('Unauthorized IP addresses') + are + participio pasado ('blocked') + by agente ('by the firewall').",
    grammarExplanation: "In Present Simple Passive, plural subjects use 'are' + Past Participle.",
    topNotchUnit: "Top Notch 3 — Unit 3: Security & Technology"
  },
  {
    id: "eng-tn3-02",
    bookLevel: "tn3",
    bookTitle: "Top Notch 3",
    cefr: "B1+",
    week: 4,
    title: "Second Conditional Hypothetical Solutions",
    challengeType: "fill_in_the_blank",
    category: "Clauses & Conditionals",
    points: 120,
    targetDurationSeconds: 50,
    prompt: "Complete with the correct Second Conditional verb form: 'If I ________ (be) the infrastructure director, I would invest in automated disaster recovery.'",
    correctAnswers: ["were", "were,", "was"],
    hint: "En el Segundo Condicional formal, el verbo 'to be' usa 'were' para todas las personas gramaticales.",
    grammarExplanation: "In formal unreal conditionals (Second Conditional), 'were' is used for all subjects with the verb 'be'.",
    topNotchUnit: "Top Notch 3 — Unit 9: Decisions & Dilemmas"
  },
  {
    id: "eng-tn3-03",
    bookLevel: "tn3",
    bookTitle: "Top Notch 3",
    cefr: "B1+",
    week: 4,
    title: "Embedded Indirect Questions in Client Relations",
    challengeType: "error_hunt",
    category: "Sentence Structure",
    points: 125,
    targetDurationSeconds: 60,
    prompt: "Find and correct the word order error: 'Could you please tell me when will the maintenance window end?' Type the corrected subordinate clause ONLY (starting with 'when').",
    correctAnswers: [
      "when the maintenance window will end",
      "when the maintenance window will end?"
    ],
    hint: "Las preguntas indirectas adoptan orden afirmativo: 'when' + sujeto ('the maintenance window') + verbo ('will end').",
    grammarExplanation: "Indirect questions do not invert the subject and modal. Use statement word order.",
    topNotchUnit: "Top Notch 3 — Unit 8: Polite Requests"
  },

  // --- SUMMIT 1 (B2) ---
  {
    id: "eng-sum1-01",
    bookLevel: "summit1",
    bookTitle: "Summit 1",
    cefr: "B2",
    week: 5,
    title: "Past Modal Deduction in Critical Incidents",
    challengeType: "fill_in_the_blank",
    category: "Modals & Auxiliaries",
    points: 150,
    targetDurationSeconds: 60,
    prompt: "Complete with the deduction modal 'must have' + 'crash': 'The monitoring alert fired because the primary node ________ (must / crash) during peak traffic.'",
    correctAnswers: ["must have crashed", "must have crashed."],
    hint: "Estructura modal perfecta: 'must have' + participio pasado ('crashed').",
    grammarExplanation: "'Must have' + Past Participle indicates a strong logical deduction about a past event.",
    topNotchUnit: "Summit 1 — Unit 5: Speculation and Evidence"
  },
  {
    id: "eng-sum1-02",
    bookLevel: "summit1",
    bookTitle: "Summit 1",
    cefr: "B2",
    week: 5,
    title: "Third Conditional Post-Mortem Analysis",
    challengeType: "sentence_reorder",
    category: "Clauses & Conditionals",
    points: 160,
    targetDurationSeconds: 70,
    prompt: "Reconstruct the Third Conditional sentence evaluating a past outage prevention.",
    scrambledTokens: ["had", "If", "we", "enabled", "backups", "data", "wouldn't", "the", "been", "have", "lost"],
    correctAnswers: [
      "If we had enabled backups the data wouldn't have been lost",
      "If we had enabled backups, the data wouldn't have been lost",
      "The data wouldn't have been lost if we had enabled backups"
    ],
    hint: "Condicional 3: If + we had enabled backups + the data wouldn't have been lost.",
    grammarExplanation: "Third conditional: If + Past Perfect, would/wouldn't have + Past Participle.",
    topNotchUnit: "Summit 1 — Unit 2: Retrospective Analysis"
  },

  // --- SUMMIT 2 (C1) ---
  {
    id: "eng-sum2-01",
    bookLevel: "summit2",
    bookTitle: "Summit 2",
    cefr: "C1",
    week: 6,
    title: "Negative Inversion for High-Impact Statements",
    challengeType: "tense_transform",
    category: "Sentence Structure",
    points: 200,
    targetDurationSeconds: 75,
    prompt: "Rewrite this sentence starting with 'Rarely': 'The lead architect has rarely seen such an elegant algorithmic implementation.'",
    correctAnswers: [
      "Rarely has the lead architect seen such an elegant algorithmic implementation.",
      "Rarely has the lead architect seen such an elegant algorithmic implementation",
      "Rarely has the architect seen such an elegant algorithmic implementation."
    ],
    hint: "Al comenzar con 'Rarely', invierte el auxiliar 'has' antes del sujeto 'the lead architect'.",
    grammarExplanation: "Negative adverbials at the beginning of a clause trigger auxiliary-subject inversion.",
    topNotchUnit: "Summit 2 — Unit 8: Rhetoric and Inversion"
  },
  {
    id: "eng-sum2-02",
    bookLevel: "summit2",
    bookTitle: "Summit 2",
    cefr: "C1",
    week: 6,
    title: "Formal English Subjunctive in Corporate Governance",
    challengeType: "fill_in_the_blank",
    category: "Sentence Structure",
    points: 190,
    targetDurationSeconds: 55,
    prompt: "Complete the formal directive using the English subjunctive of 'be': 'It is mandatory that all source code repository permissions ________ (be) reviewed quarterly.'",
    correctAnswers: ["be", "be."],
    hint: "En el modo subjuntivo en inglés formal tras adjetivos como 'mandatory' o 'essential', el verbo va siempre en su forma base pura ('be'), sin importar el sujeto.",
    grammarExplanation: "The English formal subjunctive uses the bare base form of the verb ('be') in 'that'-clauses expressing urgency or requirement.",
    topNotchUnit: "Summit 2 — Unit 10: Governance and Directives"
  }
];

export const TOP_NOTCH_CHALLENGES: EnglishChallenge[] = ALL_ENGLISH_CHALLENGES.map((ch) => ({
  ...ch,
  type: ch.challengeType,
  levelId: ch.bookLevel,
  levelName: ch.bookTitle,
  unit: ch.topNotchUnit,
  xp: ch.points,
  correctAnswer: ch.correctAnswers[0] || "",
  acceptableAnswers: ch.correctAnswers,
  scrambledWords: ch.scrambledTokens || [],
  grammarPoint: ch.category,
  explanation: ch.grammarExplanation,
  keywords: [ch.category, ch.bookTitle, ch.cefr, ch.topNotchUnit],
}));

export const getEnglishChallengesByWeek = (week: number): EnglishChallenge[] => {
  return ALL_ENGLISH_CHALLENGES.filter((c) => c.week === week);
};

export const getEnglishChallengesByLevel = (bookLevel: EnglishBookLevel): EnglishChallenge[] => {
  return ALL_ENGLISH_CHALLENGES.filter((c) => c.bookLevel === bookLevel);
};
