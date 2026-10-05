export interface EnglishLesson {
  id: string;
  unitNumber: number;
  title: string;
  cefrLevel: string;
  communicativeGoal: string;
  grammarFocus: string;
  vocabularyKeywords: string[];
  explanation: string;
  dialogue: Array<{ speaker: string; text: string; translation: string }>;
  interactiveDrill: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export interface EnglishCourseLevel {
  id: string;
  bookTitle: string;
  code: string;
  cefr: string;
  badgeTone: string;
  description: string;
  lessons: EnglishLesson[];
}

const getEmptyLesson = (unitNumber: number): EnglishLesson => ({
  id: `placeholder-u${unitNumber}`,
  unitNumber,
  title: `Unit ${unitNumber}: Coming soon`,
  cefrLevel: "N/A",
  communicativeGoal: "Completa el contenido de esta unidad.",
  grammarFocus: "TBD",
  vocabularyKeywords: [],
  explanation: "Contenido no disponible.",
  dialogue: [],
  interactiveDrill: {
    question: "¿Próximamente disponible?",
    options: ["Sí", "No"],
    correctAnswer: "Sí",
    explanation: "El contenido está en desarrollo."
  }
});

export const TOP_NOTCH_COURSES: EnglishCourseLevel[] = [
  {
    id: "fundamentals",
    bookTitle: "Top Notch Fundamentals",
    code: "TNF",
    cefr: "A1 - Beginner",
    badgeTone: "from-sky-500 to-blue-600",
    description: "Domina las estructuras base: saludos, presentaciones, verbos esenciales, sustantivos cotidianos.",
    lessons: [
      { id: "tnf-u1", unitNumber: 1, title: "Names and Occupations", cefrLevel: "A1", communicativeGoal: "Presentarse a uno mismo y a otros, deletrear nombres y hablar de profesiones.", grammarFocus: "Verb To Be", vocabularyKeywords: ["Name", "Occupation"], explanation: "Uso del verbo To Be.", dialogue: [{ speaker: "A", text: "Hi, I'm Sarah.", translation: "Hola, soy Sarah." }], interactiveDrill: { question: "Forma correcta?", options: ["I am Sarah.", "I is Sarah."], correctAnswer: "I am Sarah.", explanation: "Uso de am." } },
      { id: "tnf-u2", unitNumber: 2, title: "About People", cefrLevel: "A1", communicativeGoal: "Identificar personas, dar información de contacto y relaciones.", grammarFocus: "Possessive adjectives", vocabularyKeywords: ["Contact", "Relationship"], explanation: "Adjetivos posesivos.", dialogue: [{ speaker: "A", text: "What is his name?", translation: "¿Cuál es su nombre?" }], interactiveDrill: { question: "Correcto?", options: ["His name is John.", "He name is John."], correctAnswer: "His name is John.", explanation: "Uso de His." } },
      { id: "tnf-u3", unitNumber: 3, title: "Places and How to Get There", cefrLevel: "A1", communicativeGoal: "Direcciones físicas, lugares en el vecindario.", grammarFocus: "Prepositions of place", vocabularyKeywords: ["Place", "Neighborhood"], explanation: "Preposiciones.", dialogue: [{ speaker: "A", text: "Where is the bank?", translation: "¿Dónde está el banco?" }], interactiveDrill: { question: "Correcto?", options: ["The bank is on Main Street.", "The bank is in Main Street."], correctAnswer: "The bank is on Main Street.", explanation: "Uso de 'on'." } },
      { id: "tnf-u4", unitNumber: 4, title: "Family", cefrLevel: "A1", communicativeGoal: "Describir miembros de la familia.", grammarFocus: "Possessive 's.", vocabularyKeywords: ["Mother", "Father"], explanation: "Posesivo 's.", dialogue: [{ speaker: "A", text: "This is Sarah's mother.", translation: "Esta es la madre de Sarah." }], interactiveDrill: { question: "Correcto?", options: ["Sarah's mother", "Mother's Sarah"], correctAnswer: "Sarah's mother", explanation: "Sarah's indica posesión." } },
      { id: "tnf-u5", unitNumber: 5, title: "Events and Times", cefrLevel: "A1", communicativeGoal: "Decir la hora, fechas y eventos.", grammarFocus: "What time...?", vocabularyKeywords: ["Time", "Date"], explanation: "Decir la hora.", dialogue: [{ speaker: "A", text: "What time is it?", translation: "¿Qué hora es?" }], interactiveDrill: { question: "Correcto?", options: ["It is 5 PM.", "It are 5 PM."], correctAnswer: "It is 5 PM.", explanation: "It usa is." } },
      { id: "tnf-u6", unitNumber: 6, title: "Clothes", cefrLevel: "A1", communicativeGoal: "Vocabulario de ropa, tallas, colores.", grammarFocus: "This/That/These/Those.", vocabularyKeywords: ["Shirt", "Pants"], explanation: "Demostrativos.", dialogue: [{ speaker: "A", text: "I like this shirt.", translation: "Me gusta esta camisa." }], interactiveDrill: { question: "Correcto?", options: ["This shirt.", "These shirt."], correctAnswer: "This shirt.", explanation: "Singular." } },
      { id: "tnf-u7", unitNumber: 7, title: "Activities", cefrLevel: "A1", communicativeGoal: "Hablar de actividades cotidianas.", grammarFocus: "Simple present.", vocabularyKeywords: ["Work", "Study"], explanation: "Presente.", dialogue: [{ speaker: "A", text: "What do you do?", translation: "¿Qué haces?" }], interactiveDrill: { question: "Correcto?", options: ["I work.", "I working."], correctAnswer: "I work.", explanation: "Simple present." } },
      { id: "tnf-u8", unitNumber: 8, title: "Home and Office", cefrLevel: "A1", communicativeGoal: "Describir casas, oficinas, muebles.", grammarFocus: "There is / There are.", vocabularyKeywords: ["House", "Office"], explanation: "Existencia.", dialogue: [{ speaker: "A", text: "There is a table.", translation: "Hay una mesa." }], interactiveDrill: { question: "Correcto?", options: ["There is a table.", "There are a table."], correctAnswer: "There is a table.", explanation: "Singular." } },
      { id: "tnf-u9", unitNumber: 9, title: "Activities and Plans", cefrLevel: "A1", communicativeGoal: "Hablar de planes futuros.", grammarFocus: "Present continuous.", vocabularyKeywords: ["Doing", "Planning"], explanation: "Continuo.", dialogue: [{ speaker: "A", text: "I am working.", translation: "Estoy trabajando." }], interactiveDrill: { question: "Correcto?", options: ["I am working.", "I work."], correctAnswer: "I am working.", explanation: "Acción en curso." } },
      { id: "tnf-u10", unitNumber: 10, title: "Food", cefrLevel: "A1", communicativeGoal: "Alimentos, frutas, vegetales.", grammarFocus: "Countable/Uncountable.", vocabularyKeywords: ["Food", "Fruit"], explanation: "Contables.", dialogue: [{ speaker: "A", text: "I want an apple.", translation: "Quiero una manzana." }], interactiveDrill: { question: "Correcto?", options: ["An apple.", "A apple."], correctAnswer: "An apple.", explanation: "Sonido vocal." } },
      { id: "tnf-u11", unitNumber: 11, title: "Past Events", cefrLevel: "A1", communicativeGoal: "Hablar de actividades pasadas.", grammarFocus: "Simple past.", vocabularyKeywords: ["Went", "Did"], explanation: "Pasado.", dialogue: [{ speaker: "A", text: "I went home.", translation: "Fui a casa." }], interactiveDrill: { question: "Correcto?", options: ["I went.", "I goed."], correctAnswer: "I went.", explanation: "Irregular." } },
      { id: "tnf-u12", unitNumber: 12, title: "Appearance and Health", cefrLevel: "A1", communicativeGoal: "Aspecto y síntomas.", grammarFocus: "To be/Have/Has.", vocabularyKeywords: ["Tall", "Sick"], explanation: "Salud.", dialogue: [{ speaker: "A", text: "I am sick.", translation: "Estoy enfermo." }], interactiveDrill: { question: "Correcto?", options: ["I am sick.", "I have sick."], correctAnswer: "I am sick.", explanation: "Verbo ser/estar." } },
      { id: "tnf-u13", unitNumber: 13, title: "Abilities and Requests", cefrLevel: "A1", communicativeGoal: "Habilidades y pedir favores.", grammarFocus: "Can/Can't.", vocabularyKeywords: ["Can", "Help"], explanation: "Habilidad.", dialogue: [{ speaker: "A", text: "Can you help?", translation: "¿Puedes ayudar?" }], interactiveDrill: { question: "Correcto?", options: ["Can you?", "You can?"], correctAnswer: "Can you?", explanation: "Pregunta." } },
      { id: "tnf-u14", unitNumber: 14, title: "Life Events", cefrLevel: "A1", communicativeGoal: "Eventos de vida.", grammarFocus: "Future simple.", vocabularyKeywords: ["Birth", "Future"], explanation: "Futuro.", dialogue: [{ speaker: "A", text: "I will study.", translation: "Estudiaré." }], interactiveDrill: { question: "Correcto?", options: ["I will study.", "I study."], correctAnswer: "I will study.", explanation: "Futuro." } }
    ]
  },
  { id: "tn1", bookTitle: "Top Notch 1", code: "TN1", cefr: "A2", badgeTone: "from-blue-500 to-indigo-600", description: "Minimal", lessons: Array.from({ length: 10 }, (_, i) => getEmptyLesson(i + 1)) },
  { id: "tn2", bookTitle: "Top Notch 2", code: "TN2", cefr: "B1", badgeTone: "from-indigo-500 to-violet-600", description: "Minimal", lessons: Array.from({ length: 10 }, (_, i) => getEmptyLesson(i + 1)) },
  { id: "tn3", bookTitle: "Top Notch 3", code: "TN3", cefr: "B1+", badgeTone: "from-violet-500 to-purple-600", description: "Minimal", lessons: Array.from({ length: 10 }, (_, i) => getEmptyLesson(i + 1)) },
  { id: "s1", bookTitle: "Summit 1", code: "S1", cefr: "B2", badgeTone: "from-purple-500 to-fuchsia-600", description: "Minimal", lessons: Array.from({ length: 10 }, (_, i) => getEmptyLesson(i + 1)) },
  { id: "s2", bookTitle: "Summit 2", code: "S2", cefr: "C1", badgeTone: "from-fuchsia-500 to-pink-600", description: "Minimal", lessons: Array.from({ length: 10 }, (_, i) => getEmptyLesson(i + 1)) }
];
