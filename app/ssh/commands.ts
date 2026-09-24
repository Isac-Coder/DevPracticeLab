import type { CommandResult } from "@/app/components/SimulatedTerminal";

// Simulated SSH file system
const fileSystem: Record<string, string[]> = {
  "~": ["Documents", "Downloads", ".ssh", ".bashrc", ".profile"],
  "~/Documents": ["report.txt", "notes.md", "project/"],
  "~/Downloads": ["file1.zip", "image.png"],
  "~/.ssh": ["id_rsa", "id_rsa.pub", "known_hosts", "config"],
};

let currentDir = "~";
let isConnected = false;
let connectedHost = "";

const SSH_PASSWORD = "A12345678";

const servers: Record<string, { os: string }> = {
  "192.168.1.100": {
    os: "Ubuntu 22.04 LTS",
  },
  "10.0.0.50": {
    os: "Debian 12",
  },
  "servidor.ejemplo.com": {
    os: "CentOS 9 Stream",
  },
};

export function getSSHCommands(): Record<string, (args: string[]) => CommandResult> {
  // Reset state on re-init
  currentDir = "~";
  isConnected = false;
  connectedHost = "";

  return {
    "--help": () => ({
      output: `Comandos SSH disponibles:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ssh root@<host>           Conectar a un servidor remoto (usuario: root)
  ssh-keygen                Generar par de claves SSH
  ssh-copy-id <host>        Copiar clave pública al servidor
  scp <src> <dest>          Copiar archivos via SSH
  sftp root@<host>          Iniciar sesión SFTP
  ssh-add                   Agregar clave al agente SSH
  ssh -L <port>             Port forwarding local
  ssh -R <port>             Port forwarding remoto
  ls                        Listar archivos del directorio
  cd <dir>                  Cambiar directorio
  pwd                       Mostrar directorio actual
  cat <file>                Ver contenido de archivo
  whoami                    Mostrar usuario actual
  hostname                  Mostrar nombre del host
  uname -a                  Info del sistema
  exit                      Cerrar conexión/sesión
  clear                     Limpiar terminal
  servers                   Ver servidores disponibles

Usuario: root | Contraseña: se solicita al conectar
Servidores simulados disponibles:
  • 192.168.1.100 (Ubuntu 22.04 LTS)
  • 10.0.0.50 (Debian 12)
  • servidor.ejemplo.com (CentOS 9 Stream)
`,
    }),
    ssh: (args) => {
      if (args.length === 0) {
        return {
          output: "Uso: ssh root@<host>\nEjemplo: ssh root@192.168.1.100",
          isError: true,
        };
      }
      const match = args[0].match(/^(.+)@(.+)$/);
      if (!match) {
        return {
          output: "Formato inválido. Uso: ssh root@<host>",
          isError: true,
        };
      }
      const [, user, host] = match;
      const server = servers[host];
      if (!server) {
        return {
          output: `ssh: Could not resolve hostname ${host}: Name or service not known`,
          isError: true,
        };
      }
      if (user !== "root") {
        return {
          output: `Permission denied (publickey,password).\nEl único usuario permitido es 'root'. Usa: ssh root@${host}`,
          isError: true,
        };
      }
      // Return special marker to trigger password prompt
      return {
        output: `__PASSWORD_PROMPT__:${host}`,
      };
    },
    "ssh-keygen": (args) => {
      const type = args.includes("-t") ? args[args.indexOf("-t") + 1] || "rsa" : "rsa";
      const bits = type === "rsa" ? 4096 : 256;
      return {
        output: `Generating public/private ${type} key pair.
Enter file in which to save the key (/root/.ssh/id_${type}):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /root/.ssh/id_${type}
Your public key has been saved in /root/.ssh/id_${type}.pub
The key fingerprint is:
SHA256:${btoa(Date.now().toString()).slice(0, 43)} root@localhost
The key's randomart image is:
+---[${type.toUpperCase()} ${bits}]----+
|        .o+.     |
|       . o.o     |
|      . + = o    |
|       = B * .   |
|      . S O + .  |
|       o B = o   |
|        + = .    |
|       . . +     |
|        ..o      |
+----[SHA256]-----+

✅ Par de claves ${type.toUpperCase()} generado exitosamente`,
      };
    },
    "ssh-copy-id": (args) => {
      if (args.length === 0) {
        return {
          output: "Uso: ssh-copy-id root@<host>",
          isError: true,
        };
      }
      return {
        output: `/usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: "/root/.ssh/id_rsa.pub"
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s)
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed

Number of key(s) added: 1

✅ Clave copiada exitosamente. Intenta conectarte con: ssh ${args[0]}`,
      };
    },
    scp: (args) => {
      if (args.length < 2) {
        return {
          output: "Uso: scp <archivo_local> <user>@<host>:<ruta_remota>\nEjemplo: scp file.txt root@192.168.1.100:/tmp/",
          isError: true,
        };
      }
      return {
        output: `${args[0]}                    100%   45KB  12.3MB/s   00:00
✅ Archivo transferido exitosamente`,
      };
    },
    sftp: (args) => {
      if (args.length === 0) {
        return {
          output: "Uso: sftp <user>@<host>",
          isError: true,
        };
      }
      return {
        output: `Connected to ${args[0]}.
sftp> (Sesión SFTP simulada iniciada)
Comandos SFTP: ls, cd, get, put, mkdir, rm, exit

✅ Conexión SFTP establecida`,
      };
    },
    "ssh-add": () => ({
      output: `Identity added: /root/.ssh/id_rsa (root@localhost)
✅ Clave agregada al agente SSH`,
    }),
    ls: (args) => {
      const dir = args.includes("-la") || args.includes("-l") ? true : false;
      const files = fileSystem[currentDir] || ["(vacío)"];
      if (dir) {
        return {
          output: `total ${files.length * 4}\n${files
            .map(
              (f) =>
                `${f.endsWith("/") ? "d" : "-"}rwxr-xr-x  1 root root  4096 Sep 23 10:30 ${f}`
            )
            .join("\n")}`,
        };
      }
      return { output: files.join("  ") };
    },
    cd: (args) => {
      if (args.length === 0 || args[0] === "~") {
        currentDir = "~";
        return { output: "" };
      }
      const target =
        args[0].startsWith("~/") ? args[0] : `${currentDir}/${args[0]}`;
      if (fileSystem[target]) {
        currentDir = target;
        return { output: "" };
      }
      return {
        output: `bash: cd: ${args[0]}: No such file or directory`,
        isError: true,
      };
    },
    pwd: () => ({ output: currentDir.replace("~", "/root") }),
    cat: (args) => {
      if (args.length === 0) {
        return { output: "Uso: cat <archivo>", isError: true };
      }
      const contents: Record<string, string> = {
        ".bashrc": '# ~/.bashrc\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"',
        "known_hosts":
          "192.168.1.100 ecdsa-sha2-nistp256 AAAA....\n10.0.0.50 ecdsa-sha2-nistp256 BBBB....",
        config:
          "Host servidor-prod\n  HostName 192.168.1.100\n  User root\n  Port 22\n  IdentityFile ~/.ssh/id_rsa",
        "id_rsa.pub":
          "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ... root@localhost",
      };
      if (contents[args[0]]) {
        return { output: contents[args[0]] };
      }
      return {
        output: `cat: ${args[0]}: No such file or directory`,
        isError: true,
      };
    },
    whoami: () => ({ output: "root" }),
    hostname: () => ({
      output: isConnected ? connectedHost.replace(/\./g, "-") : "localhost",
    }),
    uname: () => ({
      output: "Linux remote-server 5.15.0-78-generic #85-Ubuntu SMP x86_64 GNU/Linux",
    }),
    exit: () => {
      if (isConnected) {
        isConnected = false;
        const oldHost = connectedHost;
        connectedHost = "";
        return {
          output: `Connection to ${oldHost} closed.\n✅ Sesión SSH finalizada`,
        };
      }
      return { output: "logout" };
    },
    servers: () => ({
      output: `Servidores simulados disponibles:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Host: 192.168.1.100
  OS:   Ubuntu 22.04 LTS
  User: root

  Host: 10.0.0.50
  OS:   Debian 12
  User: root

  Host: servidor.ejemplo.com
  OS:   CentOS 9 Stream
  User: root

Conéctate con: ssh root@<host>`,
    }),
  };
}

// Called by SimulatedTerminal when password is submitted
export function handleSSHPassword(password: string, host: string): CommandResult {
  if (password !== SSH_PASSWORD) {
    return {
      output: `root@${host}'s password: ********
Permission denied, please try again.

❌ Contraseña incorrecta. Intenta de nuevo con: ssh root@${host}`,
      isError: true,
    };
  }

  const server = servers[host];
  isConnected = true;
  connectedHost = host;

  return {
    output: `root@${host}'s password: ********

Welcome to ${server.os}
 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

Last login: ${new Date().toUTCString()} from 192.168.1.1
root@${host.replace(/\./g, "-")}:~#

✅ Conexión establecida exitosamente como 'root' en ${host}`,
  };
}

export const sshWelcome = `
╔══════════════════════════════════════════════════════════╗
║              🔐 SSH Practice Terminal                    ║
║  Practica conexiones SSH con servidores simulados        ║
║  Escribe --help para ver los comandos disponibles        ║
╚══════════════════════════════════════════════════════════╝
`;
