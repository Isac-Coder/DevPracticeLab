import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var __mockUsers: Array<{
    id: number;
    email: string;
    username: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __mockDontStop: Array<{
    id: number;
    source: string;
    message: string;
    payload: unknown;
    created_at: Date;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __mockAvailableModules: Array<{
    id: number;
    slug: string;
    name: string;
    description: string;
    is_active: boolean;
    created_at: Date;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __mockUserSubscriptions: Array<{
    id: number;
    user_id: number;
    module_id: number;
    subscribed_at: Date;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __schemaInitialized: boolean | undefined;
}

function getConnectionString(): string {
  return process.env.DATABASE_URL || "";
}

export function getPool(): Pool {
  const connectionString = getConnectionString();
  if (!global.__dbPool) {
    global.__dbPool = new Pool({
      connectionString: connectionString || undefined,
      ssl: connectionString
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return global.__dbPool;
}

// Fallback in-memory stores in case DB connection fails or credentials expire
if (!global.__mockUsers) global.__mockUsers = [];
if (!global.__mockDontStop) global.__mockDontStop = [];
if (!global.__mockAvailableModules) {
  global.__mockAvailableModules = [
    { id: 1, slug: "ssh", name: "SSH", description: "Acceso remoto y administración de servidores", is_active: true, created_at: new Date() },
    { id: 2, slug: "docker", name: "Docker", description: "Contenedores, imágenes y orquestación", is_active: true, created_at: new Date() },
    { id: 3, slug: "postgres", name: "PostgreSQL", description: "Consultas SQL y manejo de datos", is_active: true, created_at: new Date() },
    { id: 4, slug: "typescript", name: "TypeScript", description: "Tipos, interfaces y seguridad de código", is_active: true, created_at: new Date() },
    { id: 5, slug: "nextjs", name: "Next.js", description: "App Router y desarrollo frontend moderno", is_active: true, created_at: new Date() },
  ];
}
if (!global.__mockUserSubscriptions) global.__mockUserSubscriptions = [];

export interface AvailableModuleRecord {
  id: number;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: Date;
}

export interface UserModuleSubscriptionRecord {
  id: number;
  user_id: number;
  module_id: number;
  subscribed_at: Date;
}

export async function initDatabase() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    console.warn("⚠️ No se encontró DATABASE_URL configurada.");
    return;
  }
  if (global.__schemaInitialized) return;

  const pool = getPool();
  let client;
  try {
    client = await pool.connect();
  } catch (connErr) {
    console.error("⚠️ No se pudo conectar a la base de datos PostgreSQL:", (connErr as Error).message);
    // No lanzar: dejamos que la app continúe usando los stores en memoria como fallback.
    global.__schemaInitialized = false;
    return;
  }

  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS dont_stop (
        id SERIAL PRIMARY KEY,
        source VARCHAR(100) DEFAULT 'cron_script',
        message TEXT DEFAULT 'Daily ping - Keep going, do not stop!',
        payload JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS available_modules (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_module_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module_id INTEGER NOT NULL REFERENCES available_modules(id) ON DELETE CASCADE,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, module_id)
      );
    `);

    await client.query(`
      INSERT INTO available_modules (slug, name, description, is_active)
      VALUES
        ('ssh', 'SSH', 'Acceso remoto y administración de servidores', TRUE),
        ('docker', 'Docker', 'Contenedores, imágenes y orquestación', TRUE),
        ('postgres', 'PostgreSQL', 'Consultas SQL y manejo de datos', TRUE),
        ('typescript', 'TypeScript', 'Tipos, interfaces y seguridad de código', TRUE),
        ('nextjs', 'Next.js', 'App Router y desarrollo frontend moderno', TRUE)
      ON CONFLICT (slug) DO NOTHING;
    `);

    await client.query("COMMIT");
    global.__schemaInitialized = true;
    console.log("✅ Supabase PostgreSQL: Tablas verificadas y creadas correctamente.");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // no-op
    }
    global.__schemaInitialized = false;
    console.error(
      "❌ Error al inicializar/verificar tablas en PostgreSQL:",
      (error as Error).message
    );
    // No relanzamos el error para evitar que una mala conexión a la BD provoque 500s en producción.
    // La aplicación seguirá funcionando con los stores en memoria como fallback.
    return;
  } finally {
    try {
      client.release();
    } catch {
      // no-op
    }
  }
}

// ==========================================
// User Operations
// ==========================================

export interface UserRecord {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export async function createUser(
  email: string,
  username: string,
  passwordHash: string
): Promise<UserRecord> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, password_hash, created_at, updated_at`,
      [email.toLowerCase().trim(), username.trim(), passwordHash]
    );
    return res.rows[0];
  }

  // Fallback if no DATABASE_URL configured
  const existing = global.__mockUsers!.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  if (existing) {
    throw new Error("El correo electrónico ya está registrado");
  }
  const newUser: UserRecord = {
    id: global.__mockUsers!.length + 1,
    email: email.toLowerCase().trim(),
    username: username.trim(),
    password_hash: passwordHash,
    created_at: new Date(),
    updated_at: new Date(),
  };
  global.__mockUsers!.push(newUser);
  return newUser;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const res = await pool.query(
      `SELECT id, email, username, password_hash, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email.trim()]
    );
    return res.rows[0] || null;
  }

  const user = global.__mockUsers!.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  return user || null;
}

export async function findUserById(id: number | string): Promise<UserRecord | null> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const res = await pool.query(
      `SELECT id, email, username, password_hash, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  }

  const user = global.__mockUsers!.find((u) => u.id === Number(id));
  return user || null;
}

export async function updateUser(
  id: number | string,
  data: { email?: string; username?: string; passwordHash?: string }
): Promise<UserRecord> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.email) {
      updates.push(`email = $${idx++}`);
      values.push(data.email.toLowerCase().trim());
    }
    if (data.username) {
      updates.push(`username = $${idx++}`);
      values.push(data.username.trim());
    }
    if (data.passwordHash) {
      updates.push(`password_hash = $${idx++}`);
      values.push(data.passwordHash);
    }
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);
    const queryStr = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${idx}
      RETURNING id, email, username, password_hash, created_at, updated_at
    `;

    const res = await pool.query(queryStr, values);
    if (res.rows.length === 0) {
      throw new Error("Usuario no encontrado.");
    }
    return res.rows[0];
  }

  const user = global.__mockUsers!.find((u) => u.id === Number(id));
  if (!user) {
    throw new Error("Usuario no encontrado.");
  }
  if (data.email) user.email = data.email.toLowerCase().trim();
  if (data.username) user.username = data.username.trim();
  if (data.passwordHash) user.password_hash = data.passwordHash;
  user.updated_at = new Date();
  return user;
}

// ==========================================
// dont_stop Table Operations
// ==========================================

export interface DontStopRecord {
  id: number;
  source: string;
  message: string;
  payload: unknown;
  created_at: Date;
}

export async function createDontStopEntry(
  source = "cron_script",
  message = "Daily ping - Keep going, do not stop!",
  payload: Record<string, unknown> = {}
): Promise<DontStopRecord> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO dont_stop (source, message, payload)
       VALUES ($1, $2, $3)
       RETURNING id, source, message, payload, created_at`,
      [source, message, JSON.stringify(payload)]
    );
    return res.rows[0];
  }

  const newEntry: DontStopRecord = {
    id: global.__mockDontStop!.length + 1,
    source,
    message,
    payload,
    created_at: new Date(),
  };
  global.__mockDontStop!.push(newEntry);
  return newEntry;
}

export async function getDontStopEntries(limit = 50): Promise<DontStopRecord[]> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const res = await pool.query(
      `SELECT id, source, message, payload, created_at
       FROM dont_stop
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }

  return [...global.__mockDontStop!]
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, limit);
}

export async function getAvailableModules(): Promise<AvailableModuleRecord[]> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const res = await pool.query(
      `SELECT id, slug, name, description, is_active, created_at
       FROM available_modules
       ORDER BY id ASC`
    );
    return res.rows;
  }

  return [...global.__mockAvailableModules!];
}

export async function getUserSubscribedModules(userId: number | string): Promise<AvailableModuleRecord[]> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const res = await pool.query(
      `SELECT am.id, am.slug, am.name, am.description, am.is_active, am.created_at
       FROM user_module_subscriptions ums
       INNER JOIN available_modules am ON am.id = ums.module_id
       WHERE ums.user_id = $1
       ORDER BY am.id ASC`,
      [userId]
    );
    return res.rows;
  }

  const userIdNum = Number(userId);
  const subscribedModuleIds = global.__mockUserSubscriptions!
    .filter((sub) => sub.user_id === userIdNum)
    .map((sub) => sub.module_id);

  return global.__mockAvailableModules!.filter((module) => subscribedModuleIds.includes(module.id));
}

export async function setUserModuleSubscriptions(
  userId: number | string,
  moduleSlugs: string[]
): Promise<AvailableModuleRecord[]> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await initDatabase();
    const pool = getPool();
    const normalizedSlugs = [...new Set((moduleSlugs || []).map((slug) => String(slug).trim().toLowerCase()).filter(Boolean))];

    await pool.query(`DELETE FROM user_module_subscriptions WHERE user_id = $1`, [userId]);

    if (normalizedSlugs.length > 0) {
      const moduleRows = await pool.query(
        `SELECT id, slug FROM available_modules WHERE LOWER(slug) = ANY($1)`,
        [normalizedSlugs]
      );

      if (moduleRows.rows.length > 0) {
        const values = moduleRows.rows
          .map((row) => `(${Number(userId)}, ${Number(row.id)})`)
          .join(", ");

        await pool.query(
          `INSERT INTO user_module_subscriptions (user_id, module_id) VALUES ${values}`
        );
      }
    }

    return getUserSubscribedModules(userId);
  }

  const userIdNum = Number(userId);
  const availableBySlug = Object.fromEntries(global.__mockAvailableModules!.map((module) => [module.slug, module]));
  const selectedIds = [...new Set((moduleSlugs || []).map((slug) => availableBySlug[String(slug).trim().toLowerCase()]?.id).filter(Boolean))];

  global.__mockUserSubscriptions = global.__mockUserSubscriptions!.filter((sub) => sub.user_id !== userIdNum);
  selectedIds.forEach((moduleId, index) => {
    global.__mockUserSubscriptions!.push({
      id: global.__mockUserSubscriptions!.length + index + 1,
      user_id: userIdNum,
      module_id: Number(moduleId),
      subscribed_at: new Date(),
    });
  });

  return getUserSubscribedModules(userIdNum);
}

export async function query(text: string, params?: unknown[]) {
  await initDatabase();
  const pool = getPool();
  return pool.query(text, params);
}

export default getPool;
