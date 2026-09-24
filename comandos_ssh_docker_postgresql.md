# Chuleta de comandos: SSH, Docker y PostgreSQL

> Referencia práctica de comandos frecuentes para desarrollo, administración y despliegue.
>
> **Nota:** no existe una lista literalmente de todos los comandos posibles, ya que SSH, Docker y PostgreSQL tienen muchos subcomandos, opciones y extensiones. Esta guía reúne los comandos más importantes y utilizados.

---

# 1. 🔐 SSH

## 1.1 Conexión

```bash
ssh usuario@servidor
```

Conectarse usando una IP:

```bash
ssh usuario@192.168.1.100
```

Usar un puerto diferente al 22:

```bash
ssh usuario@servidor -p 2222
```

Usar una clave privada específica:

```bash
ssh -i ~/.ssh/id_rsa usuario@servidor
```

Mostrar información de depuración:

```bash
ssh -v usuario@servidor
```

---

## 1.2 Claves SSH

Generar una clave:

```bash
ssh-keygen
```

Generar una clave Ed25519:

```bash
ssh-keygen -t ed25519
```

Copiar la clave pública al servidor:

```bash
ssh-copy-id usuario@servidor
```

Ver la clave pública:

```bash
cat ~/.ssh/id_ed25519.pub
```

Ver las claves conocidas:

```bash
cat ~/.ssh/known_hosts
```

Eliminar una clave conocida:

```bash
ssh-keygen -R servidor
```

---

## 1.3 Transferencia de archivos

Copiar un archivo al servidor:

```bash
scp archivo.txt usuario@servidor:/ruta/
```

Copiar un archivo desde el servidor:

```bash
scp usuario@servidor:/ruta/archivo.txt .
```

Copiar una carpeta:

```bash
scp -r carpeta usuario@servidor:/ruta/
```

Sincronizar archivos usando SSH:

```bash
rsync -avz carpeta/ usuario@servidor:/ruta/
```

---

## 1.4 Túneles SSH

Redireccionamiento local:

```bash
ssh -L 8080:localhost:3000 usuario@servidor
```

Redireccionamiento remoto:

```bash
ssh -R 8080:localhost:3000 usuario@servidor
```

Crear un proxy SOCKS:

```bash
ssh -D 8080 usuario@servidor
```

---

## 1.5 Configuración SSH

Archivo de configuración:

```text
~/.ssh/config
```

Ejemplo:

```text
Host mi-servidor
    HostName 192.168.1.100
    User david
    Port 22
    IdentityFile ~/.ssh/id_ed25519
```

Después puedes conectarte con:

```bash
ssh mi-servidor
```

---

## 1.6 SSH Agent

Iniciar el agente:

```bash
eval "$(ssh-agent -s)"
```

Agregar una clave:

```bash
ssh-add ~/.ssh/id_ed25519
```

Ver las claves cargadas:

```bash
ssh-add -l
```

Eliminar una clave:

```bash
ssh-add -d ~/.ssh/id_ed25519
```

---

# 2. 🐳 Docker

## 2.1 Información

Ver versión:

```bash
docker --version
```

Ver información de versión:

```bash
docker version
```

Ver información del sistema:

```bash
docker info
```

Mostrar ayuda:

```bash
docker help
```

---

## 2.2 Imágenes

Listar imágenes:

```bash
docker images
```

También:

```bash
docker image ls
```

Descargar una imagen:

```bash
docker pull nginx
```

Descargar una versión específica:

```bash
docker pull nginx:latest
```

Eliminar una imagen:

```bash
docker rmi nginx
```

Construir una imagen:

```bash
docker build -t mi-app .
```

Construir usando un Dockerfile específico:

```bash
docker build -f Dockerfile.prod -t mi-app .
```

Etiquetar una imagen:

```bash
docker tag mi-app usuario/mi-app:latest
```

Ver historial de una imagen:

```bash
docker history mi-app
```

Eliminar imágenes no utilizadas:

```bash
docker image prune
```

Eliminar todas las imágenes no utilizadas:

```bash
docker image prune -a
```

---

## 2.3 Contenedores

Crear y ejecutar un contenedor:

```bash
docker run nginx
```

Ejecutar en segundo plano:

```bash
docker run -d nginx
```

Asignar un nombre:

```bash
docker run -d --name mi-nginx nginx
```

Mapear puertos:

```bash
docker run -d -p 8080:80 nginx
```

Mapear un directorio:

```bash
docker run -d -v ./html:/usr/share/nginx/html nginx
```

Asignar variables de entorno:

```bash
docker run -e NODE_ENV=production mi-app
```

Ejecutar un contenedor de forma interactiva:

```bash
docker run -it ubuntu bash
```

---

## 2.4 Listar contenedores

Contenedores activos:

```bash
docker ps
```

Todos los contenedores:

```bash
docker ps -a
```

Mostrar solamente los IDs:

```bash
docker ps -q
```

---

## 2.5 Iniciar, detener y reiniciar

Iniciar:

```bash
docker start mi-app
```

Detener:

```bash
docker stop mi-app
```

Reiniciar:

```bash
docker restart mi-app
```

Pausar:

```bash
docker pause mi-app
```

Continuar:

```bash
docker unpause mi-app
```

---

## 2.6 Eliminar contenedores

Eliminar un contenedor:

```bash
docker rm mi-app
```

Forzar eliminación:

```bash
docker rm -f mi-app
```

Eliminar contenedores detenidos:

```bash
docker container prune
```

---

## 2.7 Logs

Ver logs:

```bash
docker logs mi-app
```

Seguir logs en tiempo real:

```bash
docker logs -f mi-app
```

Mostrar las últimas 100 líneas:

```bash
docker logs --tail 100 mi-app
```

Mostrar logs con timestamps:

```bash
docker logs -t mi-app
```

---

## 2.8 Entrar a un contenedor

Entrar usando Bash:

```bash
docker exec -it mi-app bash
```

Si el contenedor no tiene Bash:

```bash
docker exec -it mi-app sh
```

Ejecutar un comando:

```bash
docker exec mi-app ls
```

---

## 2.9 Inspección

Inspeccionar un contenedor:

```bash
docker inspect mi-app
```

Ver procesos:

```bash
docker top mi-app
```

Ver estadísticas:

```bash
docker stats
```

Ver puertos:

```bash
docker port mi-app
```

Ver cambios realizados en el contenedor:

```bash
docker diff mi-app
```

---

## 2.10 Copiar archivos

Del host al contenedor:

```bash
docker cp archivo.txt mi-app:/app/
```

Del contenedor al host:

```bash
docker cp mi-app:/app/archivo.txt .
```

---

## 2.11 Redes Docker

Listar redes:

```bash
docker network ls
```

Crear una red:

```bash
docker network create mi-red
```

Conectar un contenedor:

```bash
docker network connect mi-red mi-app
```

Desconectar un contenedor:

```bash
docker network disconnect mi-red mi-app
```

Inspeccionar una red:

```bash
docker network inspect mi-red
```

Eliminar una red:

```bash
docker network rm mi-red
```

Eliminar redes no utilizadas:

```bash
docker network prune
```

---

## 2.12 Volúmenes

Listar volúmenes:

```bash
docker volume ls
```

Crear un volumen:

```bash
docker volume create datos
```

Inspeccionar:

```bash
docker volume inspect datos
```

Eliminar:

```bash
docker volume rm datos
```

Eliminar volúmenes no utilizados:

```bash
docker volume prune
```

---

## 2.13 Limpieza de Docker

Eliminar contenedores detenidos:

```bash
docker container prune
```

Eliminar imágenes no utilizadas:

```bash
docker image prune
```

Eliminar redes no utilizadas:

```bash
docker network prune
```

Eliminar recursos no utilizados:

```bash
docker system prune
```

Limpieza más agresiva:

```bash
docker system prune -a
```

---

# 3. 🐳 Docker Compose

> En versiones actuales de Docker se utiliza normalmente `docker compose`.

## 3.1 Información

```bash
docker compose version
```

---

## 3.2 Servicios

Iniciar servicios:

```bash
docker compose up
```

Iniciar en segundo plano:

```bash
docker compose up -d
```

Construir imágenes:

```bash
docker compose build
```

Construir y ejecutar:

```bash
docker compose up --build
```

Detener y eliminar servicios:

```bash
docker compose down
```

Ver servicios:

```bash
docker compose ps
```

Reiniciar:

```bash
docker compose restart
```

---

## 3.3 Logs

Ver logs:

```bash
docker compose logs
```

Seguir logs:

```bash
docker compose logs -f
```

Logs de un servicio:

```bash
docker compose logs -f backend
```

---

## 3.4 Ejecutar comandos

Entrar a un servicio:

```bash
docker compose exec backend bash
```

Ejecutar un comando:

```bash
docker compose exec backend ls
```

Ver imágenes:

```bash
docker compose images
```

---

# 4. 🐘 PostgreSQL

PostgreSQL se utiliza normalmente de dos maneras:

- **`psql`**: cliente de terminal para conectarse y administrar PostgreSQL.
- **SQL**: instrucciones que se ejecutan dentro de PostgreSQL.

---

# 4.1 Conectarse a PostgreSQL

Abrir `psql`:

```bash
psql
```

Conectarse a una base:

```bash
psql -d mi_base
```

Con usuario:

```bash
psql -U postgres -d mi_base
```

Con servidor:

```bash
psql -h localhost -U postgres -d mi_base
```

Con puerto:

```bash
psql -h localhost -p 5432 -U postgres -d mi_base
```

---

# 4.2 Comandos internos de `psql`

Ver bases de datos:

```sql
\l
```

También:

```sql
\list
```

Conectarse a una base:

```sql
\c mi_base
```

Ver tablas:

```sql
\dt
```

Ver todas las relaciones:

```sql
\d
```

Ver estructura de una tabla:

```sql
\d usuarios
```

Ver información detallada:

```sql
\d+ usuarios
```

Ver esquemas:

```sql
\dn
```

Ver usuarios y roles:

```sql
\du
```

Ver funciones:

```sql
\df
```

Ver vistas:

```sql
\dv
```

Ver secuencias:

```sql
\ds
```

Ver información de la conexión:

```sql
\conninfo
```

Salir:

```sql
\q
```

Mostrar ayuda de `psql`:

```sql
\?
```

Mostrar ayuda sobre comandos SQL:

```sql
\h
```

---

# 4.3 Bases de datos

Crear una base:

```sql
CREATE DATABASE mi_base;
```

Crear una base con propietario:

```sql
CREATE DATABASE mi_base
OWNER postgres;
```

Eliminar una base:

```sql
DROP DATABASE mi_base;
```

---

# 4.4 Usuarios y roles

Crear un usuario:

```sql
CREATE USER david WITH PASSWORD '123456';
```

Crear un rol con inicio de sesión:

```sql
CREATE ROLE david LOGIN PASSWORD '123456';
```

Dar permisos sobre una base:

```sql
GRANT ALL PRIVILEGES ON DATABASE mi_base TO david;
```

Cambiar contraseña:

```sql
ALTER USER david WITH PASSWORD 'nueva_clave';
```

Eliminar usuario:

```sql
DROP USER david;
```

---

# 4.5 Tablas

Crear una tabla:

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    email VARCHAR(150),
    edad INTEGER
);
```

Eliminar una tabla:

```sql
DROP TABLE usuarios;
```

Eliminar una tabla solamente si existe:

```sql
DROP TABLE IF EXISTS usuarios;
```

Agregar una columna:

```sql
ALTER TABLE usuarios
ADD COLUMN telefono VARCHAR(20);
```

Renombrar una columna:

```sql
ALTER TABLE usuarios
RENAME COLUMN nombre TO nombre_completo;
```

Eliminar una columna:

```sql
ALTER TABLE usuarios
DROP COLUMN telefono;
```

---

# 4.6 Insertar datos

Insertar un registro:

```sql
INSERT INTO usuarios (nombre, email, edad)
VALUES ('David', 'david@email.com', 25);
```

Insertar varios registros:

```sql
INSERT INTO usuarios (nombre, email, edad)
VALUES
('David', 'david@email.com', 25),
('Carlos', 'carlos@email.com', 30),
('Ana', 'ana@email.com', 22);
```

---

# 4.7 Consultar datos

Consultar todo:

```sql
SELECT * FROM usuarios;
```

Consultar columnas específicas:

```sql
SELECT nombre, email
FROM usuarios;
```

Consultar con una condición:

```sql
SELECT *
FROM usuarios
WHERE edad > 18;
```

Ordenar:

```sql
SELECT *
FROM usuarios
ORDER BY edad DESC;
```

Limitar resultados:

```sql
SELECT *
FROM usuarios
LIMIT 10;
```

Buscar texto:

```sql
SELECT *
FROM usuarios
WHERE nombre LIKE 'Dav%';
```

---

# 4.8 Actualizar datos

Actualizar un registro:

```sql
UPDATE usuarios
SET edad = 26
WHERE id = 1;
```

Actualizar varias columnas:

```sql
UPDATE usuarios
SET nombre = 'David Valdes',
    edad = 26
WHERE id = 1;
```

> ⚠️ Cuidado: si omites `WHERE`, se modificarán todos los registros.

Ejemplo:

```sql
UPDATE usuarios
SET edad = 26;
```

---

# 4.9 Eliminar datos

Eliminar un registro:

```sql
DELETE FROM usuarios
WHERE id = 1;
```

Eliminar todos los registros:

```sql
DELETE FROM usuarios;
```

Vaciar una tabla:

```sql
TRUNCATE TABLE usuarios;
```

> ⚠️ `DELETE` y `TRUNCATE` deben utilizarse con cuidado, especialmente en producción.

---

# 4.10 Índices

Crear un índice:

```sql
CREATE INDEX idx_usuarios_email
ON usuarios(email);
```

Eliminar un índice:

```sql
DROP INDEX idx_usuarios_email;
```

Crear un índice único:

```sql
CREATE UNIQUE INDEX idx_email
ON usuarios(email);
```

---

# 4.11 Relaciones

Crear una tabla relacionada:

```sql
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    total DECIMAL(10,2),

    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
);
```

Realizar un `JOIN`:

```sql
SELECT
    usuarios.nombre,
    pedidos.total
FROM usuarios
JOIN pedidos
ON usuarios.id = pedidos.usuario_id;
```

---

# 4.12 Funciones de agregación

Contar registros:

```sql
SELECT COUNT(*) FROM usuarios;
```

Calcular promedio:

```sql
SELECT AVG(edad) FROM usuarios;
```

Obtener máximo:

```sql
SELECT MAX(edad) FROM usuarios;
```

Obtener mínimo:

```sql
SELECT MIN(edad) FROM usuarios;
```

Sumar:

```sql
SELECT SUM(total) FROM pedidos;
```

Agrupar:

```sql
SELECT edad, COUNT(*)
FROM usuarios
GROUP BY edad;
```

---

# 4.13 Transacciones

Iniciar una transacción:

```sql
BEGIN;
```

Confirmar cambios:

```sql
COMMIT;
```

Deshacer cambios:

```sql
ROLLBACK;
```

Ejemplo:

```sql
BEGIN;

UPDATE usuarios
SET edad = 30
WHERE id = 1;

ROLLBACK;
```

---

# 4.14 Backup de PostgreSQL

Crear un backup SQL:

```bash
pg_dump -U postgres mi_base > backup.sql
```

Crear un backup en formato personalizado:

```bash
pg_dump -U postgres -Fc mi_base > backup.dump
```

Restaurar un archivo `.sql`:

```bash
psql -U postgres mi_base < backup.sql
```

Restaurar un archivo `.dump`:

```bash
pg_restore -U postgres -d mi_base backup.dump
```

---

# 5. 🐘 PostgreSQL + Docker

Descargar PostgreSQL:

```bash
docker pull postgres
```

Crear un contenedor PostgreSQL:

```bash
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123456 \
  -e POSTGRES_DB=mi_base \
  -p 5432:5432 \
  postgres
```

Ver el contenedor:

```bash
docker ps
```

Entrar a PostgreSQL dentro del contenedor:

```bash
docker exec -it postgres psql -U postgres -d mi_base
```

Ver logs:

```bash
docker logs postgres
```

Detener PostgreSQL:

```bash
docker stop postgres
```

Iniciar nuevamente:

```bash
docker start postgres
```

---

# 6. 🔥 Flujo SSH + Docker + PostgreSQL

Un flujo típico para administrar una aplicación en un servidor puede ser:

## 6.1 Conectarse al servidor

```bash
ssh usuario@servidor
```

## 6.2 Ver contenedores

```bash
docker ps
```

## 6.3 Ver todos los contenedores

```bash
docker ps -a
```

## 6.4 Entrar al contenedor PostgreSQL

```bash
docker exec -it postgres psql -U postgres
```

## 6.5 Ver bases de datos

```sql
\l
```

## 6.6 Conectarse a una base

```sql
\c mi_base
```

## 6.7 Ver tablas

```sql
\dt
```

## 6.8 Consultar datos

```sql
SELECT * FROM usuarios;
```

## 6.9 Salir de PostgreSQL

```sql
\q
```

## 6.10 Salir del servidor SSH

```bash
exit
```

---

# 7. 📌 Resumen rápido

| Tecnología | Comando | Uso |
|---|---|---|
| SSH | `ssh usuario@servidor` | Conectarse a un servidor |
| SSH | `ssh-keygen` | Crear claves SSH |
| SSH | `scp` | Transferir archivos |
| SSH | `ssh-copy-id` | Copiar una clave pública |
| Docker | `docker ps` | Ver contenedores |
| Docker | `docker images` | Ver imágenes |
| Docker | `docker run` | Crear y ejecutar contenedores |
| Docker | `docker start` | Iniciar contenedores |
| Docker | `docker stop` | Detener contenedores |
| Docker | `docker rm` | Eliminar contenedores |
| Docker | `docker rmi` | Eliminar imágenes |
| Docker | `docker exec` | Ejecutar comandos dentro de un contenedor |
| Docker | `docker logs` | Ver logs |
| Docker | `docker build` | Construir imágenes |
| Docker | `docker pull` | Descargar imágenes |
| Docker | `docker compose up -d` | Levantar servicios |
| Docker | `docker compose down` | Detener servicios |
| PostgreSQL | `psql` | Cliente de PostgreSQL |
| PostgreSQL | `\l` | Ver bases de datos |
| PostgreSQL | `\dt` | Ver tablas |
| PostgreSQL | `\d tabla` | Ver estructura de una tabla |
| PostgreSQL | `\du` | Ver usuarios/roles |
| PostgreSQL | `\q` | Salir de PostgreSQL |
| PostgreSQL | `SELECT` | Consultar datos |
| PostgreSQL | `INSERT` | Insertar datos |
| PostgreSQL | `UPDATE` | Actualizar datos |
| PostgreSQL | `DELETE` | Eliminar datos |
| PostgreSQL | `CREATE DATABASE` | Crear una base |
| PostgreSQL | `CREATE TABLE` | Crear una tabla |
| PostgreSQL | `GRANT` | Otorgar permisos |
| PostgreSQL | `pg_dump` | Crear backups |
| PostgreSQL | `pg_restore` | Restaurar backups |

---

# 8. 🧠 Comandos que conviene memorizar primero

Si estás empezando, prioriza estos:

### SSH

```bash
ssh usuario@servidor
ssh-keygen
ssh-copy-id usuario@servidor
scp archivo usuario@servidor:/ruta/
```

### Docker

```bash
docker ps
docker ps -a
docker images
docker pull imagen
docker build -t nombre .
docker run -d --name app imagen
docker start app
docker stop app
docker logs -f app
docker exec -it app bash
docker compose up -d
docker compose down
```

### PostgreSQL

```bash
psql -U postgres
\l
\c base
\dt
\d tabla
\du
SELECT * FROM tabla;
INSERT INTO tabla ...;
UPDATE tabla ...;
DELETE FROM tabla ...;
pg_dump
pg_restore
```

---

# 9. ⚠️ Comandos destructivos

Ten especial cuidado con:

```bash
docker system prune -a
```

```bash
docker rm -f contenedor
```

```bash
docker rmi imagen
```

```sql
DROP DATABASE mi_base;
```

```sql
DROP TABLE usuarios;
```

```sql
DELETE FROM usuarios;
```

```sql
TRUNCATE TABLE usuarios;
```

```sql
UPDATE usuarios SET edad = 30;
```

Antes de ejecutar comandos destructivos en producción, verifica el servidor, contenedor, base de datos y los datos afectados.
