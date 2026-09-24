import type { CommandResult } from "@/app/components/SimulatedTerminal";

export const typescriptWelcome = `╔══════════════════════════════════════════════════════════════╗
║  TypeScript v5.7.0 (Strict Mode, ESNext Target)              ║
║  Terminal interactiva de tipado estático, tsc y ts-node      ║
║                                                              ║
║  Escribe --help para ver la lista de comandos disponibles.   ║
╚══════════════════════════════════════════════════════════════╝`;

const defaultFiles: Record<string, string> = {
  "app.ts": `// app.ts - Aplicación principal
import { User, UserService } from "./models";

const service = new UserService();
const newUser: User = {
  id: 1,
  name: "Alex Dev",
  email: "alex@example.com",
  role: "admin",
  isActive: true,
};

service.addUser(newUser);
console.log("Usuarios registrados:", service.getAll());
`,
  "models.ts": `// models.ts - Interfaces y tipos
export type Role = "admin" | "editor" | "viewer";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive?: boolean;
}

export class UserService {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  getAll(): User[] {
    return this.users;
  }
}
`,
  "generics.ts": `// generics.ts - Tipos genéricos reutilizables
export interface ApiResponse<T> {
  data: T;
  status: number;
  success: boolean;
}

export function identity<T>(arg: T): T {
  return arg;
}

export class Repository<T extends { id: number }> {
  private items: Map<number, T> = new Map();

  save(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: number): T | undefined {
    return this.items.get(id);
  }
}
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
`,
};

export function getTypescriptCommands(): Record<string, (args: string[]) => CommandResult> {
  const files = { ...defaultFiles };
  const customTypes: Record<string, string> = {
    Role: '"admin" | "editor" | "viewer"',
    ID: "string | number",
    User: "{ id: number; name: string; email: string; role: Role; isActive?: boolean }",
    ApiResponse: "{ data: T; status: number; success: boolean }",
  };

  return {
    "--help": () => ({
      output: `Comandos TypeScript disponibles:
  tsc [archivo] [--strict]      Compilar archivo TypeScript a JavaScript
  tsc --init                    Generar archivo de configuración tsconfig.json
  tsc --noEmit                  Verificar tipos sin generar archivos JS
  ts-node <archivo>             Ejecutar archivo TypeScript directamente
  type <definición>             Definir o consultar tipos personalizados
  interface <definición>        Definir una interfaz
  generics                      Ejemplos de funciones y clases genéricas
  utility-types                 Explorar Partial, Pick, Omit, Record, etc.
  strict                        Explicar flags del modo estricto en TS
  eval <código>                 Evaluar y verificar tipos de una expresión
  ls                            Listar archivos TypeScript en el proyecto
  cat <archivo>                 Ver el contenido de un archivo TS
  clear                         Limpiar la pantalla de la terminal`,
    }),

    tsc: (args) => {
      if (args.length === 0) {
        return {
          output: `✨ [tsc] Compilando proyecto según tsconfig.json...
✓ Analizando dependencias y grafo de tipos
✓ Verificando strictNullChecks y noImplicitAny
✓ 0 errores encontrados. Salida generada en ./dist/`,
        };
      }

      if (args.includes("--init")) {
        return {
          output: `Created a new tsconfig.json with:
  target: es2022
  module: nodenext
  strict: true
  esModuleInterop: true
  skipLibCheck: true
  forceConsistentCasingInFileNames: true

You can now learn more about each setting in tsconfig.json.`,
        };
      }

      if (args.includes("--noEmit")) {
        return {
          output: `✨ [tsc --noEmit] Type checking completado exitosamente:
• 3 archivos TypeScript analizados
• 0 errores de tipo detectados`,
        };
      }

      const filename = args[0];
      if (!files[filename]) {
        return {
          output: `error TS6053: File '${filename}' not found. Archivos disponibles: ${Object.keys(files).join(", ")}`,
          isError: true,
        };
      }

      const jsOutput = filename.replace(/\.ts$/, ".js");
      return {
        output: `✨ Compilando ${filename} con TypeScript Compiler...
✓ Comprobación de tipos aprobada (Strict Mode)
✓ Archivo generado: dist/${jsOutput}`,
      };
    },

    "ts-node": (args) => {
      if (args.length === 0) {
        return {
          output: "Uso: ts-node <archivo.ts> (ej. ts-node app.ts o ts-node generics.ts)",
          isError: true,
        };
      }

      const filename = args[0];
      if (filename === "app.ts") {
        return {
          output: `[ts-node] Ejecutando app.ts...
Usuarios registrados: [
  { id: 1, name: 'Alex Dev', email: 'alex@example.com', role: 'admin', isActive: true }
]`,
        };
      }

      if (filename === "generics.ts") {
        return {
          output: `[ts-node] Ejecutando generics.ts...
Identity: "TypeScript Master" -> typeof: string
Repository: Guardado item con id=101 en Map genérico.
Repository.findById(101): { id: 101, title: 'Learn TypeScript' }`,
        };
      }

      if (files[filename]) {
        return {
          output: `[ts-node] Ejecutando ${filename}...
✓ Ejecución completada sin errores de compilación ni de runtime.`,
        };
      }

      return {
        output: `Error: No se encontró el archivo '${filename}'. Usa 'ls' para ver archivos disponibles.`,
        isError: true,
      };
    },

    type: (args) => {
      const fullText = args.join(" ");
      if (!fullText) {
        const typesList = Object.entries(customTypes)
          .map(([k, v]) => `  type ${k} = ${v}`)
          .join("\n");
        return {
          output: `Tipos registrados actualmente:\n${typesList}\n\nPuedes definir nuevos tipos con: type Status = "active" | "inactive"`,
        };
      }

      if (fullText.includes("=")) {
        const [namePart, valPart] = fullText.split("=");
        const typeName = namePart.trim();
        const typeVal = valPart.trim();
        customTypes[typeName] = typeVal;
        return {
          output: `✅ Tipo definido exitosamente:\ntype ${typeName} = ${typeVal};`,
        };
      }

      if (customTypes[fullText]) {
        return {
          output: `type ${fullText} = ${customTypes[fullText]};`,
        };
      }

      return {
        output: `Tipo '${fullText}' no encontrado. Define uno con: type ${fullText} = string | number;`,
      };
    },

    interface: (args) => {
      const fullText = args.join(" ");
      if (!fullText) {
        return {
          output: `Uso: interface <Nombre> { prop: tipo; ... }
Ejemplo:
  interface Product {
    id: number;
    title: string;
    price: number;
    tags?: string[];
  }`,
        };
      }

      const name = args[0]?.replace(/{.*/, "").trim();
      customTypes[name] = fullText.slice(name.length).trim() || "{ [key: string]: any }";
      return {
        output: `✅ Interfaz registrada:
interface ${name} ${customTypes[name]}`,
      };
    },

    enum: (args) => {
      const fullText = args.join(" ");
      if (!fullText) {
        return {
          output: `Ejemplo de Enum en TypeScript:
enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  NotFound = 404,
  InternalServerError = 500
}

enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT"
}`,
        };
      }

      return {
        output: `✅ Enum registrado correctamente:
enum ${fullText}`,
      };
    },

    generics: () => ({
      output: `📘 Guía de Tipos Genéricos (Generics) en TypeScript:

1. Función Genérica:
   function firstElement<T>(arr: T[]): T | undefined {
     return arr[0];
   }
   const num = firstElement([10, 20]); // tipo inferido: number
   const str = firstElement(["a", "b"]); // tipo inferido: string

2. Interfaz Genérica:
   interface Paginated<T> {
     items: T[];
     page: number;
     totalPages: number;
   }

3. Constraint (Restricción):
   function getLength<T extends { length: number }>(item: T): number {
     return item.length;
   }`,
    }),

    "utility-types": (args) => {
      const target = args[0]?.toLowerCase();
      if (target === "partial") {
        return {
          output: `Partial<T> — Hace todas las propiedades de T opcionales:
type User = { id: number; name: string };
type UpdateUserDto = Partial<User>; // { id?: number; name?: string }`,
        };
      }

      if (target === "pick") {
        return {
          output: `Pick<T, K> — Elige un subconjunto de propiedades:
type User = { id: number; name: string; passwordHash: string };
type UserPreview = Pick<User, "id" | "name">; // { id: number; name: string }`,
        };
      }

      if (target === "omit") {
        return {
          output: `Omit<T, K> — Omite propiedades específicas:
type User = { id: number; name: string; passwordHash: string };
type SafeUser = Omit<User, "passwordHash">; // { id: number; name: string }`,
        };
      }

      if (target === "record") {
        return {
          output: `Record<Keys, Type> — Mapa clave-valor tipado:
type Roles = "admin" | "user";
type Permissions = Record<Roles, string[]>;
// { admin: string[]; user: string[] }`,
        };
      }

      return {
        output: `🛠️ TypeScript Utility Types principales:
  • Partial<T>       Vuelve todas las propiedades opcionales
  • Required<T>      Vuelve todas las propiedades obligatorias
  • Readonly<T>      Vuelve todas las propiedades de solo lectura
  • Pick<T, K>       Selecciona propiedades específicas K de T
  • Omit<T, K>       Excluye propiedades específicas K de T
  • Record<K, V>     Crea un objeto con claves K y valores V
  • ReturnType<T>    Extrae el tipo de retorno de una función

Escribe: utility-types partial | pick | omit | record para más detalles.`,
      };
    },

    strict: () => ({
      output: `🛡️ Flags de TypeScript Strict Mode:
  • strict: true                Habilita todas las comprobaciones estrictas
  • noImplicitAny: true         Error si un tipo no puede ser inferido y cae en 'any'
  • strictNullChecks: true      'null' y 'undefined' no son asignables a otros tipos
  • strictFunctionTypes: true   Verificación estricta de parámetros de función
  • noImplicitThis: true        Error en 'this' no tipado
  • alwaysStrict: true          Emite "use strict" en todos los archivos generados`,
    }),

    eval: (args) => {
      const code = args.join(" ");
      if (!code) {
        return {
          output: "Uso: eval <expresión> (ej. eval const x: number = 42; x * 2)",
          isError: true,
        };
      }

      if (code.includes(": string") && code.includes("= 123")) {
        return {
          output: `Type Error TS2322: Type 'number' is not assignable to type 'string'.`,
          isError: true,
        };
      }

      return {
        output: `✨ Analizando tipos para: ${code}
• Inferencia: Válida
• Resultado: [TS Expression Evaluated OK]`,
      };
    },

    check: (args) => {
      const code = args.join(" ");
      return {
        output: `[TypeChecker] Código analizado: "${code || "proyecto completo"}"
✓ 0 Type errors. Cumple con TypeScript 5.7 Strict Mode.`,
      };
    },

    build: () => ({
      output: `🚀 [Build] Ejecutando compilación optimizada con Turbopack y tsc...
✓ Generando definiciones de tipo (.d.ts)
✓ Bundle generado en ./dist/bundle.js (3.4 KB minificado)`,
    }),

    ls: () => ({
      output: Object.keys(files).join("  "),
    }),

    pwd: () => ({
      output: "/workspace/typescript-practice",
    }),

    cat: (args) => {
      if (args.length === 0) {
        return {
          output: "Uso: cat <archivo.ts>",
          isError: true,
        };
      }

      const filename = args[0];
      if (files[filename]) {
        return {
          output: files[filename],
        };
      }

      return {
        output: `cat: ${filename}: No existe el archivo. Archivos disponibles: ${Object.keys(files).join(", ")}`,
        isError: true,
      };
    },
  };
}
