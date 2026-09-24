import type { CommandResult } from "@/app/components/SimulatedTerminal";

// Simulated Docker state
let containers: {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string;
  created: string;
}[] = [];

let images = [
  { repository: "nginx", tag: "latest", id: "a6bd71f48f68", size: "187MB" },
  { repository: "node", tag: "20-alpine", id: "b0e4c8e1a5d3", size: "181MB" },
  { repository: "postgres", tag: "16", id: "c3f9d2a7e8b1", size: "432MB" },
  { repository: "redis", tag: "7-alpine", id: "d4e5f6a7b8c9", size: "30MB" },
  { repository: "python", tag: "3.12-slim", id: "e5f6a7b8c9d0", size: "155MB" },
];

let networks = [
  { name: "bridge", driver: "bridge", scope: "local" },
  { name: "host", driver: "host", scope: "local" },
  { name: "none", driver: "null", scope: "local" },
];

let volumes = [
  { name: "pgdata", driver: "local", mountpoint: "/var/lib/docker/volumes/pgdata/_data" },
];

function generateId(): string {
  return Math.random().toString(16).slice(2, 14);
}

export function getDockerCommands(): Record<string, (args: string[]) => CommandResult> {
  // Reset state
  containers = [
    {
      id: generateId(),
      name: "web-server",
      image: "nginx:latest",
      status: "Up 2 hours",
      ports: "0.0.0.0:80->80/tcp",
      created: "2 hours ago",
    },
    {
      id: generateId(),
      name: "api-backend",
      image: "node:20-alpine",
      status: "Up 45 minutes",
      ports: "0.0.0.0:3000->3000/tcp",
      created: "45 minutes ago",
    },
  ];

  return {
    "--help": () => ({
      output: `Comandos Docker disponibles:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  docker run <image>           Crear y ejecutar un contenedor
  docker ps                    Listar contenedores activos
  docker ps -a                 Listar todos los contenedores
  docker stop <container>      Detener un contenedor
  docker start <container>     Iniciar un contenedor detenido
  docker rm <container>        Eliminar un contenedor
  docker images                Listar imágenes locales
  docker pull <image>          Descargar una imagen
  docker rmi <image>           Eliminar una imagen
  docker build -t <tag> .      Construir imagen desde Dockerfile
  docker logs <container>      Ver logs de un contenedor
  docker exec <container>      Ejecutar comando en contenedor
  docker network ls            Listar redes
  docker network create <n>    Crear una red
  docker volume ls             Listar volúmenes
  docker volume create <n>     Crear un volumen
  docker compose up            Iniciar servicios con Compose
  docker compose down          Detener servicios con Compose
  docker stats                 Estadísticas en tiempo real
  docker inspect <container>   Inspeccionar contenedor
  docker system prune          Limpiar recursos no usados
  clear                        Limpiar terminal
`,
    }),
    docker: (args) => {
      if (args.length === 0) {
        return {
          output: "Uso: docker <command>\nEscribe --help para ver comandos disponibles",
          isError: true,
        };
      }

      const subcommand = args[0];
      const subArgs = args.slice(1);

      switch (subcommand) {
        case "run": {
          if (subArgs.length === 0) {
            return {
              output: 'Uso: docker run [opciones] <imagen>\nEjemplo: docker run -d --name mi-web -p 8080:80 nginx',
              isError: true,
            };
          }
          let name = `container-${generateId().slice(0, 6)}`;
          let port = "";
          let detached = false;
          let imageName = subArgs[subArgs.length - 1];

          for (let i = 0; i < subArgs.length; i++) {
            if (subArgs[i] === "--name" && subArgs[i + 1]) name = subArgs[++i];
            if (subArgs[i] === "-p" && subArgs[i + 1]) port = subArgs[++i];
            if (subArgs[i] === "-d") detached = true;
          }

          const newContainer = {
            id: generateId(),
            name,
            image: imageName,
            status: "Up Less than a second",
            ports: port || "(none)",
            created: "Less than a second ago",
          };
          containers.push(newContainer);

          return {
            output: `${newContainer.id}
✅ Contenedor '${name}' creado y ejecutando${detached ? " en modo detached" : ""}
   Imagen: ${imageName}${port ? `\n   Puertos: ${port}` : ""}`,
          };
        }

        case "ps": {
          const showAll = subArgs.includes("-a");
          const filtered = showAll
            ? containers
            : containers.filter((c) => c.status.startsWith("Up"));

          if (filtered.length === 0) {
            return { output: "CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES" };
          }

          const header = "CONTAINER ID     IMAGE                 STATUS              PORTS                    NAMES";
          const rows = filtered
            .map(
              (c) =>
                `${c.id.slice(0, 12).padEnd(17)}${c.image.padEnd(22)}${c.status.padEnd(20)}${c.ports.padEnd(25)}${c.name}`
            )
            .join("\n");
          return { output: `${header}\n${rows}` };
        }

        case "stop": {
          if (subArgs.length === 0) return { output: "Uso: docker stop <container>", isError: true };
          const container = containers.find(
            (c) => c.name === subArgs[0] || c.id.startsWith(subArgs[0])
          );
          if (!container) return { output: `Error: No such container: ${subArgs[0]}`, isError: true };
          container.status = "Exited (0) Less than a second ago";
          return { output: `${container.id}\n✅ Contenedor '${container.name}' detenido` };
        }

        case "start": {
          if (subArgs.length === 0) return { output: "Uso: docker start <container>", isError: true };
          const container = containers.find(
            (c) => c.name === subArgs[0] || c.id.startsWith(subArgs[0])
          );
          if (!container) return { output: `Error: No such container: ${subArgs[0]}`, isError: true };
          container.status = "Up Less than a second";
          return { output: `${container.id}\n✅ Contenedor '${container.name}' iniciado` };
        }

        case "rm": {
          if (subArgs.length === 0) return { output: "Uso: docker rm <container>", isError: true };
          const idx = containers.findIndex(
            (c) => c.name === subArgs[0] || c.id.startsWith(subArgs[0])
          );
          if (idx === -1) return { output: `Error: No such container: ${subArgs[0]}`, isError: true };
          const removed = containers.splice(idx, 1)[0];
          return { output: `${removed.id}\n✅ Contenedor '${removed.name}' eliminado` };
        }

        case "images": {
          const header = "REPOSITORY          TAG             IMAGE ID       SIZE";
          const rows = images
            .map((img) => `${img.repository.padEnd(20)}${img.tag.padEnd(16)}${img.id.padEnd(15)}${img.size}`)
            .join("\n");
          return { output: `${header}\n${rows}` };
        }

        case "pull": {
          if (subArgs.length === 0) return { output: "Uso: docker pull <image>", isError: true };
          const imgName = subArgs[0].split(":")[0];
          const imgTag = subArgs[0].split(":")[1] || "latest";
          return {
            output: `Using default tag: ${imgTag}
${imgTag}: Pulling from library/${imgName}
a2abf6c4d29d: Pull complete
05d1a5232b46: Pull complete
fd3a3541db4e: Pull complete
Digest: sha256:${generateId()}${generateId()}
Status: Downloaded newer image for ${imgName}:${imgTag}
docker.io/library/${imgName}:${imgTag}

✅ Imagen '${imgName}:${imgTag}' descargada exitosamente`,
          };
        }

        case "rmi": {
          if (subArgs.length === 0) return { output: "Uso: docker rmi <image>", isError: true };
          const imgIdx = images.findIndex(
            (img) => img.repository === subArgs[0] || img.id === subArgs[0]
          );
          if (imgIdx === -1) return { output: `Error: No such image: ${subArgs[0]}`, isError: true };
          const removedImg = images.splice(imgIdx, 1)[0];
          return { output: `Untagged: ${removedImg.repository}:${removedImg.tag}\nDeleted: sha256:${removedImg.id}\n✅ Imagen eliminada` };
        }

        case "build": {
          return {
            output: `Sending build context to Docker daemon  2.048kB
Step 1/5 : FROM node:20-alpine
 ---> b0e4c8e1a5d3
Step 2/5 : WORKDIR /app
 ---> Running in ${generateId()}
Step 3/5 : COPY package*.json ./
 ---> ${generateId()}
Step 4/5 : RUN npm install
 ---> Running in ${generateId()}
Step 5/5 : COPY . .
 ---> ${generateId()}
Successfully built ${generateId()}
Successfully tagged ${subArgs.includes("-t") ? subArgs[subArgs.indexOf("-t") + 1] : "app"}:latest

✅ Imagen construida exitosamente`,
          };
        }

        case "logs": {
          if (subArgs.length === 0) return { output: "Uso: docker logs <container>", isError: true };
          const container = containers.find(
            (c) => c.name === subArgs[0] || c.id.startsWith(subArgs[0])
          );
          if (!container) return { output: `Error: No such container: ${subArgs[0]}`, isError: true };
          return {
            output: `[${new Date().toISOString()}] Container ${container.name} started
[${new Date().toISOString()}] Listening on port 80
[${new Date().toISOString()}] Ready to accept connections
[${new Date().toISOString()}] GET / 200 0.542ms
[${new Date().toISOString()}] GET /api/health 200 0.123ms`,
          };
        }

        case "exec": {
          if (subArgs.length < 2) {
            return {
              output: "Uso: docker exec -it <container> <command>\nEjemplo: docker exec -it web-server bash",
              isError: true,
            };
          }
          return {
            output: `✅ Ejecutando en contenedor: ${subArgs.filter((a) => !a.startsWith("-")).join(" ")}
root@${generateId().slice(0, 12)}:/# (sesión interactiva simulada)`,
          };
        }

        case "network": {
          if (subArgs[0] === "ls") {
            const header = "NETWORK ID     NAME        DRIVER    SCOPE";
            const rows = networks
              .map(
                (n) =>
                  `${generateId().slice(0, 12).padEnd(15)}${n.name.padEnd(12)}${n.driver.padEnd(10)}${n.scope}`
              )
              .join("\n");
            return { output: `${header}\n${rows}` };
          }
          if (subArgs[0] === "create" && subArgs[1]) {
            networks.push({ name: subArgs[1], driver: "bridge", scope: "local" });
            return { output: `${generateId()}\n✅ Red '${subArgs[1]}' creada` };
          }
          return { output: "Uso: docker network [ls|create <name>]", isError: true };
        }

        case "volume": {
          if (subArgs[0] === "ls") {
            const header = "DRIVER    VOLUME NAME";
            const rows = volumes.map((v) => `local     ${v.name}`).join("\n");
            return { output: `${header}\n${rows}` };
          }
          if (subArgs[0] === "create" && subArgs[1]) {
            volumes.push({
              name: subArgs[1],
              driver: "local",
              mountpoint: `/var/lib/docker/volumes/${subArgs[1]}/_data`,
            });
            return { output: `${subArgs[1]}\n✅ Volumen '${subArgs[1]}' creado` };
          }
          return { output: "Uso: docker volume [ls|create <name>]", isError: true };
        }

        case "compose": {
          if (subArgs[0] === "up") {
            return {
              output: `[+] Running 3/3
 ✔ Network app_default     Created  0.1s
 ✔ Container app-db-1      Started  0.5s
 ✔ Container app-web-1     Started  0.8s
 ✔ Container app-cache-1   Started  0.3s

✅ Todos los servicios iniciados con Docker Compose`,
            };
          }
          if (subArgs[0] === "down") {
            return {
              output: `[+] Running 3/3
 ✔ Container app-web-1     Stopped  0.3s
 ✔ Container app-cache-1   Stopped  0.2s
 ✔ Container app-db-1      Stopped  0.5s
 ✔ Network app_default     Removed  0.1s

✅ Todos los servicios detenidos`,
            };
          }
          return { output: "Uso: docker compose [up|down]", isError: true };
        }

        case "stats": {
          return {
            output: `CONTAINER ID   NAME           CPU %     MEM USAGE / LIMIT     MEM %     NET I/O           BLOCK I/O
${containers
  .filter((c) => c.status.startsWith("Up"))
  .map(
    (c) =>
      `${c.id.slice(0, 12)}   ${c.name.padEnd(15)}${(Math.random() * 5).toFixed(2).padStart(5)}%    ${(Math.random() * 200).toFixed(0)}MiB / 8GiB       ${(Math.random() * 3).toFixed(1)}%     ${(Math.random() * 50).toFixed(1)}MB / ${(Math.random() * 10).toFixed(1)}MB   ${(Math.random() * 100).toFixed(0)}MB / ${(Math.random() * 50).toFixed(0)}MB`
  )
  .join("\n")}`,
          };
        }

        case "inspect": {
          if (subArgs.length === 0) return { output: "Uso: docker inspect <container>", isError: true };
          const container = containers.find(
            (c) => c.name === subArgs[0] || c.id.startsWith(subArgs[0])
          );
          if (!container) return { output: `Error: No such container: ${subArgs[0]}`, isError: true };
          return {
            output: `[
  {
    "Id": "${container.id}",
    "Name": "/${container.name}",
    "Image": "${container.image}",
    "State": {
      "Status": "running",
      "Running": true,
      "Pid": ${Math.floor(Math.random() * 10000)}
    },
    "NetworkSettings": {
      "IPAddress": "172.17.0.${Math.floor(Math.random() * 255)}"
    }
  }
]`,
          };
        }

        case "system": {
          if (subArgs[0] === "prune") {
            return {
              output: `WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - all dangling build cache

Total reclaimed space: 1.234GB
✅ Sistema limpiado exitosamente`,
            };
          }
          return { output: "Uso: docker system prune", isError: true };
        }

        default:
          return {
            output: `docker: '${subcommand}' is not a docker command.\nEscribe --help para ver comandos disponibles`,
            isError: true,
          };
      }
    },
  };
}

export const dockerWelcome = `
╔══════════════════════════════════════════════════════════╗
║              🐳 Docker Practice Terminal                 ║
║  Practica comandos Docker con contenedores simulados     ║
║  Escribe --help para ver los comandos disponibles        ║
╚══════════════════════════════════════════════════════════╝
`;
