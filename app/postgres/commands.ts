import type { CommandResult } from "@/app/components/SimulatedTerminal";

// Simulated PostgreSQL state
let tables: Record<string, { columns: string[]; rows: string[][] }> = {};
let currentDB = "practica_db";

function initDB() {
  tables = {
    usuarios: {
      columns: ["id", "nombre", "email", "edad", "ciudad", "created_at"],
      rows: [
        ["1", "Ana García", "ana@email.com", "28", "Madrid", "2024-01-15"],
        ["2", "Carlos López", "carlos@email.com", "35", "Barcelona", "2024-02-20"],
        ["3", "María Rodríguez", "maria@email.com", "24", "Sevilla", "2024-03-10"],
        ["4", "Pedro Martínez", "pedro@email.com", "31", "Valencia", "2024-04-05"],
        ["5", "Laura Sánchez", "laura@email.com", "22", "Bilbao", "2024-05-18"],
      ],
    },
    productos: {
      columns: ["id", "nombre", "precio", "stock", "categoria"],
      rows: [
        ["1", "Laptop Pro", "1299.99", "45", "Electrónica"],
        ["2", "Mouse Wireless", "29.99", "200", "Accesorios"],
        ["3", "Teclado Mecánico", "89.99", "80", "Accesorios"],
        ["4", "Monitor 27\"", "349.99", "30", "Electrónica"],
        ["5", "Webcam HD", "59.99", "150", "Accesorios"],
      ],
    },
    pedidos: {
      columns: ["id", "usuario_id", "producto_id", "cantidad", "total", "fecha"],
      rows: [
        ["1", "1", "1", "1", "1299.99", "2024-06-01"],
        ["2", "2", "3", "2", "179.98", "2024-06-05"],
        ["3", "3", "2", "3", "89.97", "2024-06-10"],
        ["4", "1", "4", "1", "349.99", "2024-06-15"],
        ["5", "5", "5", "1", "59.99", "2024-06-20"],
      ],
    },
  };
}

function formatTable(columns: string[], rows: string[][]): string {
  const widths = columns.map((col, i) =>
    Math.max(col.length, ...rows.map((row) => (row[i] || "").length))
  );

  const separator = widths.map((w) => "─".repeat(w + 2)).join("┼");
  const header = columns.map((col, i) => ` ${col.padEnd(widths[i])} `).join("│");
  const body = rows
    .map((row) =>
      row.map((cell, i) => ` ${(cell || "").padEnd(widths[i])} `).join("│")
    )
    .join("\n");

  return `${header}\n─${separator}─\n${body}\n(${rows.length} filas)`;
}

function parseSQLSelect(sql: string): CommandResult {
  const lowerSQL = sql.toLowerCase().trim().replace(/;$/, "");

  // SELECT * FROM table
  const selectAllMatch = lowerSQL.match(/select\s+\*\s+from\s+(\w+)/);
  if (selectAllMatch) {
    const tableName = selectAllMatch[1];
    const table = tables[tableName];
    if (!table) return { output: `ERROR: relation "${tableName}" does not exist`, isError: true };

    // WHERE clause
    const whereMatch = lowerSQL.match(/where\s+(\w+)\s*(=|>|<|>=|<=|!=|like|ilike)\s*'?([^';\s]+)'?/);
    let filteredRows = table.rows;
    if (whereMatch) {
      const [, col, op, val] = whereMatch;
      const colIdx = table.columns.indexOf(col);
      if (colIdx === -1) return { output: `ERROR: column "${col}" does not exist`, isError: true };
      filteredRows = table.rows.filter((row) => {
        if (op === "=") return row[colIdx] === val;
        if (op === ">") return parseFloat(row[colIdx]) > parseFloat(val);
        if (op === "<") return parseFloat(row[colIdx]) < parseFloat(val);
        if (op === ">=") return parseFloat(row[colIdx]) >= parseFloat(val);
        if (op === "<=") return parseFloat(row[colIdx]) <= parseFloat(val);
        if (op === "!=" || op === "<>") return row[colIdx] !== val;
        if (op === "like" || op === "ilike") return row[colIdx].toLowerCase().includes(val.replace(/%/g, "").toLowerCase());
        return true;
      });
    }

    // ORDER BY
    const orderMatch = lowerSQL.match(/order\s+by\s+(\w+)\s*(asc|desc)?/);
    if (orderMatch) {
      const [, col, dir] = orderMatch;
      const colIdx = table.columns.indexOf(col);
      if (colIdx !== -1) {
        filteredRows = [...filteredRows].sort((a, b) => {
          const cmp = a[colIdx].localeCompare(b[colIdx], undefined, { numeric: true });
          return dir === "desc" ? -cmp : cmp;
        });
      }
    }

    // LIMIT
    const limitMatch = lowerSQL.match(/limit\s+(\d+)/);
    if (limitMatch) {
      filteredRows = filteredRows.slice(0, parseInt(limitMatch[1]));
    }

    return { output: formatTable(table.columns, filteredRows) };
  }

  // SELECT specific columns
  const selectColsMatch = lowerSQL.match(/select\s+(.+?)\s+from\s+(\w+)/);
  if (selectColsMatch) {
    const cols = selectColsMatch[1].split(",").map((c) => c.trim());
    const tableName = selectColsMatch[2];
    const table = tables[tableName];
    if (!table) return { output: `ERROR: relation "${tableName}" does not exist`, isError: true };

    // Handle COUNT(*)
    if (cols.length === 1 && cols[0].match(/count\(\*?\)/)) {
      return { output: formatTable(["count"], [[`${table.rows.length}`]]) };
    }

    const colIndices = cols.map((c) => table.columns.indexOf(c));
    const invalidCol = cols.find((_, i) => colIndices[i] === -1);
    if (invalidCol) return { output: `ERROR: column "${invalidCol}" does not exist`, isError: true };

    const selectedRows = table.rows.map((row) => colIndices.map((idx) => row[idx]));
    return { output: formatTable(cols, selectedRows) };
  }

  return { output: "ERROR: syntax error in SQL", isError: true };
}

export function getPostgresCommands(): Record<string, (args: string[]) => CommandResult> {
  initDB();

  return {
    "--help": () => ({
      output: `Comandos PostgreSQL disponibles:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Comandos psql:
  \\dt                          Listar tablas
  \\d <tabla>                   Describir estructura de tabla
  \\l                           Listar bases de datos
  \\du                          Listar usuarios/roles
  \\c <database>                Conectar a otra base de datos
  \\q                           Salir de psql
  \\conninfo                    Info de conexión actual
  \\timing                      Toggle de tiempo de ejecución

  Consultas SQL:
  SELECT * FROM <tabla>         Consultar todos los registros
  SELECT col1,col2 FROM <t>     Consultar columnas específicas
  SELECT * FROM <t> WHERE ...   Consulta con condición
  SELECT * FROM <t> ORDER BY    Ordenar resultados
  SELECT * FROM <t> LIMIT n     Limitar resultados
  INSERT INTO <t> VALUES (...)  Insertar registro
  UPDATE <t> SET col=val        Actualizar registros
  DELETE FROM <t> WHERE ...     Eliminar registros
  CREATE TABLE <t> (...)        Crear tabla
  DROP TABLE <t>                Eliminar tabla
  ALTER TABLE <t> ADD col       Agregar columna

  Tablas disponibles: usuarios, productos, pedidos
  clear                         Limpiar terminal
`,
    }),
    "\\dt": () => ({
      output: `          List of relations
 Schema │    Name     │ Type  │  Owner
────────┼────────────┼───────┼──────────
 public │ usuarios   │ table │ postgres
 public │ productos  │ table │ postgres
 public │ pedidos    │ table │ postgres
(3 filas)`,
    }),
    "\\d": (args) => {
      if (args.length === 0) return { output: "Uso: \\d <tabla>", isError: true };
      const table = tables[args[0]];
      if (!table) return { output: `Did not find any relation named "${args[0]}".`, isError: true };

      const typeMap: Record<string, string> = {
        id: "integer",
        nombre: "varchar(100)",
        email: "varchar(150)",
        edad: "integer",
        ciudad: "varchar(100)",
        precio: "numeric(10,2)",
        stock: "integer",
        categoria: "varchar(50)",
        usuario_id: "integer",
        producto_id: "integer",
        cantidad: "integer",
        total: "numeric(10,2)",
        fecha: "date",
        created_at: "date",
      };

      const colInfo = table.columns
        .map(
          (col) =>
            ` ${col.padEnd(15)}│ ${(typeMap[col] || "text").padEnd(16)}│ ${col === "id" ? "not null" : ""}`
        )
        .join("\n");

      return {
        output: `                Table "public.${args[0]}"
 Column          │ Type             │ Modifiers
─────────────────┼──────────────────┼──────────────
${colInfo}
Indexes:
    "${args[0]}_pkey" PRIMARY KEY, btree (id)`,
      };
    },
    "\\l": () => ({
      output: `                              List of databases
     Name      │  Owner   │ Encoding │ Collate │  Ctype  │ Access
───────────────┼──────────┼──────────┼─────────┼─────────┼────────
 practica_db   │ postgres │ UTF8     │ en_US   │ en_US   │
 postgres      │ postgres │ UTF8     │ en_US   │ en_US   │
 template0     │ postgres │ UTF8     │ en_US   │ en_US   │ =c/postgres
 template1     │ postgres │ UTF8     │ en_US   │ en_US   │ =c/postgres
(4 filas)`,
    }),
    "\\du": () => ({
      output: `                             List of roles
 Role name │                   Attributes                    │ Member of
───────────┼─────────────────────────────────────────────────┼───────────
 postgres  │ Superuser, Create role, Create DB, Replication  │ {}
 admin     │ Create role, Create DB                          │ {}
 readonly  │                                                 │ {}
(3 filas)`,
    }),
    "\\c": (args) => {
      if (args.length === 0) return { output: "Uso: \\c <database>", isError: true };
      currentDB = args[0];
      return {
        output: `You are now connected to database "${currentDB}" as user "postgres".`,
      };
    },
    "\\conninfo": () => ({
      output: `You are connected to database "${currentDB}" as user "postgres" on host "localhost" (address "127.0.0.1") at port "5432".`,
    }),
    "\\timing": () => ({
      output: `Timing is on.\nTime: 0.543 ms`,
    }),
    "\\q": () => ({
      output: `Sesión psql finalizada.\n✅ Desconectado de ${currentDB}`,
    }),
    SELECT: (args) => parseSQLSelect("SELECT " + args.join(" ")),
    select: (args) => parseSQLSelect("select " + args.join(" ")),
    INSERT: (args) => {
      const sql = "INSERT " + args.join(" ");
      const match = sql.match(/into\s+(\w+)/i);
      if (!match) return { output: "ERROR: syntax error", isError: true };
      const tableName = match[1].toLowerCase();
      if (!tables[tableName]) return { output: `ERROR: relation "${tableName}" does not exist`, isError: true };

      const valuesMatch = sql.match(/values\s*\((.+)\)/i);
      if (!valuesMatch) return { output: "ERROR: syntax error near VALUES", isError: true };

      const values = valuesMatch[1].split(",").map((v) => v.trim().replace(/'/g, ""));
      tables[tableName].rows.push(values);

      return { output: `INSERT 0 1\n✅ Registro insertado en '${tableName}'` };
    },
    insert: function (args) { return this.INSERT(args); },
    UPDATE: (args) => {
      const sql = "UPDATE " + args.join(" ");
      const match = sql.match(/update\s+(\w+)\s+set/i);
      if (!match) return { output: "ERROR: syntax error", isError: true };
      const tableName = match[1].toLowerCase();
      if (!tables[tableName]) return { output: `ERROR: relation "${tableName}" does not exist`, isError: true };

      return { output: `UPDATE ${Math.floor(Math.random() * 3) + 1}\n✅ Registros actualizados en '${tableName}'` };
    },
    update: function (args) { return this.UPDATE(args); },
    DELETE: (args) => {
      const sql = "DELETE " + args.join(" ");
      const match = sql.match(/from\s+(\w+)/i);
      if (!match) return { output: "ERROR: syntax error", isError: true };
      const tableName = match[1].toLowerCase();
      if (!tables[tableName]) return { output: `ERROR: relation "${tableName}" does not exist`, isError: true };

      const whereMatch = sql.match(/where\s+(\w+)\s*=\s*'?(\w+)'?/i);
      if (whereMatch) {
        const [, col, val] = whereMatch;
        const colIdx = tables[tableName].columns.indexOf(col);
        if (colIdx === -1) return { output: `ERROR: column "${col}" does not exist`, isError: true };
        const before = tables[tableName].rows.length;
        tables[tableName].rows = tables[tableName].rows.filter((row) => row[colIdx] !== val);
        const deleted = before - tables[tableName].rows.length;
        return { output: `DELETE ${deleted}\n✅ ${deleted} registro(s) eliminado(s) de '${tableName}'` };
      }

      return { output: "ERROR: DELETE without WHERE clause is dangerous. Add WHERE condition.", isError: true };
    },
    delete: function (args) { return this.DELETE(args); },
    CREATE: (args) => {
      const sql = "CREATE " + args.join(" ");
      const match = sql.match(/table\s+(\w+)\s*\((.+)\)/i);
      if (!match) return { output: "ERROR: syntax error", isError: true };
      const tableName = match[1].toLowerCase();
      const colDefs = match[2].split(",").map((c) => c.trim().split(/\s+/)[0]);

      tables[tableName] = { columns: colDefs, rows: [] };
      return { output: `CREATE TABLE\n✅ Tabla '${tableName}' creada con columnas: ${colDefs.join(", ")}` };
    },
    create: function (args) { return this.CREATE(args); },
    DROP: (args) => {
      const sql = "DROP " + args.join(" ");
      const match = sql.match(/table\s+(\w+)/i);
      if (!match) return { output: "ERROR: syntax error", isError: true };
      const tableName = match[1].toLowerCase();
      if (!tables[tableName]) return { output: `ERROR: table "${tableName}" does not exist`, isError: true };
      delete tables[tableName];
      return { output: `DROP TABLE\n✅ Tabla '${tableName}' eliminada` };
    },
    drop: function (args) { return this.DROP(args); },
    ALTER: (args) => {
      const sql = "ALTER " + args.join(" ");
      const match = sql.match(/table\s+(\w+)\s+add\s+(?:column\s+)?(\w+)/i);
      if (!match) return { output: "ERROR: syntax error", isError: true };
      const [, tableName, colName] = match;
      if (!tables[tableName.toLowerCase()])
        return { output: `ERROR: relation "${tableName}" does not exist`, isError: true };
      tables[tableName.toLowerCase()].columns.push(colName);
      tables[tableName.toLowerCase()].rows = tables[tableName.toLowerCase()].rows.map((row) => [
        ...row,
        "NULL",
      ]);
      return { output: `ALTER TABLE\n✅ Columna '${colName}' agregada a '${tableName}'` };
    },
    alter: function (args) { return this.ALTER(args); },
  };
}

export const postgresWelcome = `
╔══════════════════════════════════════════════════════════╗
║             🐘 PostgreSQL Practice Terminal              ║
║  Practica consultas SQL con bases de datos simuladas     ║
║  Escribe --help para ver los comandos disponibles        ║
╚══════════════════════════════════════════════════════════╝
psql (16.2)
Type "help" for help.
`;
