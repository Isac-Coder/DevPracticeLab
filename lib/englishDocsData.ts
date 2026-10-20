export interface GrammarDocSection {
  id: string;
  bookLevelId: "fundamentals" | "tn1" | "tn2" | "tn3" | "summit1" | "summit2";
  bookTitle: string;
  topicTitle: string;
  category: "Verb Tenses" | "Modals & Auxiliaries" | "Sentence Structure" | "Clauses & Conditionals" | "Vocabulary & Mechanics";
  summary: string;
  formula: string;
  rules: string[];
  examples: Array<{ en: string; es: string; note?: string }>;
  commonMistakes: Array<{ wrong: string; correct: string; explanation: string }>;
  topNotchUnitRef: string;
}

export const ENGLISH_GRAMMAR_DOCS: GrammarDocSection[] = [
  // Top Notch 1 (Units)
  { 
    id: "tn1-1", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "Getting Acquainted", 
    category: "Vocabulary & Mechanics", 
    summary: "Conocer gente nueva, presentarse formalmente y dar información personal usando Wh- Questions.", 
    formula: "Wh- word + auxiliary (do/does) + subject + verb (base)?", 
    rules: [
        "Las preguntas Wh- sirven para obtener información específica (identidad, origen, trabajo, etc.).",
        "No uses el auxiliar 'do/does' cuando el verbo principal es 'to be'.",
        "En preguntas de sujeto (ej. Who teaches?), no se utiliza el auxiliar 'do/does'."
    ], 
    examples: [
        { en: "What do you do?", es: "¿A qué te dedicas?" }, 
        { en: "Where are you from?", es: "¿De dónde eres?" },
        { en: "Who teaches your class?", es: "¿Quién enseña tu clase?" }
    ], 
    commonMistakes: [
        { wrong: "Where do you be from?", correct: "Where are you from?", explanation: "Con el verbo 'to be' no se utiliza el auxiliar 'do'." },
        { wrong: "Who does teach your class?", correct: "Who teaches your class?", explanation: "En preguntas donde 'who' actúa como sujeto, no se debe incluir el auxiliar 'does'." }
    ], 
    topNotchUnitRef: "Unit 1" 
  },
  { 
    id: "tn1-2", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "Going Out", 
    category: "Vocabulary & Mechanics", 
    summary: "Sugerir actividades para salir, hablar de gustos musicales y entretenimiento, y coordinar planes.", 
    formula: "Let's/Why don't we + V? / Would you like to + V?", 
    rules: [
        "Usa 'Let's' y 'Why don't we?' para sugerencias informales.",
        "Usa 'Would you like to?' para realizar sugerencias de forma más educada.",
        "Para responder, usa frases como 'Sounds great!' (aceptar) o 'I'd love to, but...' (rechazar educadamente)."
    ], 
    examples: [
        { en: "Let's go to the concert!", es: "¡Vamos al concierto!" }, 
        { en: "Would you like to see a show?", es: "¿Te gustaría ver un espectáculo?" },
        { en: "I'd love to, but I'm busy.", es: "Me encantaría, pero estoy ocupado." }
    ], 
    commonMistakes: [
        { wrong: "Do you like to go?", correct: "Would you like to go?", explanation: "Se usa 'would like' para invitaciones, no 'do you like' (que pregunta por gustos generales)." },
        { wrong: "Let's to go.", correct: "Let's go.", explanation: "'Let's' va seguido del verbo en forma base, sin 'to'." }
    ], 
    topNotchUnitRef: "Unit 2" 
  },
  { 
    id: "tn1-3", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "The Extended Family", 
    category: "Vocabulary & Mechanics", 
    summary: "Hablar de la familia extensa, parentescos y rutinas, usando pronombres posesivos y adverbios de frecuencia.", 
    formula: "Adverb + Verb / Verb + Adverb", 
    rules: [
        "Los pronombres posesivos (mine, yours, hers, etc.) reemplazan al sustantivo para evitar repeticiones.",
        "La posición de los adverbios de frecuencia es antes de los verbos principales, pero después del verbo 'to be'.",
        "Los pronombres posesivos nunca llevan apóstrofe."
    ], 
    examples: [
        { en: "That house is hers.", es: "Esa casa es suya." }, 
        { en: "She is always on time.", es: "Ella siempre es puntual." },
        { en: "We usually eat together.", es: "Usualmente comemos juntos." }
    ], 
    commonMistakes: [
        { wrong: "That house is her's.", correct: "That house is hers.", explanation: "Los pronombres posesivos no llevan apóstrofe." },
        { wrong: "She always is on time.", correct: "She is always on time.", explanation: "El adverbio va después del verbo 'to be'." }
    ], 
    topNotchUnitRef: "Unit 3" 
  },
  { 
    id: "tn1-4", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "Food and Restaurants", 
    category: "Vocabulary & Mechanics", 
    summary: "Ordenar comida en restaurantes, interpretar menús y realizar quejas educadas.", 
    formula: "I'd like / I'll have / Could I...? + item", 
    rules: [
        "Usa 'I'd like' o 'I'll have' para ordenar comida.",
        "Usa 'Could I have...?' para pedir artículos adicionales.",
        "Para quejas, siempre empieza con 'Excuse me' o 'I'm sorry, but...' para sonar educado."
    ], 
    examples: [
        { en: "I'll have the chicken, please.", es: "Pediré el pollo, por favor." }, 
        { en: "Could I have some more water?", es: "¿Podría traerme más agua?" },
        { en: "Excuse me, the soup is cold.", es: "Disculpe, la sopa está fría." }
    ], 
    commonMistakes: [
        { wrong: "I want the chicken.", correct: "I'd like the chicken.", explanation: "'I want' es demasiado directo en un restaurante." },
        { wrong: "The soup is cold. Fix it.", correct: "Excuse me, the soup is cold. Could you heat it up?", explanation: "Las quejas deben ser suaves y educadas en inglés." }
    ], 
    topNotchUnitRef: "Unit 4" 
  },
  { 
    id: "tn1-5", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "Technology and You", 
    category: "Vocabulary & Mechanics", 
    summary: "Uso de dispositivos electrónicos, electrodomésticos y pronombres de objeto.", 
    formula: "Verb + Object Pronoun", 
    rules: [
        "Los pronombres de objeto (me, you, him, her, it, us, them) reciben la acción del verbo.",
        "Van siempre después del verbo principal.",
        "Cuando hay dos objetos, usamos 'it/them' + to + 'person'."
    ], 
    examples: [
        { en: "Can you help me?", es: "¿Puedes ayudarme?" }, 
        { en: "Turn it off.", es: "Apágalo." },
        { en: "Give it to me.", es: "Dámelo." }
    ], 
    commonMistakes: [
        { wrong: "I it fixed.", correct: "I fixed it.", explanation: "El pronombre de objeto va después del verbo." },
        { wrong: "Send me it.", correct: "Send it to me.", explanation: "Con dos objetos, el orden correcto es 'it/them' seguido de 'to' + la persona." }
    ], 
    topNotchUnitRef: "Unit 5" 
  },
  { 
    id: "tn1-6", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "Staying in Shape", 
    category: "Sentence Structure", 
    summary: "Rutinas de ejercicio, hábitos saludables y el uso correcto de gerundios e infinitivos después de verbos.", 
    formula: "Verb + Gerund (-ing) / Verb + Infinitive (to + verb)", 
    rules: [
        "Algunos verbos requieren gerundios (-ing) después (ej. enjoy, avoid).",
        "Otros verbos requieren infinitivos (to + verb) (ej. want, need).",
        "Verbos como 'stop' o 'try' pueden tomar ambos con cambios de significado."
    ], 
    examples: [
        { en: "I enjoy running.", es: "Disfruto correr." }, 
        { en: "I want to lose weight.", es: "Quiero perder peso." },
        { en: "Remember to stretch.", es: "Recuerda estirar." }
    ], 
    commonMistakes: [
        { wrong: "I enjoy to run.", correct: "I enjoy running.", explanation: "El verbo 'enjoy' siempre va seguido de gerundio." },
        { wrong: "I want running.", correct: "I want to run.", explanation: "El verbo 'want' requiere infinitivo." }
    ], 
    topNotchUnitRef: "Unit 6" 
  },
  { 
    id: "tn1-8", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "Shopping for Clothes", 
    category: "Vocabulary & Mechanics", 
    summary: "Comprar ropa, comparar precios y tallas usando comparativos y superlativos.", 
    formula: "Comparative: adj+er than / more + adj + than | Superlative: the + adj+est / the most + adj", 
    rules: [
        "Usa comparativos para comparar dos elementos.",
        "Usa superlativos para destacar un elemento sobre el resto.",
        "Adjetivos cortos añaden -er/-est; adjetivos largos usan 'more'/'the most'."
    ], 
    examples: [
        { en: "This shirt is cheaper than that one.", es: "Esta camisa es más barata que aquella." }, 
        { en: "This is the most expensive dress.", es: "Este es el vestido más caro." }
    ], 
    commonMistakes: [
        { wrong: "This is more cheap.", correct: "This is cheaper.", explanation: "Adjetivos cortos usan el sufijo -er, no 'more'." },
        { wrong: "He is more good.", correct: "He is better.", explanation: "El comparativo de 'good' es 'better', no 'more good'." }
    ], 
    topNotchUnitRef: "Unit 8" 
  },
  { 
    id: "tn1-9", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "Taking Transportation", 
    category: "Modals & Auxiliaries", 
    summary: "Transporte público, compra de boletos y uso de modales de obligación y prohibición.", 
    formula: "S + must / have to / don't have to / mustn't + V", 
    rules: [
        "Usa 'must' y 'have to' para obligaciones.",
        "Usa 'don't have to' cuando algo no es necesario (opcional).",
        "Usa 'mustn't' para prohibiciones explícitas."
    ], 
    examples: [
        { en: "You must show your ticket.", es: "Debes mostrar tu boleto." }, 
        { en: "You don't have to book in advance.", es: "No tienes que reservar con antelación." },
        { en: "You mustn't eat on the metro.", es: "No debes comer en el metro." }
    ], 
    commonMistakes: [
        { wrong: "You don't have to eat here.", correct: "You mustn't eat here.", explanation: "'Don't have to' significa que no es necesario, no que está prohibido." }
    ], 
    topNotchUnitRef: "Unit 9" 
  },
  { 
    id: "tn1-10", 
    bookLevelId: "tn1", 
    bookTitle: "Top Notch 1", 
    topicTitle: "Spending Money", 
    category: "Clauses & Conditionals", 
    summary: "Hábitos de gasto, regateo y uso del primer condicional para situaciones reales.", 
    formula: "If + Present Simple, will + verb (base)", 
    rules: [
        "El primer condicional describe situaciones reales y posibles en el futuro.",
        "La cláusula con 'if' siempre usa Present Simple, nunca 'will'.",
        "El orden de las cláusulas puede invertirse (resultado + if + condición)."
    ], 
    examples: [
        { en: "If I save money, I will buy it.", es: "Si ahorro dinero, lo compraré." }, 
        { en: "I will come back if I find a better price.", es: "Volveré si encuentro un mejor precio." }
    ], 
    commonMistakes: [
        { wrong: "If I will save money, I will buy it.", correct: "If I save money, I will buy it.", explanation: "La cláusula con 'if' usa presente, no futuro." }
    ], 
    topNotchUnitRef: "Unit 10" 
  },
  { 
    id: "tn2-1", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "Getting Acquainted", 
    category: "Verb Tenses", 
    summary: "Reencuentros, experiencias recientes y uso avanzado del Present Perfect.", 
    formula: "S + have/has + past participle", 
    rules: [
        "El Present Perfect se usa para experiencias de vida, cambios recientes y duraciones que continúan hasta el presente.",
        "Usa 'for' con duración (ej. 3 years) y 'since' con puntos específicos en el tiempo (ej. 2022).",
        "Diferencia 'already' (antes de lo esperado) de 'yet' (todavía no)."
    ], 
    examples: [
        { en: "Have you ever lived abroad?", es: "¿Has vivido alguna vez en el extranjero?" }, 
        { en: "I've lived here for three years.", es: "He vivido aquí por tres años." },
        { en: "She hasn't called yet.", es: "Ella todavía no ha llamado." }
    ], 
    commonMistakes: [
        { wrong: "I have lived here since 3 years.", correct: "I have lived here for 3 years.", explanation: "Usa 'for' para duración, 'since' para un punto de inicio." },
        { wrong: "I have saw him.", correct: "I have seen him.", explanation: "Usa el participio pasado, no el pasado simple." }
    ], 
    topNotchUnitRef: "Unit 1" 
  },
  { 
    id: "tn2-2", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "Going to the Movies", 
    category: "Sentence Structure", 
    summary: "Verbos de opinión, reseñas de películas y uso de 'that' en cláusulas.", 
    formula: "S + verb (think/believe/feel) + (that) + clause / S + verb + to + verb (base)", 
    rules: [
        "Verbos de opinión como 'think', 'believe', 'feel' pueden ir seguidos de una cláusula con 'that' (opcional en conversación).",
        "Ciertos verbos pueden ir seguidos directamente de un infinitivo para describir una característica o acción de una obra (ej. seem to, tend to).",
        "El uso de estas estructuras ayuda a dar opiniones más matizadas y sofisticadas."
    ], 
    examples: [
        { en: "I think that the ending was disappointing.", es: "Creo que el final fue decepcionante." }, 
        { en: "The plot seems to fall apart.", es: "La trama parece desmoronarse." },
        { en: "The director managed to tell a complex story.", es: "El director logró contar una historia compleja." }
    ], 
    commonMistakes: [
        { wrong: "I think that the movie is good.", correct: "I think the movie is good.", explanation: "Aunque no es error, el 'that' suele omitirse en inglés hablado para mayor fluidez." },
        { wrong: "The movie seem to be long.", correct: "The movie seems to be long.", explanation: "Tercera persona singular requiere 's'." }
    ], 
    topNotchUnitRef: "Unit 2" 
  },
  { 
    id: "tn2-3", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "Staying in Hotels", 
    category: "Sentence Structure", 
    summary: "Reservar habitaciones, pedir servicios y uso de la voz pasiva para comunicaciones formales.", 
    formula: "S + to be + past participle", 
    rules: [
        "La voz pasiva se usa cuando el foco es la acción, no quien la realiza.",
        "Se forma con el verbo 'to be' conjugado y el participio pasado.",
        "Es común en avisos, políticas y confirmaciones formales de hoteles."
    ], 
    examples: [
        { en: "The rooms are cleaned daily.", es: "Las habitaciones se limpian diariamente." }, 
        { en: "Your room will be upgraded.", es: "Su habitación será mejorada." },
        { en: "Breakfast is included.", es: "El desayuno está incluido." }
    ], 
    commonMistakes: [
        { wrong: "The rooms clean daily.", correct: "The rooms are cleaned daily.", explanation: "Falta el verbo 'to be' y el participio pasado para formar la voz pasiva." }
    ], 
    topNotchUnitRef: "Unit 3" 
  },
  { 
    id: "tn3-3", 
    bookLevelId: "tn3", 
    bookTitle: "Top Notch 3", 
    topicTitle: "Getting Things Done", 
    category: "Modals & Auxiliaries", 
    summary: "Delegar tareas, contratar servicios y uso de modales con el infinitivo perfecto (crítica y arrepentimiento).", 
    formula: "Modal + have + past participle", 
    rules: [
        "Usa 'should have + PP' para expresar que algo debió hacerse pero no se hizo.",
        "Usa 'would have + PP' para consecuencias hipotéticas en el pasado.",
        "Usa 'needn't have + PP' para acciones innecesarias realizadas en el pasado."
    ], 
    examples: [
        { en: "You should have called before.", es: "Debiste haber llamado antes." }, 
        { en: "He would have helped if he'd known.", es: "Él habría ayudado si hubiera sabido." }
    ], 
    commonMistakes: [
        { wrong: "You should of called.", correct: "You should have called.", explanation: "'Should of' es un error común basado en la pronunciación de la contracción 'should've'." }
    ], 
    topNotchUnitRef: "Unit 3" 
  },
  { 
    id: "tn3-4", 
    bookLevelId: "tn3", 
    bookTitle: "Top Notch 3", 
    topicTitle: "Reading for Pleasure", 
    category: "Sentence Structure", 
    summary: "Hábitos de lectura y uso avanzado de gerundios e infinitivos.", 
    formula: "Verb + Preposition + Gerund / Subject + Gerund + Verb", 
    rules: [
        "El gerundio puede funcionar como sujeto de la oración.",
        "Muchos verbos y adjetivos requieren una preposición específica antes del gerundio (ej. interested in, good at).",
        "El infinitivo puede usarse para indicar propósito (para qué)."
    ], 
    examples: [
        { en: "Reading fiction improves empathy.", es: "Leer ficción mejora la empatía." }, 
        { en: "I'm interested in reading more.", es: "Estoy interesado en leer más." }
    ], 
    commonMistakes: [
        { wrong: "I am interested to read.", correct: "I am interested in reading.", explanation: "La estructura correcta es 'adjective + preposition + gerund'." }
    ], 
    topNotchUnitRef: "Unit 4" 
  },
  { 
    id: "tn3-5", 
    bookLevelId: "tn3", 
    bookTitle: "Top Notch 3", 
    topicTitle: "Natural Disasters", 
    category: "Vocabulary & Mechanics", 
    summary: "Reporte de desastres naturales usando voz pasiva y Past Perfect en narrativa.", 
    formula: "S + was/were + PP / S + had + PP", 
    rules: [
        "La voz pasiva enfatiza lo ocurrido, no quién lo realizó.",
        "Usa Past Perfect para indicar acciones que ocurrieron antes de otro evento pasado.",
        "El Past Perfect se usa frecuentemente en narrativas de desastres para establecer secuencias."
    ], 
    examples: [
        { en: "Hundreds of homes were destroyed.", es: "Cientos de casas fueron destruidas." }, 
        { en: "By the time rescuers arrived, the landslide had buried the road.", es: "Cuando llegaron los rescatistas, el derrumbe ya había enterrado la carretera." }
    ], 
    commonMistakes: [
        { wrong: "The road buried the landslide.", correct: "The road was buried by the landslide.", explanation: "El derrumbe entierra la carretera; la carretera es la que recibe la acción (pasiva)." }
    ], 
    topNotchUnitRef: "Unit 5" 
  },
  { 
    id: "tn3-6", 
    bookLevelId: "tn3", 
    bookTitle: "Top Notch 3", 
    topicTitle: "Life Plans", 
    category: "Verb Tenses", 
    summary: "Planes de vida, cambios de planes pasados (Future in the Past) y condicionales mixtos.", 
    formula: "was/were going to / was supposed to / had planned to + V", 
    rules: [
        "El 'futuro en el pasado' expresa planes que cambiaron o no se concretaron.",
        "Usa condicionales mixtos para hablar de causas pasadas con consecuencias presentes.",
        "Usa 'was supposed to' para expectativas que no se cumplieron."
    ], 
    examples: [
        { en: "I was going to study abroad, but I changed my mind.", es: "Iba a estudiar en el extranjero, pero cambié de opinión." }, 
        { en: "If I had studied CS, I would be further along now.", es: "Si hubiera estudiado CS, estaría más adelantado ahora." }
    ], 
    commonMistakes: [
        { wrong: "I was going to applied.", correct: "I was going to apply.", explanation: "Después de 'going to' se usa el verbo en forma base." }
    ], 
    topNotchUnitRef: "Unit 6" 
  },
  { 
    id: "tn3-7", 
    bookLevelId: "tn3", 
    bookTitle: "Top Notch 3", 
    topicTitle: "Holidays and Traditions", 
    category: "Vocabulary & Mechanics", 
    summary: "Tradiciones culturales y expresiones para hacer generalizaciones y comparaciones culturales.", 
    formula: "Generalized Expression + Cultural Topic", 
    rules: [
        "Las generalizaciones culturales deben ser precisas y evitar términos absolutos como 'always' o 'never'.",
        "Usa conectores de contraste como 'In contrast to', 'Unlike', y 'While' para comparar culturas.",
        "Utiliza expresiones que reconozcan la diversidad interna (ej. 'In many parts of...')."
    ], 
    examples: [
        { en: "People in Colombia tend to value collective celebrations.", es: "La gente en Colombia tiende a valorar las celebraciones colectivas." }, 
        { en: "Unlike the US, Colombia doesn't celebrate Thanksgiving.", es: "A diferencia de EE.UU., Colombia no celebra el Día de Acción de Gracias." }
    ], 
    commonMistakes: [
        { wrong: "Colombians always like parties.", correct: "People in Colombia tend to enjoy celebrations.", explanation: "Evita generalizaciones absolutas como 'always'; usa 'tend to' para mayor precisión." }
    ], 
    topNotchUnitRef: "Unit 7" 
  },
  { 
    id: "tn3-8", 
    bookLevelId: "tn3", 
    bookTitle: "Top Notch 3", 
    topicTitle: "Inventions and Discoveries", 
    category: "Sentence Structure", 
    summary: "Inventos históricos y uso de la voz pasiva en diferentes tiempos verbales.", 
    formula: "S + be + past participle", 
    rules: [
        "La voz pasiva se usa cuando el foco está en la acción o el objeto, no en el agente.",
        "Puede formarse en prácticamente todos los tiempos verbales (presente, pasado, futuro, perfectos).",
        "Es el estilo preferido para descripciones históricas y científicas."
    ], 
    examples: [
        { en: "The printing press was invented in 1440.", es: "La imprenta fue inventada en 1440." }, 
        { en: "A new vaccine is being developed.", es: "Una nueva vacuna está siendo desarrollada." }
    ], 
    commonMistakes: [
        { wrong: "The printing press invented in 1440.", correct: "The printing press was invented in 1440.", explanation: "Para la voz pasiva, es obligatorio incluir el verbo 'to be' conjugado." }
    ], 
    topNotchUnitRef: "Unit 8" 
  },
];
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "Cars and Driving", 
    category: "Clauses & Conditionals", 
    summary: "Rentar autos, accidentes viales y uso del segundo condicional para situaciones hipotéticas.", 
    formula: "If + Past Simple, would + verb (base)", 
    rules: [
        "El segundo condicional habla de situaciones hipotéticas o irreales en el presente/futuro.",
        "En la cláusula 'if' se usa el pasado simple.",
        "Para el verbo 'to be' en el segundo condicional, se prefiere 'were' para todos los sujetos."
    ], 
    examples: [
        { en: "If I had a car, I would commute faster.", es: "Si tuviera un carro, viajaría más rápido." }, 
        { en: "If I were you, I wouldn't drive.", es: "Si yo fuera tú, no conduciría." }
    ], 
    commonMistakes: [
        { wrong: "If I have a car, I would drive.", correct: "If I had a car, I would drive.", explanation: "El segundo condicional requiere pasado simple en la cláusula 'if'." },
        { wrong: "If I was you...", correct: "If I were you...", explanation: "En el segundo condicional, 'were' es la forma preferida para todos los sujetos." }
    ], 
    topNotchUnitRef: "Unit 4" 
  },
  { 
    id: "tn2-5", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "Personal Care and Appearance", 
    category: "Sentence Structure", 
    summary: "Rutinas de cuidado personal y uso del causativo para servicios realizados por terceros.", 
    formula: "S + get/have + object + past participle", 
    rules: [
        "El causativo expresa que alguien hace una acción por ti.",
        "Usa 'get' para contextos conversacionales e informales.",
        "Usa 'have' para contextos más formales o escritos."
    ], 
    examples: [
        { en: "I got my hair cut.", es: "Me cortaron el pelo (alguien más lo hizo)." }, 
        { en: "She has her eyebrows done.", es: "Ella se hace las cejas profesionalmente." }
    ], 
    commonMistakes: [
        { wrong: "I cut my hair.", correct: "I got my hair cut.", explanation: "Si alguien más te cortó el pelo, usa la estructura causativa 'got ... cut', no la forma activa." }
    ], 
    topNotchUnitRef: "Unit 5" 
  },
  { 
    id: "tn2-6", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "Eating Well", 
    category: "Verb Tenses", 
    summary: "Hábitos alimenticios y uso de 'used to' y 'would' para hábitos pasados.", 
    formula: "S + used to / would + verb (base)", 
    rules: [
        "Usa 'used to' para hábitos o estados pasados que ya no ocurren.",
        "Usa 'would' solo para hábitos pasados (acciones repetidas), no para estados.",
        "En negaciones y preguntas, usa 'use to' (sin 'd') con el auxiliar 'did'."
    ], 
    examples: [
        { en: "I used to eat fast food.", es: "Solía comer comida rápida." }, 
        { en: "She would visit her grandma often.", es: "Ella visitaba a su abuela a menudo." }
    ], 
    commonMistakes: [
        { wrong: "I didn't used to eat it.", correct: "I didn't use to eat it.", explanation: "Con el auxiliar 'did/didn't', el verbo regresa a su forma base 'use'." }
    ], 
    topNotchUnitRef: "Unit 6" 
  },
  { 
    id: "tn2-7", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "About Personality", 
    category: "Sentence Structure", 
    summary: "Descripciones de personalidad y uso de cláusulas de relativo (defining vs non-defining).", 
    formula: "S + (relative clause) + V", 
    rules: [
        "Las cláusulas de relativo añaden información sin repetir el sujeto.",
        "Defining clauses (sin comas) son esenciales para identificar a la persona.",
        "Non-defining clauses (con comas) dan información extra prescindible."
    ], 
    examples: [
        { en: "A person who never admits mistakes is hard to work with.", es: "Una persona que nunca admite sus errores es difícil de tratar." }, 
        { en: "My manager, who is empathetic, always listens.", es: "Mi gerente, quien es empático, siempre escucha." }
    ], 
    commonMistakes: [
        { wrong: "The person who she is tall.", correct: "The person who is tall.", explanation: "No repitas el sujeto dentro de la cláusula de relativo." }
    ], 
    topNotchUnitRef: "Unit 7" 
  },
  { 
    id: "tn2-8", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "The Arts", 
    category: "Vocabulary & Mechanics", 
    summary: "Arte, opiniones subjetivas y uso de estilo indirecto (reported speech).", 
    formula: "S + said/told/mentioned + (that) + S + verb(shifted)", 
    rules: [
        "En el estilo indirecto (reported speech), si el verbo de reporte está en pasado, el verbo de la cita retrocede un tiempo verbal.",
        "'That' es opcional tras los verbos de reporte.",
        "Reporta lo que otros dicen sobre el arte usando verbos precisos."
    ], 
    examples: [
        { en: "She said she loved the painting.", es: "Ella dijo que amaba la pintura." }, 
        { en: "He explained the colors symbolized conflict.", es: "Él explicó que los colores simbolizaban conflicto." }
    ], 
    commonMistakes: [
        { wrong: "She said she loves the painting.", correct: "She said she loved the painting.", explanation: "Si el verbo de reporte ('said') está en pasado, la cita debe retroceder en el tiempo." }
    ], 
    topNotchUnitRef: "Unit 8" 
  },
  { 
    id: "tn2-9", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "Living in Cyberspace", 
    category: "Clauses & Conditionals", 
    summary: "Hábitos digitales y uso de conectores de discurso para argumentar.", 
    formula: "Connector + Clause", 
    rules: [
        "Los conectores de discurso (however, therefore, although, etc.) unen ideas y dan coherencia.",
        "Diferencia conectores de contraste (however, although) de causa/consecuencia (because, therefore).",
        "Muchos conectores formales requieren puntuación específica, como la coma."
    ], 
    examples: [
        { en: "Social media connects people. However, it increases anxiety.", es: "Las redes sociales conectan gente. Sin embargo, aumentan la ansiedad." }, 
        { en: "Although the internet is useful, it has risks.", es: "Aunque internet es útil, tiene riesgos." }
    ], 
    commonMistakes: [
        { wrong: "Although internet is useful, but it has risks.", correct: "Although the internet is useful, it has risks.", explanation: "No uses 'but' si ya usaste 'although'." }
    ], 
    topNotchUnitRef: "Unit 9" 
  },
  { 
    id: "tn2-10", 
    bookLevelId: "tn2", 
    bookTitle: "Top Notch 2", 
    topicTitle: "Ethics and Values", 
    category: "Clauses & Conditionals", 
    summary: "Dilemas morales y uso del tercer condicional para reflexiones sobre el pasado.", 
    formula: "If + Past Perfect, would have + past participle", 
    rules: [
        "El tercer condicional habla de situaciones irreales en el pasado.",
        "Se usa para reflexionar sobre consecuencias de acciones que no ocurrieron.",
        "La cláusula con 'if' usa Past Perfect (had + PP) y la principal usa 'would have' + PP."
    ], 
    examples: [
        { en: "If I had known the truth, I would have acted differently.", es: "Si hubiera sabido la verdad, habría actuado diferente." }, 
        { en: "She would have told him if she had seen him.", es: "Ella se lo habría dicho si lo hubiera visto." }
    ], 
    commonMistakes: [
        { wrong: "If I would have known, I had acted.", correct: "If I had known, I would have acted.", explanation: "La estructura correcta es 'If + had + PP' y 'would have + PP'." }
    ], 
    topNotchUnitRef: "Unit 10" 
  },
  { 
    id: "sum2-6", 
    bookLevelId: "summit2", 
    bookTitle: "Summit 2", 
    topicTitle: "Troubles While Traveling", 
    category: "Modals &amp; Auxiliaries", 
    summary: "Reclamaciones formales, derechos del viajero y uso de estructuras de exigencia con subjuntivo.", 
    formula: "Verb of demand/insistence + that + subject + verb (base)", 
    rules: [
        "Las reclamaciones formales escalan desde la descripción del problema hasta una demanda concreta.",
        "Se utiliza el subjuntivo formal (forma base del verbo) después de verbos como 'insist', 'demand', 'require'.",
        "El uso de pasiva y reported speech es frecuente para dar profesionalismo y objetividad."
    ], 
    examples: [
        { en: "I insist that a full refund be issued.", es: "Insisto en que se emita un reembolso completo." }, 
        { en: "Should this matter not be resolved, I will escalate.", es: "Si este asunto no se resuelve, escalaré." },
        { en: "Your agent assured me that compensation would be processed.", es: "Su agente me aseguró que la compensación sería procesada." }
    ], 
    commonMistakes: [
        { wrong: "I demand that he pays.", correct: "I demand that he pay.", explanation: "En subjuntivo formal, el verbo siempre es la forma base sin 's'." }
    ], 
    topNotchUnitRef: "Unit 6" 
  },
  { 
    id: "sum2-7", 
    bookLevelId: "summit2", 
    bookTitle: "Summit 2", 
    topicTitle: "Mind Over Matter", 
    category: "Clauses &amp; Conditionals", 
    summary: "Cognición, sesgos cognitivos y estructuras avanzadas de especulación.", 
    formula: "Modal + have + past participle / Seem/Appear + perfect infinitive", 
    rules: [
        "Se utilizan modales perfectos para especulaciones sobre hechos pasados.",
        "Estructuras como 'Were memory to...' o 'Had the study been...' añaden formalidad a la especulación.",
        "Se usan cláusulas de distancia epistémica para expresar grados de certeza."
    ], 
    examples: [
        { en: "She may have underestimated the complexity.", es: "Ella puede haber subestimado la complejidad." }, 
        { en: "The theory appears to have been misapplied.", es: "La teoría parece haber sido mal aplicada." },
        { en: "Had the study included a larger sample, results might have been different.", es: "Si el estudio hubiera incluido una muestra más grande, los resultados podrían haber sido diferentes." }
    ], 
  { 
    id: "sum2-8", 
    bookLevelId: "summit2", 
    bookTitle: "Summit 2", 
    topicTitle: "Performing at Your Best", 
    category: "Vocabulary & Mechanics", 
    summary: "Estrategias de alto rendimiento, manejo del estrés y estructuras de matización complejas.", 
    formula: "Complex sentence structure with nuanced connectors", 
    rules: [
        "Las estructuras de C1 permiten expresar condiciones, límites y paradojas de manera sofisticada.",
        "Se utilizan conectores como 'the extent to which', 'in so far as' y 'provided that' para matizar argumentos.",
        "El lenguaje de alto rendimiento evita simplificaciones y reconoce la complejidad de factores individuales y contextuales."
    ], 
    examples: [
        { en: "The extent to which willpower is finite remains debated.", es: "El grado en que la fuerza de voluntad es finita sigue siendo debatido." }, 
        { en: "Provided that the fundamentals are in place, any system works.", es: "Siempre que los fundamentos estén en su lugar, cualquier sistema funciona." },
        { en: "While the evidence supports X, it is worth noting that...", es: "Aunque la evidencia apoya X, vale la pena notar que..." }
    ], 
    commonMistakes: [
        { wrong: "The more you pursue X, the more elusive becomes.", correct: "The more you pursue X, the more elusive it becomes.", explanation: "En esta estructura, el sujeto 'it' es necesario." }
    ], 
    topNotchUnitRef: "Unit 8" 
  },
  { 
    id: "sum2-9", 
    bookLevelId: "summit2", 
    bookTitle: "Summit 2", 
    topicTitle: "What Lies Ahead", 
    category: "Verb Tenses", 
    summary: "Predicciones futuras, uso del futuro perfecto y estructuras predictivas avanzadas.", 
    formula: "S + will have + past participle / S + will be + verb-ing", 
    rules: [
        "El Future Perfect predice acciones completadas en un punto futuro.",
        "El Future Continuous describe acciones en curso en un momento futuro.",
        "Se utilizan expresiones como 'is set to', 'is poised to', 'is likely to' para indicar niveles de certeza y probabilidad."
    ], 
    examples: [
        { en: "By 2050, AI will have transformed most cognitive work.", es: "Para 2050, la IA habrá transformado la mayoría del trabajo cognitivo." }, 
        { en: "In 2040, most developers will be working alongside AI.", es: "En 2040, la mayoría de los desarrolladores estarán trabajando junto a sistemas de IA." },
        { en: "Quantum computing is poised to disrupt encryption.", es: "La computación cuántica está lista para revolucionar el cifrado." }
    ], 
    commonMistakes: [
        { wrong: "AI is set transform.", correct: "AI is set to transform.", explanation: "La estructura requiere el infinitivo 'to'." }
    ], 
    topNotchUnitRef: "Unit 9" 
  },
  { 
    id: "sum2-10", 
    bookLevelId: "summit2", 
    bookTitle: "Summit 2", 
    topicTitle: "An Interconnected World", 
    category: "Clauses & Conditionals", 
    summary: "Integración de estructuras de C1 para argumentación sofisticada sobre globalización.", 
    formula: "Integrated C1 structures", 
    rules: [
        "La integración de C1 combina cleft sentences, inversión retórica, subjuntivo y concesión avanzada.",
        "El debate de temas complejos requiere el uso preciso de conectores de contraste y estructuras de matización.",
        "La voz pasiva, el reported speech y los condicionales se utilizan para construir argumentos coherentes y objetivos."
    ], 
    examples: [
        { en: "It is precisely this interdependence that makes unilateral solutions impossible.", es: "Es precisamente esta interdependencia lo que hace imposibles las soluciones unilaterales." }, 
        { en: "Never before has the world been so connected.", es: "Nunca antes el mundo había estado tan conectado." },
        { en: "Were global supply chains to fragment permanently, the cost would be immense.", es: "Si las cadenas de suministro globales se fragmentaran permanentemente, el costo sería inmenso." }
    ], 
    commonMistakes: [
        { wrong: "Never the world has been so connected.", correct: "Never has the world been so connected.", explanation: "La inversión retórica requiere cambiar el orden de sujeto y auxiliar." }
    ], 
    topNotchUnitRef: "Unit 10" 
  },
  { 
    id: "tn3-1", 
    bookLevelId: "tn3", 
    bookTitle: "Top Notch 3", 
    topicTitle: "Make Small Talk", 
    category: "Vocabulary & Mechanics", 
    summary: "Reglas de cortesía, entablar conversaciones breves y uso de question tags.", 
    formula: "Statement + question tag / Follow-up", 
    rules: [
        "Usa question tags para invitar a participar al interlocutor (Afirmativa -> negativa, Negativa -> afirmativa).",
        "Las respuestas de seguimiento muestran interés y mantienen la conversación activa.",
        "Elige temas apropiados según el contexto social."
    ], 
    examples: [
        { en: "You're from here, aren't you?", es: "Eres de aquí, ¿verdad?" }, 
        { en: "It's a nice day, isn't it?", es: "Es un lindo día, ¿no?" },
        { en: "Really? Tell me more about that.", es: "¿En serio? Cuéntame más sobre eso." }
    ], 
    commonMistakes: [
        { wrong: "You're from here, isn't you?", correct: "You're from here, aren't you?", explanation: "El question tag debe concordar con el sujeto y el verbo principal." }
    ], 
    topNotchUnitRef: "Unit 1" 
  },
  { 
    id: "tn3-2", 
    bookLevelId: "tn3", 
    bookTitle: "Top Notch 3", 
    topicTitle: "Health Matters", 
    category: "Sentence Structure", 
    summary: "Síntomas médicos, instrucciones y uso del subjuntivo para recomendaciones.", 
    formula: "Verb (recommend/suggest) + that + S + V(base form)", 
    rules: [
        "El subjuntivo se usa tras verbos como recommend, suggest, insist.",
        "El verbo en la cláusula 'that' siempre va en forma base (sin -s ni cambio de tiempo).",
        "Alternativamente, se puede usar gerundio para sonar menos formal."
    ], 
    examples: [
        { en: "The doctor recommended that she rest.", es: "El doctor recomendó que ella descanse." }, 
        { en: "I suggest taking ibuprofen.", es: "Sugiero tomar ibuprofeno." }
    ], 
    commonMistakes: [
        { wrong: "The doctor recommended that she rests.", correct: "The doctor recommended that she rest.", explanation: "El subjuntivo en inglés requiere la forma base del verbo, sin -s en tercera persona." }
    ], 
    topNotchUnitRef: "Unit 2" 
  },
];
