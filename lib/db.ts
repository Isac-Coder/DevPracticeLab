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
  var __mockUserApiKeys: Array<{
    id: number;
    user_id: number | string;
    provider: string;
    api_key: string;
    base_url?: string;
    model?: string;
    is_active: boolean;
    updated_at: Date;
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
if (!global.__mockUserApiKeys) global.__mockUserApiKeys = [];

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

export interface UserApiKeyRecord {
  id: number;
  user_id: number | string;
  provider: string; // 'gemini' | 'ollama'
  api_key: string;
  base_url?: string;
  model?: string;
  is_active: boolean;
  updated_at: Date;
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

    // Ensure user_module_subscriptions uses the same type for user_id as users.id
    const userIdColumnRes = await client.query(
      `SELECT data_type, udt_name
       FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'id'
       LIMIT 1`
    );

    let userIdColumnType = "INTEGER";
    if (userIdColumnRes.rows.length > 0) {
      const udt = (userIdColumnRes.rows[0].udt_name || "").toLowerCase();
      const dataType = (userIdColumnRes.rows[0].data_type || "").toLowerCase();
      if (udt === "uuid" || dataType === "uuid") {
        userIdColumnType = "UUID";
      }
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_module_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id ${userIdColumnType} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          module_id INTEGER NOT NULL REFERENCES available_modules(id) ON DELETE CASCADE,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, module_id)
        );
      `);
    } catch (fkErr) {
      // Handle cases where users.id uses UUID while our environment expects INTEGER (or viceversa)
      // If FK cannot be implemented due to incompatible types, create the table without FK
      const msg = (fkErr as Error).message || "";
      console.warn("⚠️ No se pudo crear FK user_module_subscriptions -> users(id):", msg);
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_module_subscriptions (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          module_id INTEGER NOT NULL,
          subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, module_id)
        );
      `);
    }

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_api_keys (
          id SERIAL PRIMARY KEY,
          user_id ${userIdColumnType} NOT NULL,
          provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
          api_key TEXT DEFAULT '',
          base_url TEXT DEFAULT '',
          model VARCHAR(100) DEFAULT '',
          is_active BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, provider)
        );
      `);
    } catch (fkErr) {
      console.warn("⚠️ Error creando tabla base user_api_keys:", (fkErr as Error).message);
      await client.query(`
        CREATE TABLE IF NOT EXISTS user_api_keys (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
          api_key TEXT DEFAULT '',
          base_url TEXT DEFAULT '',
          model VARCHAR(100) DEFAULT '',
          is_active BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (user_id, provider)
        );
      `);
    }

    // Migración para bases de datos existentes con esquema previo:
    try {
      await client.query(`
        ALTER TABLE user_api_keys ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'gemini';
        ALTER TABLE user_api_keys ADD COLUMN IF NOT EXISTS base_url TEXT DEFAULT '';
        ALTER TABLE user_api_keys ADD COLUMN IF NOT EXISTS model VARCHAR(100) DEFAULT '';
        ALTER TABLE user_api_keys ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;
      `);

      await client.query(`
        DO $$ 
        BEGIN
          IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_api_keys_user_id_key') THEN
            ALTER TABLE user_api_keys DROP CONSTRAINT user_api_keys_user_id_key;
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_api_keys_user_id_provider_key') THEN
            ALTER TABLE user_api_keys ADD CONSTRAINT user_api_keys_user_id_provider_key UNIQUE (user_id, provider);
          END IF;
        END $$;
      `);
    } catch (migErr) {
      console.warn("Nota de migración user_api_keys:", (migErr as Error).message);
    }

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

// ==========================================
// AI Keys & Provider Operations
// ==========================================

export async function ensureUserApiKeysTable() {
  const connectionString = getConnectionString();
  if (!connectionString) return;
  const pool = getPool();
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_api_keys (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        provider VARCHAR(50) NOT NULL DEFAULT 'gemini',
        api_key TEXT DEFAULT '',
        base_url TEXT DEFAULT '',
        model VARCHAR(100) DEFAULT '',
        is_active BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'provider') THEN
          ALTER TABLE user_api_keys ADD COLUMN provider VARCHAR(50) DEFAULT 'gemini';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'base_url') THEN
          ALTER TABLE user_api_keys ADD COLUMN base_url TEXT DEFAULT '';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'model') THEN
          ALTER TABLE user_api_keys ADD COLUMN model VARCHAR(100) DEFAULT '';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_api_keys' AND column_name = 'is_active') THEN
          ALTER TABLE user_api_keys ADD COLUMN is_active BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_api_keys_user_id_key') THEN
          ALTER TABLE user_api_keys DROP CONSTRAINT user_api_keys_user_id_key;
        END IF;
      END $$;
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_api_keys_user_provider 
      ON user_api_keys (user_id, provider);
    `);
  } catch (err) {
    console.error("Error ensuring user_api_keys schema:", err);
  }
}

export async function getUserAiConfigs(userId: number | string): Promise<UserApiKeyRecord[]> {
  const connectionString = getConnectionString();
  if (connectionString) {
    await ensureUserApiKeysTable();
    const pool = getPool();
    try {
      const res = await pool.query(
        `SELECT id, user_id, provider, api_key, base_url, model, is_active, updated_at 
         FROM user_api_keys 
         WHERE user_id = $1::text 
         ORDER BY updated_at DESC`,
        [String(userId)]
      );
      return res.rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        provider: r.provider || "gemini",
        api_key: r.api_key || "",
        base_url: r.base_url || (r.provider === "ollama" ? "http://localhost:11434" : ""),
        model: r.model || (r.provider === "ollama" ? "llama3" : "gemini-3.7-flash"),
        is_active: Boolean(r.is_active),
        updated_at: r.updated_at,
      }));
    } catch (err) {
      console.error("Error querying user_api_keys:", err);
    }
  }

  const userConfigs = (global.__mockUserApiKeys || []).filter(
    (k) => String(k.user_id) === String(userId)
  );
  return userConfigs;
}

export async function saveUserAiConfig(
  userId: number | string,
  provider: string,
  apiKey: string,
  baseUrl = "",
  model = "",
  isActive = false
): Promise<UserApiKeyRecord> {
  const normUserId = String(userId);
  const normProvider = provider.toLowerCase();
  // Handle null values by converting to empty string
  const safeApiKey = apiKey ?? "";
  const safeBaseUrl = baseUrl ?? "";
  const safeModel = model ?? "";
  const defBaseUrl = normProvider === "ollama" ? (safeBaseUrl || "http://localhost:11434") : (safeBaseUrl || "");
  const defModel = normProvider === "ollama" ? (safeModel || "llama3") : (safeModel || "gemini-3.7-flash");

  const connectionString = getConnectionString();
  if (connectionString) {
    await ensureUserApiKeysTable();
    const pool = getPool();
    try {
      if (isActive) {
        await pool.query(
          "UPDATE user_api_keys SET is_active = FALSE WHERE user_id = $1::text",
          [normUserId]
        );
      }

      const updateRes = await pool.query(
        `UPDATE user_api_keys 
         SET api_key = $1, base_url = $2, model = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $5::text AND provider = $6 
         RETURNING id, user_id, provider, api_key, base_url, model, is_active, updated_at`,
        [safeApiKey.trim(), defBaseUrl.trim(), defModel.trim(), isActive, normUserId, normProvider]
      );

      if (updateRes.rows.length > 0) {
        const r = updateRes.rows[0];
        return {
          id: r.id,
          user_id: r.user_id,
          provider: r.provider,
          api_key: r.api_key,
          base_url: r.base_url,
          model: r.model,
          is_active: Boolean(r.is_active),
          updated_at: r.updated_at,
        };
      }

      const insertRes = await pool.query(
        `INSERT INTO user_api_keys (user_id, provider, api_key, base_url, model, is_active, updated_at) 
         VALUES ($1::text, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
         RETURNING id, user_id, provider, api_key, base_url, model, is_active, updated_at`,
        [normUserId, normProvider, safeApiKey.trim(), defBaseUrl.trim(), defModel.trim(), isActive]
      );
      const r = insertRes.rows[0];
      return {
        id: r.id,
        user_id: r.user_id,
        provider: r.provider,
        api_key: r.api_key,
        base_url: r.base_url,
        model: r.model,
        is_active: Boolean(r.is_active),
        updated_at: r.updated_at,
      };
    } catch (err) {
      console.error("Error saving in user_api_keys DB:", err);
    }
  }

  if (!global.__mockUserApiKeys) global.__mockUserApiKeys = [];
  if (isActive) {
    global.__mockUserApiKeys.forEach((k) => {
      if (String(k.user_id) === normUserId) k.is_active = false;
    });
  }

  const existingIdx = global.__mockUserApiKeys.findIndex(
    (k) => String(k.user_id) === normUserId && k.provider === normProvider
  );

  const record: UserApiKeyRecord = {
    id: existingIdx >= 0 ? global.__mockUserApiKeys[existingIdx].id : global.__mockUserApiKeys.length + 1,
    user_id: normUserId,
    provider: normProvider,
    api_key: apiKey.trim(),
    base_url: defBaseUrl.trim(),
    model: defModel.trim(),
    is_active: isActive,
    updated_at: new Date(),
  };

  if (existingIdx >= 0) {
    global.__mockUserApiKeys[existingIdx] = record;
  } else {
    global.__mockUserApiKeys.push(record);
  }

  return record;
}

export async function setActiveAiProvider(
  userId: number | string,
  provider: string
): Promise<boolean> {
  const normUserId = String(userId);
  const normProvider = provider.toLowerCase();

  const connectionString = getConnectionString();
  if (connectionString) {
    await ensureUserApiKeysTable();
    const pool = getPool();
    try {
      await pool.query(
        `UPDATE user_api_keys 
         SET is_active = (provider = $1), updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $2::text`,
        [normProvider, normUserId]
      );
      return true;
    } catch (err) {
      console.error("Error setting active AI provider in DB:", err);
    }
  }

  if (global.__mockUserApiKeys) {
    global.__mockUserApiKeys.forEach((k) => {
      if (String(k.user_id) === normUserId) {
        k.is_active = k.provider === normProvider;
      }
    });
  }
  return true;
}

export default getPool();
