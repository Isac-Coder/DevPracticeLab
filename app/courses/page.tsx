"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Container,
  Database,
  LockKeyhole,
  Network,
  Play,
  Server,
  Terminal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/AuthContext";

type ModuleId = "ssh" | "docker" | "postgres" | "typescript";
type LevelName = "Principiante" | "Básico" | "Normal" | "Avanzado" | "Experto";

interface Lesson {
  title: string;
  description: string;
  topics: string[];
  exercise: string;
}

interface CourseModule {
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  tone: string;
  route: string;
  levels: Record<LevelName, Lesson[]>;
}

const levels: LevelName[] = ["Principiante", "Básico", "Normal", "Avanzado", "Experto"];

const foundations: Lesson[] = [
  {
    title: "Pensamiento lógico y resolución de problemas",
    description:
      "Programar consiste en convertir un problema en pasos claros. Antes de usar una herramienta, identifica qué dato tienes, qué resultado necesitas y qué reglas conectan ambos.",
    topics: ["Entradas y resultados", "Dividir un problema", "Orden de instrucciones"],
    exercise: "Describe los pasos para preparar una copia de seguridad, desde elegir los archivos hasta comprobar que se guardó.",
  },
  {
    title: "Qué es un algoritmo",
    description:
      "Un algoritmo es una secuencia finita y ordenada de instrucciones que resuelve una tarea. Puede escribirse en lenguaje cotidiano o pseudocódigo antes de traducirlo a comandos o código.",
    topics: ["Secuencia", "Pseudocódigo", "Casos límite"],
    exercise: "Escribe un algoritmo que reciba una temperatura y diga si hace frío, es templado o hace calor.",
  },
  {
    title: "Variables, decisiones y repetición",
    description:
      "Las variables guardan información; las condiciones permiten elegir un camino y los bucles repiten una acción. Estas ideas aparecen en scripts, consultas, configuraciones y programas.",
    topics: ["Datos y variables", "Condiciones si/entonces", "Bucles"],
    exercise: "Diseña los pasos para revisar una lista de tareas y marcar como completa cada tarea terminada.",
  },
  {
    title: "Errores y comprobación de resultados",
    description:
      "Un resultado correcto no se da por supuesto: se verifica. Aprende a leer mensajes de error, aislar una causa y probar una solución pequeña cada vez.",
    topics: ["Mensajes de error", "Pruebas pequeñas", "Verificación"],
    exercise: "Elige uno de los algoritmos anteriores y añade una comprobación para entradas vacías o inválidas.",
  },
];

const lesson = (title: string, description: string, topics: string[], exercise: string): Lesson => ({
  title,
  description,
  topics,
  exercise,
});

const courses: Record<ModuleId, CourseModule> = {
  ssh: {
    title: "SSH",
    eyebrow: "Acceso remoto",
    icon: Server,
    tone: "emerald",
    route: "/ssh",
    levels: {
      Principiante: [
        ...foundations,
        lesson("Primer contacto con la terminal", "La terminal permite dar instrucciones al sistema mediante texto. Cada comando realiza una acción y puede recibir opciones y argumentos.", ["Comando", "Opción", "Argumento"], "Explica qué información necesitas antes de conectarte a un servidor remoto."),
        lesson("Qué es una conexión SSH", "SSH crea un canal cifrado para administrar un equipo a distancia. El usuario, el servidor y el método de autenticación determinan quién puede entrar.", ["Cliente y servidor", "Usuario remoto", "Conexión cifrada"], "Separa en una línea el usuario y el host de la conexión ssh admin@servidor.ejemplo.com."),
      ],
      Básico: [
        lesson("Conectarse y moverse por el servidor", "Conecta con ssh y reconoce comandos seguros para saber quién eres y dónde estás antes de cambiar archivos.", ["ssh", "whoami", "pwd", "ls"], "Conéctate al servidor de práctica y comprueba usuario, ruta y archivos disponibles."),
        lesson("Copiar archivos de forma segura", "SCP transfiere archivos usando SSH. Las rutas locales y remotas deben distinguirse para evitar copiar en la dirección equivocada.", ["scp", "Rutas", "Transferencias"], "Escribe el comando para copiar un archivo local a /tmp en el servidor remoto."),
      ],
      Normal: [
        lesson("Autenticación con claves", "Un par de claves permite autenticarse sin enviar la clave privada al servidor. La clave pública se instala en la cuenta remota.", ["ssh-keygen", "Clave pública", "Clave privada"], "Genera un par Ed25519 y explica cuál de los archivos nunca debes compartir."),
        lesson("Permisos y archivos de configuración", "SSH rechaza claves expuestas. Los permisos del directorio .ssh y de authorized_keys deben limitar quién puede leerlos.", ["chmod 700", "chmod 600", "~/.ssh/config"], "Ajusta los permisos recomendados para ~/.ssh y authorized_keys."),
      ],
      Avanzado: [
        lesson("Túneles y reenvío de puertos", "El reenvío conecta un puerto local o remoto a un servicio accesible desde otra máquina, sin exponerlo directamente a Internet.", ["-L local", "-R remoto", "Puertos"], "Plantea un túnel local desde el puerto 8080 hacia el puerto 3000 del servidor."),
        lesson("ProxyJump y bastiones", "Un bastion host es un punto de entrada controlado. ProxyJump permite saltar por él manteniendo una configuración legible.", ["-J", "Bastion", "Control de acceso"], "Escribe una conexión SSH que llegue a una máquina privada a través del bastion."),
      ],
      Experto: [
        lesson("Endurecimiento del servicio SSH", "Reduce la superficie de ataque aplicando autenticación fuerte, usuarios mínimos, controles de acceso y una política de actualización.", ["sshd_config", "AllowUsers", "Auditoría"], "Define una lista breve de controles antes de cambiar la configuración de un servidor."),
        lesson("Diagnóstico y operación segura", "Una conexión fallida puede deberse a red, DNS, permisos, claves o configuración. El modo verbose y los logs ayudan a aislar cada capa.", ["ssh -v", "Logs", "Red y DNS"], "Ordena una estrategia para diagnosticar un timeout sin desactivar controles de seguridad."),
      ],
    },
  },
  docker: {
    title: "Docker",
    eyebrow: "Contenedores",
    icon: Container,
    tone: "sky",
    route: "/docker",
    levels: {
      Principiante: [
        ...foundations,
        lesson("Procesos, sistemas operativos y contenedores", "Un contenedor ejecuta procesos aislados usando el kernel del sistema anfitrión. No es una máquina virtual completa.", ["Proceso", "Aislamiento", "Kernel"], "Explica con tus palabras una diferencia entre un contenedor y una máquina virtual."),
        lesson("Imágenes y contenedores", "La imagen es una plantilla inmutable; el contenedor es una instancia en ejecución. Docker usa comandos para crear, inspeccionar y detener esas instancias.", ["Imagen", "Contenedor", "Ciclo de vida"], "Dibuja el flujo desde elegir una imagen hasta detener el contenedor creado."),
      ],
      Básico: [
        lesson("Ejecutar e inspeccionar contenedores", "Aprende a iniciar procesos en primer plano o segundo plano y a revisar su estado antes de intervenir.", ["docker run", "docker ps", "docker logs"], "Ejecuta un contenedor con nombre y localiza cómo ver sus logs."),
        lesson("Puertos y variables de entorno", "El mapeo publica un puerto del contenedor en el anfitrión. Las variables permiten configurar una aplicación al arrancar.", ["-p", "-e", "Exposición de puertos"], "Publica un servicio del puerto 80 del contenedor en el 8080 local."),
      ],
      Normal: [
        lesson("Construir imágenes con Dockerfile", "Un Dockerfile documenta los pasos reproducibles para instalar dependencias, copiar el proyecto y definir el proceso de inicio.", ["FROM", "WORKDIR", "COPY", "RUN"], "Esboza un Dockerfile mínimo para una aplicación que escucha en el puerto 3000."),
        lesson("Volúmenes y persistencia", "Los contenedores pueden ser efímeros. Un volumen separa los datos importantes del ciclo de vida del contenedor.", ["docker volume", "Bind mount", "Persistencia"], "Decide qué datos de una base de datos deberían persistir al borrar su contenedor."),
      ],
      Avanzado: [
        lesson("Redes entre servicios", "Las redes permiten que los contenedores se encuentren por nombre y limitan la exposición de servicios al exterior.", ["bridge", "DNS interno", "Segmentación"], "Diseña una red para que una API llegue a la base de datos sin publicar esta última."),
        lesson("Docker Compose y salud de servicios", "Compose describe varios servicios en un archivo versionable, con dependencias, configuración y comprobaciones de salud.", ["compose.yaml", "depends_on", "healthcheck"], "Define los elementos necesarios para una API, una base de datos y sus comprobaciones de salud."),
      ],
      Experto: [
        lesson("Imágenes mínimas y builds multietapa", "Las builds multietapa separan herramientas de compilación del entorno final y ayudan a reducir tamaño y superficie de ataque.", ["Multi-stage", "Capas", "Imagen base"], "Separa la fase de compilación y la fase de ejecución para una app Node."),
        lesson("Seguridad y operación en producción", "Ejecutar como usuario no root, fijar versiones, revisar vulnerabilidades y definir límites mejora la previsibilidad del despliegue.", ["No root", "Escaneo", "Recursos y secretos"], "Enumera qué información nunca incluirías dentro de una imagen Docker."),
      ],
    },
  },
  postgres: {
    title: "PostgreSQL",
    eyebrow: "Datos y consultas",
    icon: Database,
    tone: "indigo",
    route: "/postgres",
    levels: {
      Principiante: [
        ...foundations,
        lesson("Qué es una base de datos relacional", "Una base relacional organiza información en tablas conectadas. Cada fila representa un registro y cada columna un atributo con un tipo definido.", ["Tabla", "Fila", "Columna"], "Propón una tabla para guardar libros e indica tres columnas con sus tipos."),
        lesson("SQL y consultas de lectura", "SQL es el lenguaje para consultar y modificar datos. SELECT obtiene columnas y FROM indica la tabla de origen.", ["SQL", "SELECT", "FROM"], "Escribe en pseudocódigo qué consulta harías para ver el nombre de todos los usuarios."),
      ],
      Básico: [
        lesson("Filtrar, ordenar y limitar resultados", "WHERE selecciona filas que cumplen una condición, ORDER BY ordena la salida y LIMIT acota la cantidad devuelta.", ["WHERE", "ORDER BY", "LIMIT"], "Consulta los productos activos ordenados por precio, mostrando solo los primeros diez."),
        lesson("Agregar y modificar registros", "INSERT crea filas; UPDATE cambia filas existentes. Una condición WHERE es esencial al modificar para no afectar toda la tabla.", ["INSERT", "UPDATE", "DELETE"], "Escribe una actualización de un registro por id y señala cómo verificarías su alcance."),
      ],
      Normal: [
        lesson("Relaciones y claves", "Las claves primarias identifican filas y las claves foráneas expresan relaciones entre tablas y protegen la consistencia referencial.", ["PRIMARY KEY", "FOREIGN KEY", "JOIN"], "Relaciona pedidos con clientes usando una clave foránea y describe el JOIN necesario."),
        lesson("Agregaciones y agrupamiento", "Las funciones de agregación resumen conjuntos de filas. GROUP BY define los grupos y HAVING filtra los resultados agregados.", ["COUNT", "SUM", "GROUP BY", "HAVING"], "Calcula cuántos pedidos tiene cada cliente y filtra los que tengan más de dos."),
      ],
      Avanzado: [
        lesson("Transacciones y consistencia", "Una transacción agrupa operaciones para confirmar todos los cambios o deshacerlos. ACID describe garantías importantes de este proceso.", ["BEGIN", "COMMIT", "ROLLBACK", "ACID"], "Plantea una transferencia entre cuentas donde ambas actualizaciones deban ocurrir juntas."),
        lesson("Índices y planes de consulta", "Los índices aceleran búsquedas frecuentes a cambio de espacio y trabajo extra en escrituras. EXPLAIN ayuda a analizar el plan elegido.", ["B-tree", "EXPLAIN", "Selectividad"], "Identifica qué columna podría beneficiarse de un índice en una consulta habitual y por qué."),
      ],
      Experto: [
        lesson("Diseño y rendimiento de esquemas", "El diseño equilibra integridad, claridad y rendimiento. Estadísticas, cardinalidad y patrones reales de acceso guían las optimizaciones.", ["Normalización", "Estadísticas", "Particionado"], "Propón cómo investigar una consulta lenta antes de añadir índices o cambiar el esquema."),
        lesson("Roles, permisos y mantenimiento", "Los roles permiten conceder únicamente los permisos necesarios. Copias de seguridad, restauración y mantenimiento deben probarse periódicamente.", ["Roles", "GRANT", "Backup y restore"], "Define permisos mínimos para una aplicación que solo necesita leer una tabla."),
      ],
    },
  },
  typescript: {
    title: "TypeScript",
    eyebrow: "Programación tipada",
    icon: Code2,
    tone: "blue",
    route: "/typescript",
    levels: {
      Principiante: [
        ...foundations,
        lesson("Qué hacen un lenguaje y un programa", "Un programa expresa instrucciones que una computadora ejecuta. TypeScript añade información de tipos y se transforma a JavaScript para ejecutarse en muchos entornos.", ["Código fuente", "Ejecución", "Transpilación"], "Describe el recorrido desde escribir un archivo TypeScript hasta ejecutar su resultado."),
        lesson("Valores, tipos y funciones", "Los tipos describen qué valores son válidos. Las funciones agrupan pasos reutilizables y pueden recibir entradas y producir resultados.", ["string", "number", "boolean", "Funciones"], "Escribe la firma de una función que reciba un nombre y devuelva un saludo."),
      ],
      Básico: [
        lesson("Variables, arrays y objetos", "Usa const para referencias que no se reasignan y representa listas u objetos con tipos que hagan explícita su estructura.", ["const", "Array", "Object"], "Crea el tipo de un libro con título, autor y una lista de etiquetas."),
        lesson("Condiciones y funciones tipadas", "Una firma precisa explica qué acepta una función y qué devuelve, ayudando a detectar errores antes de ejecutar el programa.", ["Parámetros", "Return type", "Uniones"], "Define una función que reciba una edad y devuelva si la persona puede registrarse."),
      ],
      Normal: [
        lesson("Interfaces y alias de tipos", "Las interfaces y los alias permiten nombrar estructuras. Las propiedades opcionales y las uniones modelan casos reales sin perder claridad.", ["interface", "type", "Propiedades opcionales"], "Modela un perfil cuyo correo es obligatorio y cuyo teléfono es opcional."),
        lesson("Genéricos y tipos reutilizables", "Los genéricos conservan la relación entre los tipos de entrada y salida, permitiendo crear utilidades que funcionan con distintos valores.", ["<T>", "Reutilización", "Inferencia"], "Diseña una función genérica que devuelva el primer elemento de una lista."),
      ],
      Avanzado: [
        lesson("Narrowing y tipos discriminados", "TypeScript reduce un tipo amplio cuando compruebas una propiedad o una condición. Las uniones discriminadas representan estados excluyentes con seguridad.", ["typeof", "in", "Discriminante"], "Modela estados de una petición: cargando, éxito con datos o error con mensaje."),
        lesson("Utility types y composición", "Los utility types transforman tipos existentes para crear variantes sin duplicar estructuras ni alejar las definiciones.", ["Pick", "Omit", "Partial", "Record"], "Deriva un tipo de actualización que permita cambiar solo campos de un usuario."),
      ],
      Experto: [
        lesson("Tipos condicionales y de plantilla", "Las herramientas avanzadas permiten expresar relaciones complejas entre tipos. Deben usarse cuando mejoran la API, no solo por ingenio.", ["Conditional types", "infer", "Template literal types"], "Piensa cómo limitar una función para que acepte solo claves de un objeto determinado."),
        lesson("Diseño de APIs y configuración estricta", "Un buen sistema de tipos guía al consumidor y mantiene errores visibles. La configuración strict y las pruebas ayudan a conservar contratos sólidos.", ["strict", "API pública", "Compatibilidad"], "Revisa una función pública y anota qué errores de uso debería impedir su firma."),
      ],
    },
  },
};

const toneClasses: Record<string, { icon: string; selected: string; line: string }> = {
  emerald: { icon: "text-emerald-300 bg-emerald-400/10", selected: "border-emerald-400/60 bg-emerald-400/10", line: "bg-emerald-400" },
  sky: { icon: "text-sky-300 bg-sky-400/10", selected: "border-sky-400/60 bg-sky-400/10", line: "bg-sky-400" },
  indigo: { icon: "text-indigo-300 bg-indigo-400/10", selected: "border-indigo-400/60 bg-indigo-400/10", line: "bg-indigo-400" },
  blue: { icon: "text-blue-300 bg-blue-400/10", selected: "border-blue-400/60 bg-blue-400/10", line: "bg-blue-400" },
};

const levelDescriptions: Record<LevelName, string> = {
  Principiante: "Empieza desde cero: lógica, algoritmos y vocabulario esencial.",
  Básico: "Aprende las operaciones cotidianas y construye una base práctica.",
  Normal: "Conecta conceptos y resuelve tareas con más autonomía.",
  Avanzado: "Diseña soluciones integradas, seguras y eficientes.",
  Experto: "Profundiza en arquitectura, rendimiento y decisiones de producción.",
};

const normalizeExerciseText = (text: string) =>
  text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const getRequiredConceptCount = (topics: string[]) => Math.max(1, Math.ceil(topics.length / 2));

const getMatchedTopics = (answer: string, topics: string[]) => {
  const normalizedAnswer = normalizeExerciseText(answer);
  return topics.filter((topic) => {
    const terms = normalizeExerciseText(topic).match(/[a-z0-9]+/g) ?? [];
    return terms.some((term) => term.length > 2 && normalizedAnswer.includes(term));
  });
};

export default function CoursesPage() {
  const { user } = useAuth();
  const [selectedModule, setSelectedModule] = useState<ModuleId>("ssh");
  const [selectedLevel, setSelectedLevel] = useState<LevelName>("Principiante");
  const [openLesson, setOpenLesson] = useState(0);
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [progressLoadedFor, setProgressLoadedFor] = useState<string | null>(null);
  const progressStorageKey = `devpracticelab_course_progress_${encodeURIComponent(user?.email ?? "guest")}`;
  const currentCourse = courses[selectedModule];
  const Icon = currentCourse.icon;
  const tone = toneClasses[currentCourse.tone];
  const lessons = currentCourse.levels[selectedLevel];

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const savedProgress = localStorage.getItem(progressStorageKey);
        const parsed: unknown = savedProgress ? JSON.parse(savedProgress) : {};
        if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
          const validProgress = Object.fromEntries(
            Object.entries(parsed).filter((entry): entry is [string, string[]] =>
              Array.isArray(entry[1]) && entry[1].every((item) => typeof item === "string")
            )
          );
          setCourseProgress(validProgress);
        } else {
          setCourseProgress({});
        }
      } catch {
        setCourseProgress({});
      }
      setProgressLoadedFor(progressStorageKey);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [progressStorageKey]);

  useEffect(() => {
    if (progressLoadedFor !== progressStorageKey) return;
    try {
      localStorage.setItem(progressStorageKey, JSON.stringify(courseProgress));
    } catch (error) {
      console.error("No se pudo guardar el progreso de los cursos:", error);
    }
  }, [courseProgress, progressLoadedFor, progressStorageKey]);

  const isLevelComplete = (moduleId: ModuleId, levelName: LevelName) => {
    const key = `${moduleId}:${levelName}`;
    const completed = courseProgress[key] ?? [];
    return courses[moduleId].levels[levelName].every((item) => completed.includes(item.title));
  };

  const isLevelUnlocked = (moduleId: ModuleId, levelName: LevelName) => {
    const levelIndex = levels.indexOf(levelName);
    return levelIndex === 0 || isLevelComplete(moduleId, levels[levelIndex - 1]);
  };

  const completedLessonCount = (moduleId: ModuleId, levelName: LevelName) =>
    (courseProgress[`${moduleId}:${levelName}`] ?? []).length;

  const selectModule = (moduleId: ModuleId) => {
    setSelectedModule(moduleId);
    setOpenLesson(0);
    const highestUnlocked = [...levels].reverse().find((levelName) => isLevelUnlocked(moduleId, levelName));
    setSelectedLevel(highestUnlocked ?? "Principiante");
  };

  const verifyExercise = (item: Lesson) => {
    const exerciseKey = `${selectedModule}:${selectedLevel}:${item.title}`;
    const answer = answers[exerciseKey]?.trim() ?? "";
    const matchedTopics = getMatchedTopics(answer, item.topics);
    const requiredCount = getRequiredConceptCount(item.topics);
    const alreadyComplete = (courseProgress[`${selectedModule}:${selectedLevel}`] ?? []).includes(item.title);

    if (answer.length < 30 || matchedTopics.length < requiredCount) {
      setExerciseFeedback((current) => ({
        ...current,
        [exerciseKey]: {
          ok: false,
          message: `Aún no aprobado: desarrolla la solución y menciona ${requiredCount} conceptos clave (${matchedTopics.length}/${requiredCount} detectados).`,
        },
      }));
      return;
    }

    if (!alreadyComplete) {
      setCourseProgress((current) => {
        const levelKey = `${selectedModule}:${selectedLevel}`;
        const completed = current[levelKey] ?? [];
        return { ...current, [levelKey]: [...completed, item.title] };
      });
    }
    setExerciseFeedback((current) => ({
      ...current,
      [exerciseKey]: { ok: true, message: "Ejercicio aprobado. El progreso se guardó en este navegador." },
    }));
  };

  const chooseModule = (moduleId: ModuleId) => {
    selectModule(moduleId);
  };

  const chooseLevel = (levelName: LevelName) => {
    if (!isLevelUnlocked(selectedModule, levelName)) return;
    setSelectedLevel(levelName);
    setOpenLesson(0);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
        <section className="border-b border-zinc-800 pb-8">
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase text-emerald-300">
            <BookOpen className="h-4 w-4" />
            Ruta de aprendizaje
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Cursos por nivel</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
                Aprende cada módulo paso a paso. Empieza por los fundamentos y avanza desde principiante hasta experto.
              </p>
            </div>
            <div className="flex items-center gap-3 border-l-2 border-emerald-400 pl-4 text-sm text-zinc-300">
              <div>
                <p className="font-semibold text-white">4 módulos</p>
                <p className="mt-1 text-zinc-500">5 niveles en cada ruta</p>
              </div>
              <span className="text-2xl font-bold text-emerald-300">20</span>
              <span className="text-xs text-zinc-500">cursos</span>
            </div>
          </div>
        </section>

        <section aria-label="Seleccionar módulo" className="py-7">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase text-zinc-500">
            <Network className="h-4 w-4" />
            Elige un módulo
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.entries(courses) as [ModuleId, CourseModule][]).map(([moduleId, course]) => {
              const ModuleIcon = course.icon;
              const isSelected = selectedModule === moduleId;
              const moduleTone = toneClasses[course.tone];
              return (
                <button
                  key={moduleId}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => chooseModule(moduleId)}
                  className={`flex min-h-16 items-center gap-3 border px-3 py-3 text-left transition ${
                    isSelected ? moduleTone.selected : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-600"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center ${moduleTone.icon}`}>
                    <ModuleIcon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{course.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-zinc-500">{course.eyebrow}</span>
                  </span>
                  {isSelected && <Check className="ml-auto h-4 w-4 shrink-0 text-white" />}
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label="Seleccionar nivel" className="border-y border-zinc-800 py-6">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500">Tu recorrido</p>
              <h2 className="mt-1 text-lg font-semibold text-white">Nivel de aprendizaje</h2>
            </div>
            <p className="text-sm text-zinc-500">5 niveles · elige por dónde empezar</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {levels.map((levelName, index) => {
              const isSelected = selectedLevel === levelName;
              const isUnlocked = isLevelUnlocked(selectedModule, levelName);
              const isComplete = isLevelComplete(selectedModule, levelName);
              const levelLessonCount = currentCourse.levels[levelName].length;
              return (
                <button
                  key={levelName}
                  type="button"
                  aria-pressed={isSelected}
                  disabled={!isUnlocked}
                  title={isUnlocked ? undefined : `Completa todas las prácticas de ${levels[index - 1]} para desbloquear este nivel.`}
                  onClick={() => chooseLevel(levelName)}
                  className={`relative min-h-20 border px-3 py-3 text-left transition ${
                    !isUnlocked
                      ? "cursor-not-allowed border-zinc-900 bg-zinc-950/60 opacity-50"
                      : isSelected
                      ? "border-zinc-500 bg-zinc-800/80"
                      : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-600"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`flex h-6 w-6 items-center justify-center text-xs font-bold ${isSelected ? "bg-emerald-400 text-zinc-950" : "bg-zinc-800 text-zinc-400"}`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{levelName}</span>
                    {!isUnlocked && <LockKeyhole className="ml-auto h-3.5 w-3.5 text-zinc-500" />}
                    {isComplete && <Check className="ml-auto h-4 w-4 text-emerald-300" />}
                  </span>
                  <span className="mt-2 block text-xs leading-4 text-zinc-500">
                    {completedLessonCount(selectedModule, levelName)}/{levelLessonCount} prácticas · {levelDescriptions[levelName]}
                  </span>
                  {isSelected && <span className={`absolute inset-x-0 bottom-0 h-0.5 ${tone.line}`} />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="py-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center ${tone.icon}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">{currentCourse.eyebrow} / {selectedLevel}</p>
                  <h2 className="text-xl font-bold text-white">{currentCourse.title}: {selectedLevel}</h2>
                </div>
              </div>
              <p className="mt-3 max-w-2xl text-sm text-zinc-400">{levelDescriptions[selectedLevel]}</p>
            </div>
            <Link
              href={currentCourse.route}
              className="inline-flex min-h-10 items-center justify-center gap-2 border border-zinc-700 px-4 text-sm font-semibold text-zinc-200 transition hover:border-emerald-400/50 hover:text-white"
            >
              <Terminal className="h-4 w-4" />
              Ir a practicar
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="border-t border-zinc-800">
            {lessons.map((item, index) => {
              const isOpen = openLesson === index;
              const exerciseKey = `${selectedModule}:${selectedLevel}:${item.title}`;
              const isExerciseComplete = (courseProgress[`${selectedModule}:${selectedLevel}`] ?? []).includes(item.title);
              const matchedTopics = getMatchedTopics(answers[exerciseKey] ?? "", item.topics);
              const requiredTopics = getRequiredConceptCount(item.topics);
              return (
                <article key={item.title} className="border-b border-zinc-800">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenLesson(isOpen ? -1 : index)}
                    className="flex w-full items-center gap-4 py-4 text-left"
                  >
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center border text-xs font-semibold ${isOpen ? "border-emerald-400/50 text-emerald-300" : "border-zinc-700 text-zinc-500"}`}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-white sm:text-base">{item.title}</span>
                      <span className="mt-1 block text-xs text-zinc-500">{item.topics.join(" · ")}</span>
                    </span>
                    {isExerciseComplete && <Check className="h-4 w-4 shrink-0 text-emerald-300" aria-label="Ejercicio aprobado" />}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="pb-5 pl-12 pr-2 sm:pl-12">
                      <p className="max-w-3xl text-sm leading-6 text-zinc-300">{item.description}</p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1.2fr]">
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase text-zinc-500">Conceptos clave</p>
                          <div className="flex flex-wrap gap-2">
                            {item.topics.map((topic) => (
                              <span key={topic} className="border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-300">{topic}</span>
                            ))}
                          </div>
                        </div>
                        <div className="border-l-2 border-amber-400/70 pl-3">
                          <p className="mb-1 text-xs font-semibold uppercase text-amber-300">Ponlo en práctica</p>
                          <p className="text-sm leading-5 text-zinc-400">{item.exercise}</p>
                        </div>
                      </div>
                      <div className="mt-5 border border-zinc-800 bg-zinc-950/70">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 px-3 py-2">
                          <span className="font-mono text-xs font-semibold text-zinc-200">Editor de práctica</span>
                          <span className="text-xs text-zinc-500">Criterios: al menos {requiredTopics} conceptos clave</span>
                        </div>
                        <textarea
                          aria-label={`Editor de práctica: ${item.title}`}
                          value={answers[exerciseKey] ?? ""}
                          onChange={(event) => {
                            setAnswers((current) => ({ ...current, [exerciseKey]: event.target.value }));
                            setExerciseFeedback((current) => {
                              const next = { ...current };
                              delete next[exerciseKey];
                              return next;
                            });
                          }}
                          placeholder="Escribe tu solución, algoritmo, consulta o comando..."
                          className="min-h-32 w-full resize-y bg-transparent p-3 font-mono text-sm leading-6 text-zinc-200 outline-none placeholder:text-zinc-600 focus:ring-2 focus:ring-inset focus:ring-emerald-500/40"
                        />
                        <div className="flex flex-col gap-3 border-t border-zinc-800 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-zinc-500">Conceptos detectados: {matchedTopics.length}/{requiredTopics}</p>
                          <button
                            type="button"
                            onClick={() => verifyExercise(item)}
                            className="inline-flex min-h-9 items-center justify-center gap-2 bg-emerald-400 px-3 text-xs font-bold text-zinc-950 transition hover:bg-emerald-300"
                          >
                            {isExerciseComplete ? <Check className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                            {isExerciseComplete ? "Aprobado" : "Verificar ejercicio"}
                          </button>
                        </div>
                        {exerciseFeedback[exerciseKey] && (
                          <p
                            role="status"
                            className={`border-t border-zinc-800 px-3 py-2 text-xs ${exerciseFeedback[exerciseKey].ok ? "text-emerald-300" : "text-amber-300"}`}
                          >
                            {exerciseFeedback[exerciseKey].message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">Elige un nivel y avanza a tu ritmo; puedes cambiar de ruta cuando quieras.</p>
          <Link href="/challenges" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 hover:text-emerald-200">
            Practicar con retos <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}