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
import {
  Sparkles,
  BookMarked,
  CheckCircle2,
  HelpCircle,
  Trophy,
  GraduationCap,
  Languages,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/AuthContext";
import { useChallengeMode } from "@/lib/ChallengeModeContext";
import { usePlatformMode } from "@/lib/PlatformModeContext";
import { TOP_NOTCH_COURSES, type EnglishCourseLevel, type EnglishLesson } from "@/lib/englishCoursesData";
import { TOP_NOTCH_LEVELS } from "@/lib/topNotchData";

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

const moduleFoundations: Record<ModuleId, Lesson[]> = {
  ssh: [
    lesson("Qué problema resuelve SSH", "SSH permite administrar un equipo remoto por un canal cifrado, sin exponer la sesión como texto plano.", ["Acceso remoto", "Canal cifrado", "Cliente SSH"], "Explica qué ventaja aporta un canal cifrado al administrar un servidor remoto."),
    lesson("Cliente, host y usuario", "Una conexión SSH identifica la máquina destino y la cuenta remota que ejecutará la sesión.", ["Cliente", "Host", "Usuario remoto"], "Separa cliente, usuario y host en ssh admin@servidor.ejemplo.com."),
    lesson("Autenticación e identidad", "Las contraseñas y claves prueban tu identidad; la huella del host ayuda a comprobar la identidad del servidor.", ["Autenticación", "Clave pública", "Huella"], "Describe qué identidad debe verificar el cliente antes de abrir una sesión remota."),
    lesson("Lectura segura de comandos", "Antes de ejecutar un comando remoto, identifica la acción, el destino y el efecto que tendrá sobre los archivos o servicios.", ["Comando", "Destino", "Verificación"], "Analiza qué comprobarías antes de ejecutar un comando que modifica archivos en un servidor."),
  ],
  docker: [
    lesson("Qué problema resuelve Docker", "Docker empaqueta una aplicación junto a sus dependencias para ejecutar el mismo entorno de forma repetible.", ["Empaquetado", "Dependencias", "Repetibilidad"], "Explica qué problema evita Docker cuando una aplicación funciona en un equipo pero no en otro."),
    lesson("Imagen y contenedor", "Una imagen es la plantilla inmutable; un contenedor es la instancia que ejecuta procesos a partir de esa imagen.", ["Imagen", "Contenedor", "Instancia"], "Describe la diferencia entre descargar una imagen y ejecutar un contenedor."),
    lesson("Procesos aislados", "Un contenedor ejecuta procesos aislados con recursos y sistema de archivos controlados, pero comparte kernel con el host.", ["Proceso", "Aislamiento", "Kernel"], "Explica por qué un contenedor no es exactamente una máquina virtual completa."),
    lesson("Ciclo de vida", "Los contenedores se crean, inician, detienen y eliminan; los datos importantes deben vivir fuera de su ciclo efímero.", ["run", "stop", "Persistencia"], "Ordena las acciones para iniciar un contenedor, detenerlo y conservar sus datos."),
  ],
  postgres: [
    lesson("Qué problema resuelve PostgreSQL", "PostgreSQL organiza datos relacionados, permite consultarlos con SQL y protege reglas de consistencia.", ["Base de datos", "SQL", "Consistencia"], "Explica por qué una tienda necesita almacenar datos de productos y pedidos de forma relacionada."),
    lesson("Tablas, filas y columnas", "Las tablas agrupan registros con la misma estructura; cada fila es un registro y cada columna un atributo.", ["Tabla", "Fila", "Columna"], "Propón una tabla de productos con tres columnas y explica qué representa una fila."),
    lesson("Tipos de datos", "Los tipos limitan qué valores se guardan y hacen que la información tenga una forma coherente.", ["TEXT", "INTEGER", "BOOLEAN"], "Elige tipos para nombre de producto, stock y disponibilidad."),
    lesson("Pensamiento de consulta", "Una consulta parte de una pregunta: qué datos quieres, de qué tabla provienen y qué condición deben cumplir.", ["SELECT", "FROM", "WHERE"], "Formula en palabras la consulta para ver los nombres de usuarios activos."),
  ],
  typescript: [
    lesson("Qué problema resuelve TypeScript", "TypeScript añade comprobación estática a JavaScript para detectar incompatibilidades antes de ejecutar el programa.", ["Tipos", "JavaScript", "Comprobación estática"], "Explica qué error puede detectar TypeScript antes de que una aplicación se ejecute."),
    lesson("Valores y tipos", "Cada valor tiene una categoría; declarar o inferir tipos permite expresar qué datos acepta una operación.", ["string", "number", "boolean"], "Asigna un tipo adecuado a nombre, edad y activo."),
    lesson("Variables y cambios", "const protege referencias que no deben reasignarse; let se usa cuando el valor necesita cambiar durante el flujo.", ["const", "let", "Reasignación"], "Decide si usarías const o let para un contador que aumenta durante un bucle."),
    lesson("Funciones como contratos", "Una función define entradas y una salida; los tipos de parámetros y retorno documentan ese contrato.", ["Parámetro", "Retorno", "Función"], "Describe las entradas y el resultado de una función que calcula un precio con impuesto."),
  ],
};

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

const additionalLessons: Record<ModuleId, Record<LevelName, Lesson[]>> = {
  ssh: {
    Principiante: [
      lesson("Shell y terminal", "La terminal recibe texto y la shell interpreta comandos y los ejecuta en el sistema.", ["Terminal", "Shell", "Comando"], "Explica qué ocurre desde que escribes pwd hasta que aparece la ruta actual."),
      lesson("Partes de un comando", "Un comando puede incluir opciones que cambian su comportamiento y argumentos sobre los que actúa.", ["Comando", "Opción", "Argumento"], "Separa el comando, la opción y el argumento en ls -la ~/.ssh."),
      lesson("Host, usuario y puerto", "Una sesión remota necesita identificar la máquina, la cuenta y, si no es el predeterminado, el puerto SSH.", ["Host", "Usuario", "Puerto"], "Escribe el formato de conexión para el usuario ana en host.example por el puerto 2222."),
      lesson("Identidad del servidor", "La huella del servidor permite detectar cambios inesperados y evitar aceptar un host desconocido sin verificarlo.", ["Huella", "known_hosts", "Verificación"], "Describe qué deberías comprobar si SSH avisa que cambió la clave del host."),
    ],
    Básico: [
      lesson("Navegación remota segura", "Comprueba usuario y ubicación antes de modificar el servidor para evitar trabajar en una cuenta o ruta equivocada.", ["whoami", "pwd", "ls"], "Escribe una secuencia para comprobar tu usuario y listar los archivos del directorio remoto."),
      lesson("Crear y organizar directorios", "Los comandos de archivos permiten preparar destinos y ordenar datos sin salir de una sesión remota.", ["mkdir", "cp", "mv"], "Propón comandos para crear una carpeta backups y copiar dentro un archivo existente."),
      lesson("Copiar del servidor al equipo", "SCP utiliza SSH para descargar archivos. La dirección de origen y destino determina si la copia es remota o local.", ["scp", "Origen", "Destino"], "Escribe cómo descargar /var/log/app.log del servidor a una carpeta local logs."),
      lesson("Usar un puerto SSH alternativo", "El cliente permite seleccionar un puerto de destino cuando el servicio no escucha en el puerto habitual.", ["ssh -p", "Puerto", "Host"], "Construye el comando para conectar a ana@host.example usando el puerto 2222."),
      lesson("Transferencias con SFTP", "SFTP ofrece una sesión interactiva para listar y transferir archivos a través de una conexión cifrada.", ["sftp", "put", "get"], "Indica qué comando usarías dentro de SFTP para subir un archivo y descargar otro."),
      lesson("Buscar texto en archivos remotos", "Combinar herramientas de lectura y búsqueda ayuda a localizar configuración o errores sin editar a ciegas.", ["cat", "grep", "less"], "Escribe un comando para buscar la palabra error dentro de app.log."),
      lesson("Finalizar sesiones correctamente", "Cerrar una conexión libera recursos y evita dejar sesiones interactivas abiertas innecesariamente.", ["exit", "logout", "Sesión"], "Explica cómo terminar una sesión SSH y cómo comprobar que regresaste a tu terminal local."),
      lesson("Códigos de salida", "El código de salida permite a la shell y a los scripts distinguir una ejecución exitosa de un error.", ["$?", "Éxito", "Error"], "Describe cómo comprobarías si el comando anterior terminó correctamente."),
    ],
    Normal: [
      lesson("Crear claves Ed25519", "Un par Ed25519 separa la clave privada local de la clave pública que se instala en el servidor.", ["ssh-keygen", "Ed25519", "Clave pública"], "Escribe el comando para generar una clave Ed25519 y señala qué archivo compartirías."),
      lesson("Instalar una clave pública", "authorized_keys registra las claves autorizadas para una cuenta y debe protegerse contra escrituras no autorizadas.", ["authorized_keys", "ssh-copy-id", "Autorización"], "Explica qué hace ssh-copy-id y dónde termina la clave pública en el servidor."),
      lesson("Agente de claves", "ssh-agent mantiene claves desbloqueadas en memoria para reutilizarlas sin copiar la clave privada al servidor.", ["ssh-agent", "ssh-add", "Clave privada"], "Describe cuándo usarías ssh-add y por qué no debes transferir la clave privada."),
      lesson("Alias de conexión", "El archivo ~/.ssh/config permite definir nombres cortos y opciones por host sin repetirlas en cada conexión.", ["Host", "HostName", "IdentityFile"], "Esboza una entrada Host produccion que use usuario deploy y una clave específica."),
      lesson("Permisos de archivos SSH", "Los permisos estrictos protegen las claves privadas y evitan que OpenSSH rechace archivos expuestos.", ["chmod 700", "chmod 600", "Permisos"], "Indica los permisos recomendados para ~/.ssh y para una clave privada."),
      lesson("Claves de host conocidas", "known_hosts guarda identidades de servidores previamente verificadas y ayuda a advertir sobre cambios de clave.", ["known_hosts", "Huella", "MITM"], "Explica por qué no deberías aceptar automáticamente una huella cambiada en producción."),
      lesson("Reenvío de agente con precaución", "El reenvío del agente permite usar credenciales desde un host remoto, pero amplía el riesgo si ese host está comprometido.", ["ForwardAgent", "Agente", "Confianza"], "Decide cuándo desactivarías ForwardAgent y justifica tu decisión."),
      lesson("Diagnóstico con verbose", "El modo verbose expone etapas de negociación, autenticación y conexión para acotar fallos de SSH.", ["ssh -v", "Autenticación", "Diagnóstico"], "Propón el comando de diagnóstico y dos señales que revisarías en su salida."),
    ],
    Avanzado: [
      lesson("Túnel local", "El reenvío local enlaza un puerto de tu equipo con un servicio alcanzable desde el servidor remoto.", ["-L", "Puerto local", "Destino remoto"], "Crea un túnel local 8080 hacia localhost:3000 visto desde el servidor."),
      lesson("Túnel remoto", "El reenvío remoto publica en el servidor un puerto que conduce a un servicio accesible desde el equipo cliente.", ["-R", "Puerto remoto", "Servicio local"], "Describe un caso válido para reenviar un servicio local al puerto 9000 remoto."),
      lesson("ProxyJump y bastiones", "ProxyJump conecta a redes privadas a través de un bastion sin abrir una sesión manual intermedia.", ["-J", "Bastion", "Host privado"], "Escribe el patrón SSH para saltar por bastion.example hasta db.internal."),
      lesson("Proxy SOCKS dinámico", "El modo dinámico crea un proxy SOCKS local para enrutar aplicaciones compatibles por el host remoto.", ["-D", "SOCKS", "Puerto"], "Explica qué puerto local configurarías para un proxy SOCKS y qué tráfico lo usaría."),
      lesson("Multiplexar conexiones", "La multiplexación reutiliza una conexión maestra para acelerar conexiones posteriores al mismo host.", ["ControlMaster", "ControlPath", "ControlPersist"], "Propón una configuración que reutilice conexiones sin dejar sockets indefinidamente."),
      lesson("Reglas Match en configuración", "Las reglas Match aplican opciones a usuarios, hosts o direcciones concretas y permiten políticas diferenciadas.", ["Match", "User", "Address"], "Diseña una regla conceptual que aplique un puerto distinto solo a un usuario de operaciones."),
      lesson("Restringir claves autorizadas", "Las opciones de authorized_keys limitan comandos, origen o capacidades asociadas a una clave concreta.", ["command=", "from=", "no-port-forwarding"], "Explica cómo restringirías una clave de despliegue para ejecutar solo un comando permitido."),
      lesson("Política de acceso en sshd", "La configuración del servidor debe reducir cuentas y métodos habilitados según la política real de operación.", ["AllowUsers", "PasswordAuthentication", "PubkeyAuthentication"], "Define dos controles que aplicarías y una forma segura de validar la configuración antes de reiniciar."),
    ],
    Experto: [
      lesson("Endurecimiento integral de SSH", "El hardening combina autenticación fuerte, superficie mínima, restricciones de cuenta y supervisión continua.", ["Hardening", "Mínimo privilegio", "Auditoría"], "Redacta una lista de controles SSH priorizados para un servidor expuesto a Internet."),
      lesson("Certificados de usuario SSH", "Una autoridad SSH firma certificados de usuario para evitar distribuir claves autorizadas individualmente a cada host.", ["CA", "Certificado", "Principals"], "Describe cómo una CA y un principal reducen la gestión manual de claves en una flota."),
      lesson("Rotación de claves", "La rotación planificada limita la exposición de credenciales y requiere inventario, solapamiento y revocación verificables.", ["Rotación", "Inventario", "Revocación"], "Diseña un proceso de rotación sin dejar usuarios fuera ni conservar claves antiguas indefinidamente."),
      lesson("Aislamiento de port forwarding", "Las restricciones de reenvío permiten conceder acceso SSH sin convertir una cuenta en un túnel de red irrestricto.", ["PermitOpen", "AllowTcpForwarding", "Aislamiento"], "Propón cómo limitar el reenvío a un único servicio interno aprobado."),
      lesson("Auditar autenticaciones", "Los registros de autenticación ayudan a detectar patrones anómalos y a responder con evidencia sin exponer secretos.", ["sshd logs", "Failed login", "Correlación"], "Define qué campos y umbrales revisarías para detectar intentos repetidos de acceso."),
      lesson("Compatibilidad criptográfica", "La política criptográfica debe equilibrar compatibilidad heredada y algoritmos aceptables con una fecha de retirada clara.", ["KEX", "Ciphers", "HostKeyAlgorithms"], "Plantea cómo retirar un algoritmo débil sin romper conexiones legítimas de forma inesperada."),
      lesson("Alta disponibilidad de bastiones", "Los bastiones críticos requieren redundancia, configuración declarativa y pruebas de recuperación de acceso.", ["Bastion", "Redundancia", "Recuperación"], "Diseña una estrategia de failover que preserve auditoría y evite rutas de acceso no controladas."),
      lesson("Respuesta ante clave comprometida", "La respuesta debe invalidar credenciales, limitar persistencia, conservar evidencia y verificar el alcance del incidente.", ["Revocación", "Contención", "Evidencia"], "Enumera los primeros pasos si sospechas que se filtró una clave privada de producción."),
    ],
  },
  docker: {
    Principiante: [
      lesson("Imágenes frente a contenedores", "Una imagen es una plantilla y el contenedor es una instancia que ejecuta procesos a partir de ella.", ["Imagen", "Contenedor", "Instancia"], "Explica qué cambia cuando ejecutas dos contenedores desde una misma imagen."),
      lesson("Ciclo de vida de un contenedor", "Docker permite crear, iniciar, detener y eliminar instancias sin confundirlas con las imágenes.", ["run", "stop", "rm"], "Ordena los pasos para iniciar un contenedor, detenerlo y eliminarlo."),
      lesson("Nombres y estado", "Los nombres identifican contenedores y docker ps muestra los que están activos o todos los creados.", ["--name", "docker ps", "-a"], "Escribe cómo iniciarías un contenedor llamado web y después listarías todos los estados."),
      lesson("Puertos publicados", "El mapeo conecta un puerto del host con uno dentro del contenedor, permitiendo acceder al servicio.", ["-p", "Host", "Contenedor"], "Interpreta el mapeo 8080:80 e indica desde qué puerto abrirías el servicio local."),
    ],
    Básico: [
      lesson("Ejecutar en segundo plano", "El modo detached inicia el contenedor sin mantener la terminal ocupada.", ["docker run", "-d", "--name"], "Lanza nginx en segundo plano con el nombre portal."),
      lesson("Inspeccionar registros", "Los logs ayudan a entender el comportamiento de un proceso sin entrar al contenedor.", ["docker logs", "--follow", "Diagnóstico"], "Escribe el comando para seguir en vivo los registros de la API."),
      lesson("Entrar a un contenedor", "docker exec inicia un proceso adicional dentro de un contenedor que ya está corriendo.", ["docker exec", "-it", "shell"], "Abre una shell interactiva en el contenedor web usando /bin/sh."),
      lesson("Descargar una imagen", "docker pull descarga una imagen del registry para que pueda ejecutarse localmente.", ["docker pull", "Registry", "Tag"], "Descarga la imagen redis usando una etiqueta explícita."),
      lesson("Eliminar contenedores detenidos", "Separar la eliminación de contenedores de la eliminación de imágenes evita borrar recursos equivocados.", ["docker rm", "docker ps -a", "Contenedor detenido"], "Describe cómo identificar y borrar un contenedor detenido por nombre."),
      lesson("Variables de entorno", "Las variables pasan configuración al proceso del contenedor sin tener que reconstruir la imagen.", ["-e", "Variable", "Configuración"], "Ejecuta postgres con una variable POSTGRES_DB llamada tienda."),
      lesson("Montajes de archivos", "Un bind mount conecta una ruta del host con una ruta del contenedor para compartir archivos.", ["-v", "Bind mount", "Ruta"], "Propón el montaje de ./html local en /usr/share/nginx/html dentro del contenedor."),
      lesson("Verificar disponibilidad del proceso", "El estado del contenedor y sus registros ayudan a distinguir un proceso iniciado de una app lista para servir.", ["docker ps", "STATUS", "docker logs"], "Indica dos comprobaciones tras iniciar una aplicación web en Docker."),
    ],
    Normal: [
      lesson("Estructura de un Dockerfile", "Las instrucciones del Dockerfile construyen una imagen reproducible a partir de una base y un contexto.", ["FROM", "WORKDIR", "COPY"], "Esboza las instrucciones iniciales para copiar una app Node a /app."),
      lesson("Capas de imagen", "Cada instrucción de build puede crear capas cacheables; el orden afecta cuánto trabajo se repite.", ["Capas", "Cache", "Orden"], "Explica por qué conviene copiar primero package.json antes del resto del código."),
      lesson("Instalar dependencias reproducibles", "Los lockfiles fijan versiones y hacen más consistente la instalación en distintas máquinas.", ["npm ci", "Lockfile", "Build"], "Elige entre npm install y npm ci para una build reproducible y explica por qué."),
      lesson("Volúmenes persistentes", "Los volúmenes conservan datos aunque se reemplace el contenedor que los utiliza.", ["Volume", "Persistencia", "docker volume"], "Define un volumen para preservar los datos de PostgreSQL entre recreaciones."),
      lesson("Red bridge local", "Una red bridge permite que contenedores del mismo proyecto se comuniquen aislados del resto.", ["bridge", "docker network", "Aislamiento"], "Crea una red llamada backend y explica qué dos servicios conectarías allí."),
      lesson("Usuario no privilegiado", "Ejecutar la aplicación como usuario no root limita el impacto de una vulnerabilidad dentro del contenedor.", ["USER", "No root", "Permisos"], "Añade una instrucción conceptual para que el proceso de la imagen use el usuario app."),
      lesson("Señal y cierre del proceso", "Docker envía señales para detener procesos; la aplicación debe cerrar conexiones y finalizar limpiamente.", ["SIGTERM", "PID 1", "Graceful shutdown"], "Describe cómo debería reaccionar una API al recibir SIGTERM."),
      lesson("Etiquetas y versionado", "Las etiquetas explícitas facilitan identificar releases y evitan depender de referencias ambiguas.", ["Tag", "Versión", "Digest"], "Propón una etiqueta versionada para la imagen checkout y explica cuándo fijarías su digest."),
    ],
    Avanzado: [
      lesson("Docker Compose por servicios", "Compose declara servicios, redes y volúmenes en una configuración reproducible.", ["compose.yaml", "services", "depends_on"], "Describe los servicios mínimos para una API y una base de datos con persistencia."),
      lesson("Healthchecks útiles", "Una comprobación de salud valida disponibilidad funcional, no solo que el proceso siga vivo.", ["healthcheck", "Interval", "Retries"], "Diseña la intención de un healthcheck HTTP para una API que escucha en 3000."),
      lesson("Redes y segmentación", "Separar redes frontend y backend reduce qué servicios pueden alcanzar componentes sensibles.", ["Frontend", "Backend", "Network"], "Diseña qué redes compartirían proxy, API y base de datos, evitando exponer la base."),
      lesson("Secretos en despliegues", "Las credenciales deben inyectarse mediante mecanismos de secretos y no quedar en imágenes o repositorios.", ["Secrets", "Environment", "Filtración"], "Indica cómo entregarías una contraseña de base de datos sin escribirla en el Dockerfile."),
      lesson("Límites de recursos", "Los límites de CPU y memoria ayudan a contener servicios que consumen recursos excesivos.", ["CPU", "Memoria", "Límites"], "Propón qué observaciones necesitas antes de fijar el límite de memoria de una API."),
      lesson("Dependencias y disponibilidad", "La coordinación de arranque debe combinar orden de servicios con healthchecks y reintentos de aplicación.", ["depends_on", "Healthcheck", "Retry"], "Explica por qué depends_on por sí solo no garantiza que PostgreSQL acepte conexiones."),
      lesson("Actualizaciones sin pérdida de datos", "La estrategia de recreación debe separar estado persistente de contenedores reemplazables.", ["Volume", "Recreate", "Rollback"], "Describe un despliegue de nueva imagen que preserve datos y permita volver a la versión anterior."),
      lesson("Depurar una red de Compose", "Resolución DNS de servicio, puertos internos y publicación al host son capas diferentes de conectividad.", ["DNS de servicio", "Puerto interno", "Published port"], "Diagnostica por qué una API dentro de Compose no debería conectarse a localhost:5432."),
    ],
    Experto: [
      lesson("Builds multietapa", "Las etapas separan compilación de runtime y permiten transferir solo los artefactos necesarios a la imagen final.", ["Multi-stage", "Build stage", "Runtime"], "Diseña una etapa de build y otra mínima para desplegar una aplicación TypeScript."),
      lesson("Reducir superficie y tamaño", "Imágenes mínimas y dependencias de producción reducen descargas y componentes que requieren actualización.", ["Distroless", "Producción", "Superficie"], "Plantea cómo reducirías una imagen Node sin perder diagnóstico operativo básico."),
      lesson("SBOM y escaneo de vulnerabilidades", "El inventario de componentes y el escaneo ayudan a priorizar vulnerabilidades en la cadena de suministro.", ["SBOM", "CVE", "Escaneo"], "Define qué artefactos guardarías y cómo bloquearías una release con una vulnerabilidad crítica."),
      lesson("Provenance de imágenes", "Firmas y attestations aportan evidencia sobre quién construyó una imagen y con qué fuentes.", ["Firma", "Provenance", "Registry"], "Esboza una política para aceptar en producción solo imágenes verificadas del pipeline."),
      lesson("Orquestación de despliegues", "Un despliegue fiable considera réplicas, readiness, drenaje y rollback, no solo iniciar contenedores.", ["Readiness", "Replicas", "Rollback"], "Diseña un rollout que no envíe tráfico a una instancia hasta que pase su healthcheck."),
      lesson("Observabilidad de contenedores", "Métricas, logs y trazas correlacionadas permiten investigar saturación y fallos entre servicios.", ["Metrics", "Logs", "Traces"], "Elige señales para diagnosticar reinicios y latencia alta en un servicio containerizado."),
      lesson("Runtime y aislamiento", "Namespaces, capabilities y políticas de seguridad controlan qué recursos ve un proceso dentro del contenedor.", ["Capabilities", "Namespaces", "Seccomp"], "Reduce privilegios de un contenedor que solo necesita servir HTTP en un puerto alto."),
      lesson("Recuperación de volúmenes", "La persistencia necesita backups consistentes, retención definida y pruebas de restauración documentadas.", ["Backup", "Restore", "RPO"], "Propón una prueba periódica para demostrar que un volumen de base de datos es restaurable."),
    ],
  },
  postgres: {
    Principiante: [
      lesson("Lógica aplicada a datos", "Diseñar una consulta empieza por definir qué filas buscas y qué columnas necesitas devolver.", ["Filas", "Columnas", "Criterio"], "Describe cómo encontrarías los nombres de usuarios activos de una lista de registros."),
      lesson("Tablas y registros", "Una tabla agrupa filas con la misma estructura; cada fila representa un registro.", ["Tabla", "Fila", "Registro"], "Diseña una tabla de libros con tres columnas y explica qué representa cada fila."),
      lesson("Columnas y tipos", "Los tipos definen qué valores acepta cada columna y ayudan a mantener consistencia.", ["TEXT", "INTEGER", "BOOLEAN"], "Asigna tipos adecuados para nombre, cantidad y estado activo de un producto."),
      lesson("Leer una consulta SELECT", "SELECT elige datos y FROM identifica la tabla donde se encuentran.", ["SELECT", "FROM", "Consulta"], "Escribe una consulta que muestre nombre y correo desde usuarios."),
    ],
    Básico: [
      lesson("Filtrar con WHERE", "WHERE restringe el resultado a filas que cumplen una condición.", ["WHERE", "Condición", "Boolean"], "Consulta los pedidos cuyo total sea mayor que 100."),
      lesson("Ordenar resultados", "ORDER BY organiza filas por una o más columnas y permite elegir dirección ascendente o descendente.", ["ORDER BY", "ASC", "DESC"], "Ordena clientes primero por apellido ascendente y después por id."),
      lesson("Limitar resultados", "LIMIT reduce la cantidad de filas devueltas, útil para muestras y paginación básica.", ["LIMIT", "Filas", "Paginación"], "Muestra los cinco productos más recientes usando orden y límite."),
      lesson("Insertar una fila", "INSERT INTO añade datos y debe declarar columnas y valores compatibles.", ["INSERT INTO", "VALUES", "Columnas"], "Crea una inserción para un usuario llamado Ada con correo ada@example.com."),
      lesson("Actualizar con seguridad", "UPDATE modifica filas; una condición precisa evita cambiar toda la tabla accidentalmente.", ["UPDATE", "SET", "WHERE"], "Desactiva un usuario por id y explica por qué incluyes WHERE."),
      lesson("Eliminar filas", "DELETE elimina datos y conviene revisar primero la condición con un SELECT equivalente.", ["DELETE", "WHERE", "Revisión"], "Describe cómo borrarías una sesión por id tras comprobar qué fila se afectará."),
      lesson("Valores nulos", "NULL representa información ausente y se comprueba con IS NULL en lugar de comparaciones ordinarias.", ["NULL", "IS NULL", "IS NOT NULL"], "Busca los productos que todavía no tienen descripción."),
      lesson("Combinar condiciones", "AND y OR combinan criterios; los paréntesis aclaran precedencia y reducen errores.", ["AND", "OR", "Paréntesis"], "Filtra pedidos pagados que superen 50 o pedidos urgentes, agrupando la condición correctamente."),
    ],
    Normal: [
      lesson("Claves primarias", "Una clave primaria identifica cada fila y no admite valores duplicados ni ausentes.", ["PRIMARY KEY", "Unicidad", "Identidad"], "Define la clave primaria adecuada para una tabla de clientes."),
      lesson("Claves foráneas", "Una clave foránea impide referencias a registros inexistentes y declara relaciones entre tablas.", ["FOREIGN KEY", "Integridad", "Relación"], "Relaciona cada pedido con un cliente existente usando una clave foránea."),
      lesson("INNER JOIN", "INNER JOIN conserva filas con coincidencia en ambas tablas según la condición ON.", ["INNER JOIN", "ON", "Coincidencia"], "Muestra nombres de clientes junto al total de sus pedidos coincidentes."),
      lesson("LEFT JOIN", "LEFT JOIN conserva todas las filas izquierdas incluso cuando no existe pareja a la derecha.", ["LEFT JOIN", "NULL", "Opcional"], "Encuentra clientes que todavía no tienen pedidos."),
      lesson("Agregaciones", "COUNT, SUM y AVG resumen conjuntos de filas sin devolver cada detalle individual.", ["COUNT", "SUM", "AVG"], "Calcula el número y el importe total de pedidos."),
      lesson("Agrupar resultados", "GROUP BY calcula agregaciones por categoría y HAVING filtra grupos después del cálculo.", ["GROUP BY", "HAVING", "Agregación"], "Cuenta pedidos por cliente y muestra solo clientes con más de tres."),
      lesson("Subconsultas", "Una subconsulta expresa un conjunto intermedio que puede servir como filtro o fuente de datos.", ["Subconsulta", "IN", "EXISTS"], "Encuentra productos que aparecen en al menos un detalle de pedido usando EXISTS."),
      lesson("CTE con WITH", "Un CTE da nombre a una consulta intermedia y puede hacer más legible una transformación compleja.", ["WITH", "CTE", "Consulta"], "Separa en un CTE los pedidos recientes antes de contarlos por cliente."),
    ],
    Avanzado: [
      lesson("Transacciones", "BEGIN, COMMIT y ROLLBACK agrupan operaciones para confirmar o deshacer cambios relacionados.", ["BEGIN", "COMMIT", "ROLLBACK"], "Modela una transferencia bancaria que descuente y acredite saldo como una sola unidad."),
      lesson("Propiedades ACID", "Atomicidad, consistencia, aislamiento y durabilidad describen garantías de las transacciones.", ["Atomicidad", "Aislamiento", "Durabilidad"], "Explica qué propiedad evita dejar una transferencia aplicada solo en una cuenta."),
      lesson("Índices B-tree", "Un índice B-tree acelera búsquedas y ordenamientos selectivos, con coste en espacio y escrituras.", ["CREATE INDEX", "B-tree", "Selectividad"], "Decide si indexarías email para una búsqueda frecuente de igualdad y justifica el impacto."),
      lesson("Leer EXPLAIN", "EXPLAIN muestra el plan estimado y permite localizar escaneos costosos antes de optimizar.", ["EXPLAIN", "Seq Scan", "Plan"], "Interpreta qué investigarías si una consulta frecuente usa un Seq Scan sobre una tabla grande."),
      lesson("Bloqueos y concurrencia", "Los bloqueos coordinan cambios simultáneos y su alcance puede provocar esperas o deadlocks.", ["Lock", "Concurrencia", "Deadlock"], "Propón cómo ordenar actualizaciones de dos cuentas para reducir riesgo de deadlock."),
      lesson("Restricciones de datos", "CHECK, UNIQUE y NOT NULL hacen cumplir reglas en la base aunque cambie el cliente.", ["CHECK", "UNIQUE", "NOT NULL"], "Define restricciones para que un precio no sea negativo y el correo sea único."),
      lesson("Funciones de ventana", "Las funciones de ventana calculan métricas por grupo sin colapsar filas como GROUP BY.", ["OVER", "PARTITION BY", "RANK"], "Asigna un ranking de ventas dentro de cada región conservando cada vendedor."),
      lesson("Vistas y contratos", "Una vista encapsula una consulta y puede proporcionar una interfaz estable para consumidores.", ["CREATE VIEW", "Contrato", "Permisos"], "Diseña una vista pública que omita datos personales sensibles de usuarios."),
    ],
    Experto: [
      lesson("Diagnóstico con EXPLAIN ANALYZE", "El plan real revela tiempos, filas estimadas frente a reales y nodos que concentran coste.", ["EXPLAIN ANALYZE", "Rows", "Buffers"], "Lista qué diferencias entre filas estimadas y reales pueden indicar estadísticas obsoletas."),
      lesson("Estadísticas y estimación", "El planner usa estadísticas para estimar cardinalidad y seleccionar operadores y orden de joins.", ["ANALYZE", "Cardinality", "Planner"], "Propón cómo investigar una estimación muy alejada del número de filas real."),
      lesson("Índices compuestos", "El orden de columnas en un índice compuesto determina qué prefijos pueden aprovechar consultas.", ["Composite index", "Prefijo", "Orden"], "Diseña un índice para filtrar por tenant_id y created_at y explica el orden elegido."),
      lesson("Particionado", "El particionado divide tablas grandes y puede reducir el trabajo si las consultas filtran por la clave de partición.", ["PARTITION BY", "Pruning", "Retención"], "Evalúa particionar eventos por mes y qué condición debe incluir la consulta para podar particiones."),
      lesson("Aislamiento y anomalías", "Los niveles de aislamiento equilibran concurrencia con fenómenos como lecturas no repetibles o serialización.", ["READ COMMITTED", "SERIALIZABLE", "Anomalía"], "Elige nivel de aislamiento para una operación crítica y explica qué anomalía quieres evitar."),
      lesson("Diseño de índices parciales", "Un índice parcial almacena solo filas que cumplen un predicado y puede ser menor para patrones estables.", ["WHERE index", "Predicado", "Tamaño"], "Diseña un índice parcial para buscar tareas pendientes y comenta cuándo no serviría."),
      lesson("Seguridad por filas", "Row Level Security aplica políticas por fila dentro de la base además de los permisos de tabla.", ["RLS", "Policy", "Tenant"], "Esboza una política que limite a cada tenant a sus propias filas."),
      lesson("Backups y recuperación PITR", "La recuperación puntual combina una base consistente y WAL para reconstruir un estado ante un incidente.", ["WAL", "PITR", "Restore"], "Define cómo probarías una restauración a un instante previo a un borrado accidental."),
    ],
  },
  typescript: {
    Principiante: [
      lesson("Pensamiento lógico con valores tipados", "La lógica de un programa transforma entradas en salidas y los tipos ayudan a describir qué datos se permiten.", ["Entrada", "Salida", "Tipo"], "Define qué entrada y salida tendría una función que calcula el precio con impuesto."),
      lesson("Variables y valores", "Las variables con const o let guardan valores y TypeScript infiere tipos a partir de su inicialización.", ["const", "let", "Inferencia"], "Declara una constante nombre de texto y una variable contador numérica."),
      lesson("Tipos primitivos", "string, number y boolean describen categorías frecuentes de valores y previenen asignaciones incompatibles.", ["string", "number", "boolean"], "Asigna tipos a nombre, edad y activo en un perfil simple."),
      lesson("Funciones y retorno", "Una función recibe parámetros, ejecuta una operación y devuelve un resultado con un contrato explícito.", ["Parámetro", "Retorno", "Firma"], "Escribe la firma de una función que reciba dos números y devuelva su suma."),
    ],
    Básico: [
      lesson("Arrays tipados", "Los arrays tipados agrupan elementos del mismo tipo y permiten recorrer colecciones con seguridad.", ["Array", "number[]", "Índice"], "Declara una lista de puntuaciones y calcula cómo recorrerías sus elementos."),
      lesson("Objetos y propiedades", "Los objetos agrupan campos relacionados y sus tipos describen la forma esperada.", ["Objeto", "Propiedad", "Tipo"], "Modela un objeto libro con título, páginas y disponible."),
      lesson("Uniones literales", "Las uniones limitan una variable a alternativas concretas y evitan estados arbitrarios.", ["Union", "Literal", "Estado"], "Define un tipo EstadoCarga con idle, loading, success y error."),
      lesson("Condiciones y narrowing", "Las comprobaciones como typeof refinan el tipo disponible dentro de cada rama.", ["if", "typeof", "Narrowing"], "Escribe una función que acepte string o number y compruebe el tipo antes de operar."),
      lesson("Parámetros opcionales", "Un parámetro opcional puede omitirse y debe tratarse como posiblemente undefined.", ["?", "undefined", "Default"], "Diseña un saludo con nombre obligatorio y saludo opcional con valor predeterminado."),
      lesson("Interfaces sencillas", "Una interface declara propiedades esperadas para objetos y facilita reutilizar contratos.", ["interface", "Propiedades", "Contrato"], "Define una interface Usuario con id numérico y nombre de texto."),
      lesson("Bucles y colecciones", "Los bucles recorren datos y el tipado mantiene visible la forma de cada elemento procesado.", ["for...of", "Array", "Elemento"], "Recorre una lista de números y describe cómo acumularías solo los positivos."),
      lesson("Módulos e imports", "Los módulos separan responsabilidades y exportan símbolos que otros archivos importan explícitamente.", ["export", "import", "Módulo"], "Explica cómo exportarías una función validarEmail y la importarías en otro archivo."),
    ],
    Normal: [
      lesson("Interfaces y propiedades opcionales", "Las interfaces modelan objetos y sus propiedades opcionales representan datos que pueden no estar presentes.", ["interface", "Optional", "Readonly"], "Define Perfil con nombre obligatorio, biografia opcional e id de solo lectura."),
      lesson("Alias y uniones discriminadas", "Los alias nombran composiciones y un discriminante permite distinguir variantes de forma segura.", ["type", "Discriminante", "Union"], "Modela una respuesta API como success con data o error con message."),
      lesson("Genéricos en funciones", "Los genéricos relacionan el tipo recibido con el devuelto sin perder la información concreta.", ["<T>", "Inferencia", "Retorno"], "Implementa conceptualmente una función identidad que conserva el tipo de su argumento."),
      lesson("Restricciones genéricas", "extends limita los tipos aceptados por un genérico para garantizar que exista una propiedad requerida.", ["extends", "keyof", "Restricción"], "Diseña una función que reciba un objeto y una clave válida de ese objeto."),
      lesson("Enums frente a uniones", "Las uniones literales suelen expresar estados finitos con menos emisión y una API más directa.", ["Enum", "Union literal", "Estado"], "Representa tres roles con una unión literal y explica por qué evita valores inventados."),
      lesson("Tipos de retorno y never", "Anotar retornos aclara contratos; never representa rutas que no devuelven un valor normal.", ["Return type", "never", "Exhaustividad"], "Explica qué tipo debería devolver una función que siempre lanza un error."),
      lesson("Utility types Partial y Pick", "Los utility types construyen variantes de un tipo existente sin duplicar propiedades manualmente.", ["Partial", "Pick", "Update"], "Deriva un tipo de actualización opcional que solo permita modificar nombre y correo."),
      lesson("Tipar promesas", "Promise<T> declara el valor que estará disponible cuando termine una operación asíncrona.", ["Promise", "async", "await"], "Escribe la firma de una función que carga un usuario por id de forma asíncrona."),
    ],
    Avanzado: [
      lesson("Narrowing exhaustivo", "never y una rama default detectan variantes nuevas que todavía no se manejan en una unión.", ["never", "switch", "Exhaustividad"], "Diseña un switch exhaustivo para los estados success, loading y error."),
      lesson("Tipos condicionales", "Un tipo condicional elige una salida según una relación entre tipos y puede distribuirse sobre uniones.", ["extends", "Conditional", "Distribución"], "Explica qué variante produciría un tipo condicional aplicado a string o number."),
      lesson("infer y extracción de tipos", "infer permite capturar una parte de un tipo dentro de una condición para reutilizarla.", ["infer", "ReturnType", "Extracción"], "Describe cómo extraerías el tipo de retorno de una función mediante una utilidad condicional."),
      lesson("Mapped types", "Un mapped type transforma cada clave de un tipo existente para derivar una nueva estructura.", ["Mapped type", "keyof", "Modificador"], "Construye conceptualmente un tipo que vuelva opcionales todas las propiedades de T."),
      lesson("Plantillas literales", "Los template literal types componen cadenas de tipos y restringen formatos de claves o eventos.", ["Template literal", "Union", "Patrón"], "Define el formato de eventos como user:created o user:deleted a partir de una unión."),
      lesson("Utility types avanzados", "Record, Omit y ReturnType ayudan a transformar y reutilizar contratos a gran escala.", ["Record", "Omit", "ReturnType"], "Crea un mapa de permisos por rol sin repetir manualmente la estructura del objeto."),
      lesson("Tipos de predicado", "Un type predicate comunica al compilador que una función de validación refina el tipo de su argumento.", ["is", "Type guard", "Validación"], "Esboza una función esUsuario que compruebe una propiedad y estreche unknown a Usuario."),
      lesson("Configuración strict", "strictNullChecks y noImplicitAny hacen explícitos casos que de otro modo quedarían sin contrato seguro.", ["strict", "strictNullChecks", "noImplicitAny"], "Identifica cómo cambiarías una firma que actualmente devuelve any y puede devolver null."),
    ],
    Experto: [
      lesson("Diseñar una API de tipos", "Una API de tipos equilibrada guía al consumidor y evita que detalles internos contaminen el contrato público.", ["API pública", "Inferencia", "Compatibilidad"], "Revisa un helper genérico y decide qué tipos deben inferirse y cuáles exponerse."),
      lesson("Tipos recursivos", "Los tipos recursivos representan estructuras anidadas, aunque demasiada profundidad puede elevar el coste del compilador.", ["Recursividad", "Tupla", "Límite"], "Modela un valor JSON recursivo y señala cómo evitarías un tipo excesivamente costoso."),
      lesson("Variadic tuple types", "Las tuplas variádicas modelan funciones que concatenan o preservan secuencias de argumentos tipados.", ["Variadic tuple", "Spread", "Inferencia"], "Describe una firma que anteponga un elemento a una tupla sin perder sus tipos."),
      lesson("Branded types", "Los tipos nominales simulados distinguen valores primitivos que comparten representación pero tienen significados diferentes.", ["Brand", "Nominal", "Validación"], "Distingue UserId de OrderId sin cambiar que ambos se representen como string."),
      lesson("Manejo seguro de unknown", "unknown obliga a validar datos externos antes de acceder a propiedades o tratarlos como un tipo interno.", ["unknown", "Guard", "Parse"], "Diseña la validación de una respuesta JSON desconocida antes de usar su campo id."),
      lesson("Rendimiento del compilador", "Tipos complejos y uniones grandes pueden ralentizar el checker; simplificar contratos mejora diagnósticos.", ["Checker", "Unión", "Complejidad"], "Propón cómo aislarías un tipo lento y medirías el efecto de simplificarlo."),
      lesson("Compatibilidad de declaraciones", "Las declaraciones públicas deben evolucionar con cuidado para no romper consumidores ni inferencias existentes.", [".d.ts", "SemVer", "Breaking change"], "Evalúa si cambiar una propiedad opcional a obligatoria constituye un cambio incompatible."),
      lesson("Pruebas de tipos", "Las pruebas de tipos verifican contratos estáticos y casos inválidos que una prueba de runtime no detecta.", ["Type test", "@ts-expect-error", "Contrato"], "Propón una prueba positiva y otra negativa para una función que acepte solo claves válidas."),
    ],
  },
};

const getLevelLessons = (moduleId: ModuleId, levelName: LevelName) => {
  const baseLessons = courses[moduleId].levels[levelName];
  const moduleLessons = levelName === "Principiante"
    ? [...moduleFoundations[moduleId], ...baseLessons.slice(foundations.length)]
    : baseLessons;
  return [...moduleLessons, ...additionalLessons[moduleId][levelName]];
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

const normalizeCourseProgress = (value: unknown): Record<string, string[]> => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) && entry[1].every((item) => typeof item === "string")
    )
  );
};

const loadLocalCourseProgress = (storageKey: string) => {
  try {
    const saved = localStorage.getItem(storageKey);
    return normalizeCourseProgress(saved ? JSON.parse(saved) : {});
  } catch {
    return {};
  }
};

export default function CoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const { setPracticeContext } = useChallengeMode();
  const { isEnglish } = usePlatformMode();
  const [selectedModule, setSelectedModule] = useState<ModuleId>("ssh");
  const [selectedLevel, setSelectedLevel] = useState<LevelName>("Principiante");
  const [openLesson, setOpenLesson] = useState(0);
  const [courseProgress, setCourseProgress] = useState<Record<string, string[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [progressLoadedFor, setProgressLoadedFor] = useState<string | null>(null);
  const [progressLoadError, setProgressLoadError] = useState("");
  const [savingExerciseKey, setSavingExerciseKey] = useState<string | null>(null);
  const progressStorageKey = `devpracticelab_course_progress_${encodeURIComponent(user?.email ?? "guest")}`;

  // English Mode State
  const [selectedEnglishCourseId, setSelectedEnglishCourseId] = useState<string>("fundamentals");
  const [selectedEnglishLessonIdx, setSelectedEnglishLessonIdx] = useState<number>(0);
  const [selectedDrillOption, setSelectedDrillOption] = useState<Record<string, string>>({});
  const [drillFeedback, setDrillFeedback] = useState<Record<string, { ok: boolean; message: string; explanation: string } | null>>({});
  const [completedEnglishLessons, setCompletedEnglishLessons] = useState<string[]>([]);

  const currentEnglishCourse = TOP_NOTCH_COURSES.find((c) => c.id === selectedEnglishCourseId) || TOP_NOTCH_COURSES[0];
  const currentEnglishLesson = currentEnglishCourse.lessons[selectedEnglishLessonIdx] || currentEnglishCourse.lessons[0];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`topnotch_courses_completed_${user?.email ?? "guest"}`);
      if (saved) {
        setCompletedEnglishLessons(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, [user?.email]);

  const toggleEnglishLessonCompleted = (lessonId: string) => {
    const updated = completedEnglishLessons.includes(lessonId)
      ? completedEnglishLessons.filter((id) => id !== lessonId)
      : [...completedEnglishLessons, lessonId];
    setCompletedEnglishLessons(updated);
    try {
      localStorage.setItem(`topnotch_courses_completed_${user?.email ?? "guest"}`, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleDrillSubmit = (drillLesson: EnglishLesson) => {
    const selected = selectedDrillOption[drillLesson.id];
    if (!selected) return;

    const isCorrect = selected === drillLesson.interactiveDrill.correctAnswer;
    setDrillFeedback((prev) => ({
      ...prev,
      [drillLesson.id]: {
        ok: isCorrect,
        message: isCorrect ? "¡Excelente! Respuesta correcta." : "Incorrecto. Revisa la regla gramatical e inténtalo de nuevo.",
        explanation: drillLesson.interactiveDrill.explanation,
      },
    }));

    if (isCorrect && !completedEnglishLessons.includes(drillLesson.id)) {
      toggleEnglishLessonCompleted(drillLesson.id);
    }
  };

  const currentCourse = courses[selectedModule];
  const Icon = currentCourse.icon;
  const tone = toneClasses[currentCourse.tone];
  const lessons = getLevelLessons(selectedModule, selectedLevel);
  const activeLessonTitle = lessons[openLesson]?.title;

  useEffect(() => {
    if (authLoading) return;

    const cancelled = false;
    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          if (user) {
            const response = await fetch("/api/courses/progress", { cache: "no-store" });
            const data: { progress?: unknown; error?: string } = await response.json();
            if (!response.ok) throw new Error(data.error || "No se pudo cargar el progreso guardado.");
            if (!cancelled) setCourseProgress(normalizeCourseProgress(data.progress));
          } else if (!cancelled) {
            setCourseProgress(loadLocalCourseProgress(progressStorageKey));
          }
        } catch (error) {
          if (!cancelled) {
            setCourseProgress(user ? {} : loadLocalCourseProgress(progressStorageKey));
            setProgressLoadError(error instanceof Error ? error.message : "No se pudo cargar el progreso.");
          }
        } finally {
          if (!cancelled) setProgressLoadedFor(progressStorageKey);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [authLoading, progressStorageKey, user]);

  useEffect(() => {
    if (progressLoadedFor !== progressStorageKey) return;
    try {
      localStorage.setItem(progressStorageKey, JSON.stringify(courseProgress));
    } catch (error) {
      console.error("No se pudo guardar el progreso de los cursos:", error);
    }
  }, [courseProgress, progressLoadedFor, progressStorageKey]);

  useEffect(() => {
    setPracticeContext({
      type: "course",
      module: selectedModule,
      level: selectedLevel,
      title: activeLessonTitle,
    });
  }, [activeLessonTitle, selectedLevel, selectedModule, setPracticeContext]);

  const isLevelComplete = (moduleId: ModuleId, levelName: LevelName) => {
    if (progressLoadedFor !== progressStorageKey) return false;
    const key = `${moduleId}:${levelName}`;
    const completed = courseProgress[key] ?? [];
    return getLevelLessons(moduleId, levelName).every((item) => completed.includes(item.title));
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

  const verifyExercise = async (item: Lesson) => {
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
      setSavingExerciseKey(exerciseKey);
      try {
        if (user) {
          const response = await fetch("/api/courses/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moduleKey: selectedModule, levelName: selectedLevel, lessonTitle: item.title }),
          });
          const data: { error?: string } = await response.json();
          if (!response.ok) throw new Error(data.error || "No se pudo guardar el progreso en la base de datos.");
        }

        setCourseProgress((current) => {
          const levelKey = `${selectedModule}:${selectedLevel}`;
          const completed = current[levelKey] ?? [];
          return completed.includes(item.title) ? current : { ...current, [levelKey]: [...completed, item.title] };
        });
        setProgressLoadError("");
        setExerciseFeedback((current) => ({
          ...current,
          [exerciseKey]: {
            ok: true,
            message: user ? "Ejercicio aprobado y progreso guardado en la base de datos." : "Ejercicio aprobado; el progreso se guardó en este navegador.",
          },
        }));
      } catch (error) {
        setExerciseFeedback((current) => ({
          ...current,
          [exerciseKey]: {
            ok: false,
            message: error instanceof Error ? error.message : "No se pudo guardar el progreso.",
          },
        }));
      } finally {
        setSavingExerciseKey(null);
      }
      return;
    }
    setExerciseFeedback((current) => ({
      ...current,
      [exerciseKey]: { ok: true, message: "Este ejercicio ya está aprobado." },
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

  if (isEnglish) {
    return (
      <div className="flex min-h-screen flex-col bg-[#030814] text-slate-100 transition-colors duration-300">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-12 space-y-10">
          {/* Hero Section */}
          <section className="border-b border-blue-900/50 pb-8">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
              <Languages className="h-4 w-4" />
              <span>Programa de Cursos Top Notch & Summit (A1 — C1)</span>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="text-3xl font-black text-white sm:text-4xl">
                  Cursos Estructurados por Libro
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
                  Aprende paso a paso con las unidades pedagógicas de Top Notch. Cada lección integra metas comunicativas, gramática activa, vocabulario aplicado y ejercicios interactivos con feedback en tiempo real.
                </p>
              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-sky-400/30 bg-blue-950/60 p-4 shadow-lg shadow-sky-500/5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Progreso Global de Lecciones</p>
                  <p className="text-lg font-bold text-white">
                    {completedEnglishLessons.length} lecciones completadas
                  </p>
                </div>
              </div>
            </div>

            {/* Book Level Tabs */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {TOP_NOTCH_COURSES.map((course) => {
                const isSelected = selectedEnglishCourseId === course.id;
                const completedInThisLevel = course.lessons.filter((l) => completedEnglishLessons.includes(l.id)).length;
                return (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedEnglishCourseId(course.id);
                      setSelectedEnglishLessonIdx(0);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border border-sky-400 bg-sky-500/20 text-white shadow-md shadow-sky-500/10"
                        : "border border-blue-900/60 bg-blue-950/40 text-slate-300 hover:border-blue-700 hover:text-white"
                    }`}
                  >
                    <span className="rounded-md bg-sky-400/20 px-1.5 py-0.5 font-mono text-[10px] text-sky-300">
                      {course.code}
                    </span>
                    <span className="truncate max-w-[130px] sm:max-w-none">{course.bookTitle}</span>
                    <span className="rounded-full bg-blue-900/80 px-2 py-0.5 text-[10px] text-sky-300">
                      {completedInThisLevel}/{course.lessons.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Active Course View */}
          <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
            {/* Left: Units / Lessons List */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-blue-900/60 bg-[#07152b] p-5">
                <div className="mb-4">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">{currentEnglishCourse.cefr}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{currentEnglishCourse.bookTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{currentEnglishCourse.description}</p>
                </div>

                <div className="space-y-2 border-t border-blue-900/50 pt-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Unidades del Libro:</p>
                  <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-900/50 scrollbar-track-transparent">
                    {currentEnglishCourse.lessons.map((l, idx) => {
                      const isSelected = selectedEnglishLessonIdx === idx;
                      const isDone = completedEnglishLessons.includes(l.id);
                      return (
                        <button
                          key={l.id}
                          onClick={() => setSelectedEnglishLessonIdx(idx)}
                          className={`w-full text-left rounded-xl p-3 text-xs transition-all flex items-start justify-between gap-2.5 ${
                            isSelected
                              ? "bg-blue-600/30 border border-sky-400/60 text-white font-bold shadow-sm"
                              : "bg-blue-950/40 hover:bg-blue-950/80 text-slate-300 border border-transparent"
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0 flex-1">
                            <span className={`flex h-5 w-5 shrink-0 mt-0.5 items-center justify-center rounded-full text-[10px] font-bold ${
                              isDone ? "bg-sky-400 text-zinc-950 shadow-xs" : "bg-blue-900/80 text-sky-300"
                            }`}>
                              {isDone ? "✓" : idx + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs leading-snug break-words">{l.title}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 break-words">{l.grammarFocus}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-blue-900/50">
                  <Link
                    href={`/challenges?level=${currentEnglishCourse.id}`}
                    className="flex items-center justify-center gap-2 w-full rounded-xl bg-sky-400 hover:bg-sky-300 text-zinc-950 py-2.5 text-xs font-bold transition shadow-md shadow-sky-500/10"
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Retos de este Libro</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Active Lesson Detail */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-blue-900/60 bg-[#07152b] p-6 sm:p-8 shadow-xl shadow-blue-950/20 space-y-6">
                {/* Lesson Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-900/50">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-md bg-sky-500/20 px-2 py-0.5 text-[11px] font-bold text-sky-300">
                        {currentEnglishLesson.cefrLevel}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Unidad {currentEnglishLesson.unitNumber}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{currentEnglishLesson.title}</h2>
                  </div>

                  <button
                    onClick={() => toggleEnglishLessonCompleted(currentEnglishLesson.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      completedEnglishLessons.includes(currentEnglishLesson.id)
                        ? "bg-sky-500/20 border border-sky-400/40 text-sky-300"
                        : "bg-blue-950 border border-blue-800 text-slate-300 hover:border-sky-400"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {completedEnglishLessons.includes(currentEnglishLesson.id)
                        ? "Lección Completada ✓"
                        : "Marcar como Completada"}
                    </span>
                  </button>
                </div>

                {/* Communicative Goal Banner */}
                <div className="rounded-xl border border-sky-500/30 bg-blue-950/60 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                    Meta Comunicativa Top Notch:
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {currentEnglishLesson.communicativeGoal}
                  </p>
                </div>

                {/* Grammar & Vocabulary Breakdown */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-blue-900/60 bg-blue-950/30 p-5 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                      Enfoque Gramatical
                    </h4>
                    <p className="text-xs font-bold text-white">{currentEnglishLesson.grammarFocus}</p>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">{currentEnglishLesson.explanation}</p>
                  </div>

                  <div className="rounded-xl border border-blue-900/60 bg-blue-950/30 p-5 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                      <BookMarked className="h-3.5 w-3.5 text-sky-400" />
                      Vocabulario Clave de la Unidad
                    </h4>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentEnglishLesson.vocabularyKeywords.map((w, idx) => (
                        <span key={idx} className="rounded-md bg-sky-950/80 border border-sky-500/20 px-2.5 py-1 text-xs text-sky-200 font-medium">
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dialogue Scenario */}
                <div className="rounded-xl border border-blue-900/60 bg-blue-950/30 p-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                    <Languages className="h-4 w-4 text-sky-400" />
                    Diálogo Modelo & Conversación Práctica
                  </h4>
                  <div className="space-y-3 pt-1">
                    {currentEnglishLesson.dialogue.map((line, idx) => (
                      <div key={idx} className="border-l-2 border-sky-400/60 pl-3.5 space-y-0.5">
                        <p className="text-xs font-bold text-white">
                          <span className="text-sky-300 mr-1.5 font-mono">{line.speaker}:</span>
                          &ldquo;{line.text}&rdquo;
                        </p>
                        <p className="text-[11px] text-slate-400 italic">{line.translation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Drill Exercise */}
                <div className="rounded-xl border border-sky-400/40 bg-[#06142a] p-6 space-y-4 shadow-lg shadow-sky-950/40">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                    <HelpCircle className="h-4 w-4" />
                    <span>Ejercicio Interactivo de la Lección</span>
                  </div>

                  <p className="text-sm font-bold text-white">
                    {currentEnglishLesson.interactiveDrill.question}
                  </p>

                  <div className="space-y-2">
                    {currentEnglishLesson.interactiveDrill.options.map((option, idx) => {
                      const isSelected = selectedDrillOption[currentEnglishLesson.id] === option;
                      return (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 rounded-xl p-3 text-xs cursor-pointer transition border ${
                            isSelected
                              ? "border-sky-400 bg-sky-500/20 text-white font-semibold"
                              : "border-blue-900/60 bg-blue-950/40 text-slate-300 hover:border-blue-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`drill-${currentEnglishLesson.id}`}
                            value={option}
                            checked={isSelected}
                            onChange={() => setSelectedDrillOption((prev) => ({ ...prev, [currentEnglishLesson.id]: option }))}
                            className="text-sky-500 focus:ring-sky-400"
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      onClick={() => handleDrillSubmit(currentEnglishLesson)}
                      disabled={!selectedDrillOption[currentEnglishLesson.id]}
                      className="rounded-xl bg-sky-400 hover:bg-sky-300 disabled:opacity-50 text-zinc-950 font-bold text-xs px-5 py-2.5 transition shadow-md shadow-sky-500/10"
                    >
                      Comprobar Respuesta
                    </button>

                    {drillFeedback[currentEnglishLesson.id] && (
                      <div className={`p-3 rounded-xl text-xs flex-1 ${
                        drillFeedback[currentEnglishLesson.id]?.ok
                          ? "bg-sky-950/70 border border-sky-400/50 text-sky-200"
                          : "bg-red-950/60 border border-red-500/40 text-red-200"
                      }`}>
                        <p className="font-bold">{drillFeedback[currentEnglishLesson.id]?.message}</p>
                        <p className="text-[11px] opacity-90 mt-1">{drillFeedback[currentEnglishLesson.id]?.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {progressLoadError && (
            <p role="alert" className="mb-4 border-l-2 border-amber-400 px-3 py-2 text-sm text-amber-200">
              {progressLoadError} El progreso del servidor no está disponible; las nuevas prácticas no desbloquearán niveles hasta que se pueda guardar.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {levels.map((levelName, index) => {
              const isSelected = selectedLevel === levelName;
              const isUnlocked = isLevelUnlocked(selectedModule, levelName);
              const isComplete = isLevelComplete(selectedModule, levelName);
              const levelLessonCount = getLevelLessons(selectedModule, levelName).length;
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
                            disabled={savingExerciseKey === exerciseKey}
                            onClick={() => void verifyExercise(item)}
                            className="inline-flex min-h-9 items-center justify-center gap-2 bg-emerald-400 px-3 text-xs font-bold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60"
                          >
                            {savingExerciseKey === exerciseKey
                              ? "Guardando..."
                              : isExerciseComplete
                              ? <Check className="h-3.5 w-3.5" />
                              : <Play className="h-3.5 w-3.5" />}
                            {savingExerciseKey === exerciseKey
                              ? ""
                              : isExerciseComplete
                              ? "Aprobado"
                              : "Verificar ejercicio"}
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