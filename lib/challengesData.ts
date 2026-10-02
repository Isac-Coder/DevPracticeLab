export interface Challenge {
  id: string;
  module: "ssh" | "docker" | "postgres" | "typescript";
  week: number;
  title: string;
  difficulty: "Fácil" | "Intermedio" | "Avanzado";
  xp: number;
  objective: string;
  hints: string[];
  expectedKeywords: string[];
  solution: string;
  tags: string[];
}

export type ChallengeStatus = "resuelto" | "erroneo" | "faltante";

export function calculateSpeedBonusXp(baseXp: number, elapsedMs: number): number {
  const bonusCap = Math.ceil(baseXp * 0.5);
  const remainingTimeFactor = Math.max(0, 1 - elapsedMs / (30 * 60 * 1000));
  return Math.round(bonusCap * remainingTimeFactor);
}

const challengeQuestionStopWords = new Set([
  "acerca", "algo", "como", "cual", "cuales", "cuando", "con", "de", "del", "desde", "donde",
  "el", "ella", "en", "es", "esta", "este", "hacer", "hago", "la", "las", "le", "los", "me",
  "mi", "para", "por", "que", "quiero", "se", "sobre", "su", "tengo", "un", "una", "uno",
  "y", "the", "how", "what", "which", "about", "can", "do", "for", "from", "help", "i", "in",
  "is", "me", "my", "of", "please", "solve", "the", "to", "with",
]);

const challengeQuestionTokens = (text: string) =>
  new Set(
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .match(/[a-z0-9]+/g)
      ?.filter((token) => token.length > 2 && !challengeQuestionStopWords.has(token)) ?? [],
  );

export function isChallengeRelatedQuestion(question: string): boolean {
  const questionTokens = challengeQuestionTokens(question);
  const normalizedQuestion = question
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const refersToChallenge = /\b(reto|desafio|challenge)\b/.test(normalizedQuestion);
  const asksForChallengeHelp = /\b(solucion|respuesta|resolv\w*|complet\w*|pista|ayuda)\w*\b/.test(normalizedQuestion);
  if (refersToChallenge && asksForChallengeHelp) return true;
  if (questionTokens.size < 2) return false;

  return ALL_CHALLENGES.some((challenge) => {
    const challengeTokens = challengeQuestionTokens([
      challenge.title,
      challenge.objective,
      ...challenge.hints,
      ...challenge.expectedKeywords,
      ...challenge.tags,
      challenge.solution,
    ].join(" "));
    const overlap = [...questionTokens].filter((token) => challengeTokens.has(token)).length;
    return overlap >= 2 && overlap / questionTokens.size >= 0.5;
  });
}

// 50 Retos para SSH
const sshChallenges: Challenge[] = Array.from({ length: 50 }, (_, i) => {
  const week = i + 1;
  const hosts = ["192.168.1.100", "10.0.0.50", "servidor.ejemplo.com"];
  const targetHost = hosts[i % hosts.length];

  if (week <= 15) {
    return {
      id: `ssh-w${week}`,
      module: "ssh",
      week,
      title: `Semana ${week} - Reto SSH: ${
        week % 3 === 1
          ? `Generación de llaves y conexión a ${targetHost}`
          : week % 3 === 2
          ? `Transferencia y verificación de archivos en ${targetHost}`
          : `Inspección remota de sistema en ${targetHost}`
      }`,
      difficulty: "Fácil" as const,
      xp: 120 + week * 5,
      objective:
        week % 3 === 1
          ? `Genera un par de claves SSH y conéctate al servidor '${targetHost}' con el usuario root.`
          : week % 3 === 2
          ? `Transfiere un archivo usando SCP hacia el servidor '${targetHost}' en la ruta /var/log/.`
          : `Ejecuta comandos de inspección en el servidor '${targetHost}' (whoami, uname -a o uptime).`,
      hints: [
        "Usa 'ssh-keygen' para generar llaves o 'ssh root@" + targetHost + "' para conectar.",
        "La contraseña simulada es 'A12345678'.",
        "Usa 'scp' o comandos de lectura como 'cat' o 'ls'.",
      ],
      expectedKeywords: ["ssh", targetHost.split(".")[0], "root"],
      solution: `ssh-keygen -t ed25519\nssh-copy-id root@${targetHost}\nssh root@${targetHost}`,
      tags: ["ssh", "ssh-keygen", "scp", "sysadmin"],
    };
  } else if (week <= 35) {
    return {
      id: `ssh-w${week}`,
      module: "ssh",
      week,
      title: `Semana ${week} - Reto SSH: ${
        week % 2 === 0
          ? `Configuración de túneles locales y remotos (-L / -R)`
          : `Permisos de archivos ~/.ssh y authorized_keys`
      }`,
      difficulty: "Intermedio" as const,
      xp: 180 + week * 5,
      objective:
        week % 2 === 0
          ? `Configura un túnel SSH para reenviar el puerto local 8080 hacia el puerto 3000 de '${targetHost}'.`
          : `Establece permisos estrictos (chmod 600 y chmod 700) en el directorio .ssh y el archivo authorized_keys.`,
      hints: [
        "El parámetro -L mapea puertos locales a remotos (ej. ssh -L 8080:localhost:3000 root@" + targetHost + ").",
        "Los permisos requeridos en OpenSSH son 700 para ~/.ssh y 600 para authorized_keys.",
      ],
      expectedKeywords: ["ssh", "8080", "chmod", "authorized_keys", targetHost.split(".")[0]],
      solution: `ssh -L 8080:localhost:3000 root@${targetHost}\nchmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`,
      tags: ["tunneling", "port-forwarding", "security", "permissions"],
    };
  } else {
    return {
      id: `ssh-w${week}`,
      module: "ssh",
      week,
      title: `Semana ${week} - Reto SSH: Bastion Host & ProxyJump avanzado`,
      difficulty: "Avanzado" as const,
      xp: 280 + week * 5,
      objective: `Configura una conexión SSH a través de un servidor Bastion intermediario hacia '${targetHost}' usando ProxyJump (-J) y llaves sin contraseña.`,
      hints: [
        "Usa el flag -J para saltar a través de un host Bastion (ssh -J bastion.org root@" + targetHost + ").",
        "Comprueba la conectividad con 'ssh -v' para modo debug.",
      ],
      expectedKeywords: ["ssh", "-j", "proxyjump", targetHost.split(".")[0]],
      solution: `ssh -J root@bastion.org root@${targetHost}\nssh -i ~/.ssh/id_rsa -W ${targetHost}:22 root@bastion.org`,
      tags: ["proxyjump", "bastion", "hardening", "advanced-ssh"],
    };
  }
});

// 50 Retos para Docker
const dockerChallenges: Challenge[] = Array.from({ length: 50 }, (_, i) => {
  const week = i + 1;
  const images = ["nginx:latest", "node:20-alpine", "redis:alpine", "postgres:16-alpine", "python:3.11-slim"];
  const selectedImage = images[i % images.length];

  if (week <= 15) {
    return {
      id: `docker-w${week}`,
      module: "docker",
      week,
      title: `Semana ${week} - Reto Docker: Despliegue de ${selectedImage.split(":")[0]}`,
      difficulty: "Fácil" as const,
      xp: 130 + week * 5,
      objective: `Ejecuta un contenedor en segundo plano usando la imagen '${selectedImage}', mapeando el puerto correspondiente y asignándole el nombre 'app-w${week}'.`,
      hints: [
        "El flag -d corre en segundo plano.",
        "El flag -p mapea puertos (ej. -p 8080:80 o -p 3000:3000).",
        "El flag --name asigna el nombre al contenedor.",
      ],
      expectedKeywords: ["docker", "run", selectedImage.split(":")[0], "-d"],
      solution: `docker run -d -p 8080:80 --name app-w${week} ${selectedImage}\ndocker ps`,
      tags: ["docker-run", "containers", selectedImage.split(":")[0]],
    };
  } else if (week <= 35) {
    return {
      id: `docker-w${week}`,
      module: "docker",
      week,
      title: `Semana ${week} - Reto Docker: Redes y Volúmenes con ${selectedImage.split(":")[0]}`,
      difficulty: "Intermedio" as const,
      xp: 200 + week * 5,
      objective: `Crea una red personalizada 'red-dev-w${week}', un volumen persistente 'vol-data-w${week}' y monta ambos en el contenedor de '${selectedImage}'.`,
      hints: [
        "Usa 'docker network create' y 'docker volume create'.",
        "El flag -v o --mount permite conectar el volumen persistente.",
        "El flag --network conecta el contenedor a la red creada.",
      ],
      expectedKeywords: ["docker", "network", "volume", "create", selectedImage.split(":")[0]],
      solution: `docker network create red-dev-w${week}\ndocker volume create vol-data-w${week}\ndocker run -d --network red-dev-w${week} -v vol-data-w${week}:/data ${selectedImage}`,
      tags: ["networks", "volumes", "persistence", "docker-cli"],
    };
  } else {
    return {
      id: `docker-w${week}`,
      module: "docker",
      week,
      title: `Semana ${week} - Reto Docker: Docker Compose & Multi-Stage Builds`,
      difficulty: "Avanzado" as const,
      xp: 300 + week * 5,
      objective: `Define un stack de servicios con Docker Compose que incluya frontend, backend y '${selectedImage}' con políticas de reinicio y healthchecks.`,
      hints: [
        "Usa 'docker compose up -d' para levantar todos los servicios.",
        "Configura restart: always y dependencias con depends_on.",
      ],
      expectedKeywords: ["compose", "docker", "build", "services", "up"],
      solution: `docker compose -f docker-compose.yml up -d --build\ndocker compose ps\ndocker compose logs`,
      tags: ["docker-compose", "multi-stage", "orchestration", "healthcheck"],
    };
  }
});

// 50 Retos para PostgreSQL
const postgresChallenges: Challenge[] = Array.from({ length: 50 }, (_, i) => {
  const week = i + 1;
  const tables = ["usuarios", "productos", "pedidos", "clientes", "facturas"];
  const targetTable = tables[i % tables.length];

  if (week <= 15) {
    return {
      id: `postgres-w${week}`,
      module: "postgres",
      week,
      title: `Semana ${week} - Reto SQL: Consultas y Filtros en '${targetTable}'`,
      difficulty: "Fácil" as const,
      xp: 140 + week * 5,
      objective: `Escribe una consulta SELECT con WHERE, ORDER BY y LIMIT sobre la tabla '${targetTable}' para extraer datos filtrados de prueba.`,
      hints: [
        "Usa 'SELECT * FROM " + targetTable + " WHERE ... ORDER BY ... LIMIT 5;'",
        "Recuerda terminar con punto y coma (;).",
        "Inspecciona la tabla con '\\d " + targetTable + "'.",
      ],
      expectedKeywords: ["select", targetTable, "from", "where"],
      solution: `SELECT * FROM ${targetTable} WHERE id > 0 ORDER BY id DESC LIMIT 5;`,
      tags: ["select", "where", "order-by", "sql-basics"],
    };
  } else if (week <= 35) {
    return {
      id: `postgres-w${week}`,
      module: "postgres",
      week,
      title: `Semana ${week} - Reto SQL: DDL, Indices y Agregaciones en '${targetTable}'`,
      difficulty: "Intermedio" as const,
      xp: 220 + week * 5,
      objective: `Crea un índice en la tabla '${targetTable}' (CREATE INDEX) o ejecuta un cálculo de resumen usando COUNT, AVG o SUM agrupado por categoría (GROUP BY).`,
      hints: [
        "Usa 'CREATE INDEX idx_" + targetTable + "_col ON " + targetTable + " (columna);'",
        "O ejecuta 'SELECT categoria, COUNT(*) FROM " + targetTable + " GROUP BY categoria;'",
      ],
      expectedKeywords: ["group by", "index", "count", targetTable, "create"],
      solution: `CREATE INDEX idx_${targetTable}_ref ON ${targetTable} (id);\nSELECT COUNT(*) FROM ${targetTable};`,
      tags: ["indexes", "group-by", "aggregations", "performance"],
    };
  } else {
    return {
      id: `postgres-w${week}`,
      module: "postgres",
      week,
      title: `Semana ${week} - Reto SQL: JSONB, Transacciones ACID & Constraints`,
      difficulty: "Avanzado" as const,
      xp: 320 + week * 5,
      objective: `Diseña una tabla con campo JSONB, aplica una transacción BEGIN ... COMMIT e inserta documentos estructurados con índice GIN.`,
      hints: [
        "Usa BEGIN; seguido de INSERTs y finaliza con COMMIT;.",
        "Usa el tipo JSONB con índice GIN: 'CREATE INDEX USING GIN (payload);'",
      ],
      expectedKeywords: ["jsonb", "begin", "commit", "gin", "transaction"],
      solution: `BEGIN;\nCREATE TABLE reportes_${week} (id SERIAL PRIMARY KEY, data JSONB);\nCREATE INDEX idx_rep_${week} ON reportes_${week} USING GIN (data);\nCOMMIT;`,
      tags: ["jsonb", "acid-transactions", "gin-index", "advanced-sql"],
    };
  }
});

// 50 Retos para TypeScript
const typescriptChallenges: Challenge[] = Array.from({ length: 50 }, (_, i) => {
  const week = i + 1;
  const concepts = [
    "Interfaces & Types",
    "Generics <T>",
    "Utility Types (Partial/Pick/Omit)",
    "Discriminated Unions",
    "Strict Null Checks & Narrowing",
  ];
  const concept = concepts[i % concepts.length];

  if (week <= 15) {
    return {
      id: `ts-w${week}`,
      module: "typescript",
      week,
      title: `Semana ${week} - Reto TS: ${concept} básico`,
      difficulty: "Fácil" as const,
      xp: 150 + week * 5,
      objective: `Declara una interfaz o tipo personalizado en TypeScript para modelar una entidad de usuario con campos obligatorios y opcionales.`,
      hints: [
        "Usa 'type User = { id: number; name: string; email?: string }'",
        "O usa 'interface Entity { id: number; createdAt: Date }'",
        "Compila con 'tsc --noEmit' o 'eval <código>'.",
      ],
      expectedKeywords: ["type", "interface", "number", "string"],
      solution: `type UserW${week} = {\n  id: number;\n  name: string;\n  isActive?: boolean;\n};\n// Verifica con: type UserW${week}`,
      tags: ["types", "interfaces", "type-safety", "tsc"],
    };
  } else if (week <= 35) {
    return {
      id: `ts-w${week}`,
      module: "typescript",
      week,
      title: `Semana ${week} - Reto TS: ${concept} con Genéricos y Mappings`,
      difficulty: "Intermedio" as const,
      xp: 240 + week * 5,
      objective: `Crea un tipo genérico 'ApiResponse<T>' que envuelva los campos 'data: T', 'status: number' y 'success: boolean', y úsalo con un DTO.`,
      hints: [
        "Escribe 'type ApiResponse<T> = { data: T; status: number; success: boolean; }'",
        "Prueba con 'type UserResponse = ApiResponse<{ id: number; username: string }>'",
      ],
      expectedKeywords: ["generics", "apiresponse", "<t>", "partial", "pick"],
      solution: `type ApiResponse<T> = {\n  data: T;\n  status: number;\n  success: boolean;\n};\ntype ProductResponse = ApiResponse<{ id: number; title: string }>;`,
      tags: ["generics", "utility-types", "api-types", "mapping"],
    };
  } else {
    return {
      id: `ts-w${week}`,
      module: "typescript",
      week,
      title: `Semana ${week} - Reto TS: ${concept} Avanzado & Conditional Types`,
      difficulty: "Avanzado" as const,
      xp: 340 + week * 5,
      objective: `Implementa un tipo condicional 'IsArray<T>' o un 'DeepReadonly<T>' que transforme recursivamente todas las propiedades a solo lectura.`,
      hints: [
        "Usa la sintaxis 'type IsArray<T> = T extends any[] ? true : false;'",
        "O uniones discriminadas con 'type Action = { type: 'ADD' } | { type: 'REMOVE' }'",
      ],
      expectedKeywords: ["extends", "infer", "readonly", "conditional", "type"],
      solution: `type IsArray<T> = T extends any[] ? true : false;\ntype DeepReadonly<T> = {\n  readonly [P in keyof T]: DeepReadonly<T[P]>;\n};`,
      tags: ["conditional-types", "infer", "advanced-ts", "type-guards"],
    };
  }
});

export const ALL_CHALLENGES: Challenge[] = [
  ...sshChallenges,
  ...dockerChallenges,
  ...postgresChallenges,
  ...typescriptChallenges,
];

export function getCurrentCalendarWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime() + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  const weekNum = Math.ceil((day + start.getDay() + 1) / 7);
  return ((weekNum - 1) % 50) + 1; // 1 to 50
}

export function getWeeklyFeaturedChallenges(weekNum: number = getCurrentCalendarWeek()): Challenge[] {
  return ALL_CHALLENGES.filter((c) => c.week === weekNum);
}
