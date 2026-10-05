export interface TopNotchLevel {
  id: string;
  bookTitle: string;
  shortName: string;
  cefrLevel: string;
  targetAudience: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  coreGrammar: string[];
  vocabularyThemes: string[];
  unitCount: number;
}

export const TOP_NOTCH_LEVELS: TopNotchLevel[] = [
  {
    id: "fundamentals",
    bookTitle: "Top Notch Fundamentals",
    shortName: "Fundamentals (A1)",
    cefrLevel: "A1 (Beginner)",
    targetAudience: "Fundamentos esenciales de comunicación y gramática inicial.",
    accentColor: "from-sky-500 to-blue-600",
    badgeBg: "bg-sky-500/10",
    badgeBorder: "border-sky-500/30",
    badgeText: "text-sky-400",
    description: "Saludos, presentaciones, verbo To Be, posesivos, sustantivos singulares/plurales, preguntas con WH, horas, lugares y rutinas simples.",
    coreGrammar: [
      "Verbo To Be (afirmativo, negativo e interrogativo)",
      "Pronombres de sujeto y adjetivos posesivos (my, your, his, her)",
      "Artículos a/an y sustantivos plurales regulares e irregulares",
      "Demostrativos (this, that, these, those)",
      "There is / There are y preposiciones de lugar",
      "Presente Simple con rutinas básicas y preguntas con Do/Does"
    ],
    vocabularyThemes: ["Nombres y ocupaciones", "Nacionalidades", "Familia", "Ropa y colores", "Lugares en la ciudad", "Comida y restaurantes"],
    unitCount: 14
  },
  {
    id: "tn1",
    bookTitle: "Top Notch 1",
    shortName: "Top Notch 1 (A2)",
    cefrLevel: "A2 (Elementary)",
    targetAudience: "Comunicación práctica diaria y consolidación de tiempos presentes y pasados.",
    accentColor: "from-blue-500 to-indigo-600",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/30",
    badgeText: "text-blue-400",
    description: "Presente Simple vs Presente Continuo, Pasado Simple (regular/irregular), 'Be going to' para planes futuros, adjetivos comparativos y superlativos.",
    coreGrammar: [
      "Presente Continuo vs Presente Simple",
      "Pasado Simple de Be (was / were) y verbos regulares/irregulares",
      "Futuro con Be going to y Presente Continuo para el futuro",
      "Sustantivos contables y no contables (some, any, much, many)",
      "Comparativos y superlativos con adjetivos cortos y largos",
      "Modales de habilidad y permiso (can, could, may)"
    ],
    vocabularyThemes: ["Conocer gente nueva", "Salidas y entretenimiento", "Direcciones y transporte", "Viajes y hoteles", "Salud y síntomas"],
    unitCount: 10
  },
  {
    id: "tn2",
    bookTitle: "Top Notch 2",
    shortName: "Top Notch 2 (B1)",
    cefrLevel: "B1 (Pre-Intermediate / Intermediate)",
    targetAudience: "Interacción fluida, experiencias de vida y precisión estructural.",
    accentColor: "from-cyan-500 to-teal-600",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-400",
    description: "Presente Perfecto (experiencias pasadas con ever/never, already/yet, since/for), modales de obligación, infinitivos y gerundios, condicionales reales.",
    coreGrammar: [
      "Presente Perfecto con 'ever', 'never', 'already', 'yet'",
      "Presente Perfecto vs Pasado Simple con 'since' y 'for'",
      "Modales de obligación y consejo: must, have to, should, ought to",
      "Verbos seguidos de gerundio e infinitivo",
      "Comparaciones con 'as... as' y cuantificadores 'too' / 'enough'",
      "Primer Condicional (Real Conditionals con if / unless)"
    ],
    vocabularyThemes: ["Experiencias y películas", "Cuidado personal y belleza", "Servicios y reparaciones", "Comida y cocina internacional", "Tecnología y computación"],
    unitCount: 10
  },
  {
    id: "tn3",
    bookTitle: "Top Notch 3",
    shortName: "Top Notch 3 (B1+)",
    cefrLevel: "B1+ (Intermediate / Upper-Intermediate)",
    targetAudience: "Dominio de estructuras complejas, voz pasiva y lenguaje indirecto.",
    accentColor: "from-indigo-500 to-purple-600",
    badgeBg: "bg-indigo-500/10",
    badgeBorder: "border-indigo-500/30",
    badgeText: "text-indigo-400",
    description: "Voz Pasiva en todos los tiempos, Segundo Condicional (situaciones irreales), Cláusulas relativas (who, which, that), Preguntas indirectas y Reported Speech.",
    coreGrammar: [
      "Voz Pasiva (Presente, Pasado y Modales: is done, was made, can be used)",
      "Segundo Condicional (Unreal Conditional: If + Past, would + Verb)",
      "Cláusulas relativas restrictivas y no restrictivas (who, that, which, whose)",
      "Preguntas indirectas y cortesía profesional (Do you know where...?)",
      "Discurso Indirecto (Reported Speech: Say vs Tell, cambio de tiempos verbales)",
      "Tag Questions (isn't it?, do you?, haven't they?)"
    ],
    vocabularyThemes: ["Costumbres culturales y etiqueta", "Salud, medicina y cirugía", "Problemas urbanos y tráfico", "Arte, pintura y escultura", "Valores y dilemas éticos"],
    unitCount: 10
  },
  {
    id: "summit1",
    bookTitle: "Summit 1",
    shortName: "Summit 1 (B2)",
    cefrLevel: "B2 (Upper-Intermediate / Advanced)",
    targetAudience: "Fluidez avanzada, matices gramaticales y persuasión argumentativa.",
    accentColor: "from-blue-600 to-cyan-500",
    badgeBg: "bg-blue-600/10",
    badgeBorder: "border-blue-600/30",
    badgeText: "text-blue-300",
    description: "Tercer Condicional y Condicionales Mixtos, Pasado Perfecto Continuo, Modales de deducción (must have been, could have happened), Phrasal Verbs separables.",
    coreGrammar: [
      "Pasado Perfecto y Pasado Perfecto Continuo (had been doing)",
      "Modales de especulación pasada (must have, might have, couldn't have)",
      "Tercer Condicional (If + Past Perfect, would have + V3)",
      "Condicionales Mixtos (Pasado y Presente combinados)",
      "Phrasal Verbs transitivos e intransitivos (separables/inseparables)",
      "Cláusulas concesivas y de contraste (Although, Despite, In spite of, Whereas)"
    ],
    vocabularyThemes: ["Personalidad y psicología", "Música, emoción y arte sonoro", "Finanzas personales y gastos", "Ropa y estilo de vida moderno", "Comunidades y hábitat urbano"],
    unitCount: 10
  },
  {
    id: "summit2",
    bookTitle: "Summit 2",
    shortName: "Summit 2 (C1)",
    cefrLevel: "C1 (Advanced / Proficiency)",
    targetAudience: "Inglés profesional, retórica avanzada, inversiones y debates complejos.",
    accentColor: "from-sky-400 to-indigo-500",
    badgeBg: "bg-sky-400/10",
    badgeBorder: "border-sky-400/30",
    badgeText: "text-sky-300",
    description: "Inversiones sintácticas enfáticas (Not only..., Seldom...), Subjuntivo en inglés formal, Cláusulas de participio, Discurso persuasivo y conectores académicos.",
    coreGrammar: [
      "Inversión sintáctica negativa y enfática (Rarely have I seen..., Under no circumstances...)",
      "Modo Subjuntivo en inglés (It is essential that he be informed...)",
      "Cláusulas de participio (Having finished the report, she left...)",
      "Cleft Sentences para énfasis (What we need is..., It was John who...)",
      "Estructuras causativas avanzadas (Have something done, Get someone to do)",
      "Modales complejos de probabilidad y certeza con voz pasiva continua"
    ],
    vocabularyThemes: ["Sueños y misterios de la mente", "Liderazgo, poder y política global", "Humor, ironía y sarcasmo", "Animales y ética biológica", "Ciencia ficción, futuro y tecnología espacial"],
    unitCount: 10
  }
];

export interface EnglishRankingBadge {
  id: string;
  name: string;
  level: string;
  requiredXp: number;
  icon: string;
  description: string;
}

export const TOP_NOTCH_BADGES: EnglishRankingBadge[] = [
  {
    id: "starter",
    name: "Fundamentals Explorer",
    level: "A1",
    requiredXp: 100,
    icon: "🌱",
    description: "Completó los primeros retos de Top Notch Fundamentals."
  },
  {
    id: "communicator",
    name: "Top Notch 1 Speaker",
    level: "A2",
    requiredXp: 300,
    icon: "💬",
    description: "Domina el Presente Continuo, Pasado Simple y vocabulario práctico."
  },
  {
    id: "navigator",
    name: "Top Notch 2 Intermediate",
    level: "B1",
    requiredXp: 650,
    icon: "🧭",
    description: "Fluidez con Presente Perfecto, modales y situaciones cotidianas."
  },
  {
    id: "architect",
    name: "Top Notch 3 Fluent",
    level: "B1+",
    requiredXp: 1100,
    icon: "🏛️",
    description: "Manejo sólido de Voz Pasiva, Segundo Condicional y Reported Speech."
  },
  {
    id: "summit_scholar",
    name: "Summit 1 Advanced",
    level: "B2",
    requiredXp: 1800,
    icon: "🏔️",
    description: "Dominio de Condicionales Mixtos, deducción pasada y argumentación."
  },
  {
    id: "master",
    name: "Summit 2 Master",
    level: "C1",
    requiredXp: 2800,
    icon: "👑",
    description: "Máximo rango de proficiencia: Inversión, Subjuntivo y retórica impecable."
  }
];
