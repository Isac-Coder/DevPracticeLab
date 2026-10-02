import { Pool } from "pg";
import { ALL_CHALLENGES } from "@/lib/challengesData";

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
  var __mockEditorWorkspaces: Array<{
    user_id: string;
    module_key: string;
    files: EditorWorkspaceFile[];
    active_file_id: string | null;
    updated_at: Date;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __mockUserCourseProgress: Array<{
    user_id: string;
    module_key: string;
    level_name: string;
    lesson_title: string;
    completed_at: Date;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __mockChallengeCompletions: Array<{
    user_id: string;
    challenge_id: string;
    status: ChallengeStatus;
    xp_bonus: number;
    points_earned: number;
    elapsed_ms: number;
    completed_at: Date;
  }> | undefined;
  // eslint-disable-next-line no-var
  var __schemaInitialized: boolean | undefined;
  var __challengeStatusSchemaReady: boolean | undefined;
  var __challengeLeaderboardSchemaReady: boolean | undefined;
  var __courseProgressSchemaReady: boolean | undefined;
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
  ];
}
if (!global.__mockUserSubscriptions) global.__mockUserSubscriptions = [];
if (!global.__mockUserApiKeys) global.__mockUserApiKeys = [];
if (!global.__mockEditorWorkspaces) global.__mockEditorWorkspaces = [];
if (!global.__mockUserCourseProgress) global.__mockUserCourseProgress = [];
if (!global.__mockChallengeCompletions) global.__mockChallengeCompletions = [];

export type ChallengeStatus = "resuelto" | "erroneo" | "faltante";

export interface ChallengeLeaderboardEntry {
  username: string;
  completedChallenges: number;
  points: number;
  averageTimeMs: number | null;
}

export class DatabaseUnavailableError extends Error {
  constructor() {
    super("No se pudo establecer conexión con la base de datos.");
    this.name = "DatabaseUnavailableError";
  }
}

export interface EditorWorkspaceFile {
  id: string;
  name: string;
  code: string;
}

export interface EditorWorkspaceRecord {
  files: EditorWorkspaceFile[];
  activeFileId: string | null;
  updatedAt: Date | null;
}

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
      CREATE TABLE IF NOT EXISTS user_editor_workspaces (
        user_id TEXT NOT NULL,
        module_key VARCHAR(50) NOT NULL,
        files JSONB NOT NULL DEFAULT '[]'::jsonb,
        active_file_id TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, module_key)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_course_progress (
        user_id TEXT NOT NULL,
        module_key VARCHAR(20) NOT NULL CHECK (module_key IN ('ssh', 'docker', 'postgres', 'typescript')),
        level_name VARCHAR(20) NOT NULL CHECK (level_name IN ('Principiante', 'Básico', 'Normal', 'Avanzado', 'Experto')),
        lesson_title VARCHAR(200) NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, module_key, level_name, lesson_title)
      );
    `);

    await ensureChallengeTables();

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_challenge_leaderboard (
        user_id TEXT PRIMARY KEY,
        username VARCHAR(100) NOT NULL DEFAULT 'Usuario',
        points BIGINT NOT NULL DEFAULT 0 CHECK (points >= 0),
        completed_challenges INTEGER NOT NULL DEFAULT 0 CHECK (completed_challenges >= 0),
        total_elapsed_ms BIGINT NOT NULL DEFAULT 0 CHECK (total_elapsed_ms >= 0),
        timed_challenges INTEGER NOT NULL DEFAULT 0 CHECK (timed_challenges >= 0),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
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
        ('typescript', 'TypeScript', 'Tipos, interfaces y seguridad de código', TRUE)
      ON CONFLICT (slug) DO NOTHING;
    `);

    await client.query("COMMIT");
    global.__schemaInitialized = true;
    global.__challengeStatusSchemaReady = true;
    global.__challengeLeaderboardSchemaReady = true;
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

export async function getChallengeStatuses(
  userId: number | string
): Promise<Record<string, ChallengeStatus>> {
  if (getConnectionString()) {
    await initDatabase();
    await ensureChallengeTables();
    const pool = getPool();
    const result = await pool.query(
      `SELECT challenge_id, status
       FROM user_challenge_progress
       WHERE user_id = $1
       ORDER BY completed_at ASC`,
      [String(userId)]
    );
    return Object.fromEntries(
      result.rows.map((row) => [row.challenge_id as string, row.status as ChallengeStatus])
    );
  }

  return Object.fromEntries(
    global.__mockChallengeCompletions!
      .filter((entry) => entry.user_id === String(userId))
      .map((entry) => [entry.challenge_id, entry.status])
  );
}

export async function getChallengeBonusXp(
  userId: number | string
): Promise<Record<string, number>> {
  if (getConnectionString()) {
    await initDatabase();
    await ensureChallengeTables();
    const pool = getPool();
    const result = await pool.query(
      `SELECT challenge_id, xp_bonus
       FROM user_challenge_progress
       WHERE user_id = $1`,
      [String(userId)]
    );
    return Object.fromEntries(
      result.rows.map((row) => [row.challenge_id as string, Number(row.xp_bonus)])
    );
  }

  return Object.fromEntries(
    global.__mockChallengeCompletions!
      .filter((entry) => entry.user_id === String(userId))
      .map((entry) => [entry.challenge_id, entry.xp_bonus])
  );
}

export async function ensureChallengeStatusRows(
  userId: number | string,
  challengeIds: string[]
): Promise<void> {
  if (getConnectionString()) {
    await initDatabase();
    await ensureChallengeTables();
    const pool = getPool();
    await pool.query(
      `INSERT INTO user_challenge_progress (user_id, challenge_id, status)
       SELECT $1, ids.challenge_id, 'faltante'
       FROM UNNEST($2::varchar[]) AS ids(challenge_id)
       ON CONFLICT (user_id, challenge_id) DO NOTHING`,
      [String(userId), challengeIds]
    );
    return;
  }

  for (const challengeId of challengeIds) {
    const alreadyTracked = global.__mockChallengeCompletions!.some(
      (entry) => entry.user_id === String(userId) && entry.challenge_id === challengeId
    );
    if (!alreadyTracked) {
      global.__mockChallengeCompletions!.push({
        user_id: String(userId),
        challenge_id: challengeId,
        status: "faltante",
        xp_bonus: 0,
        points_earned: 0,
        elapsed_ms: 0,
        completed_at: new Date(),
      });
    }
  }
}

export async function setChallengeStatus(
  userId: number | string,
  challengeId: string,
  status: ChallengeStatus,
  xpBonus = 0,
  pointsEarned = 0,
  elapsedMs = 0
): Promise<void> {
  if (getConnectionString()) {
    await initDatabase();
    await ensureChallengeTables();
    const pool = getPool();
    await pool.query(
      `INSERT INTO user_challenge_progress (
         user_id, challenge_id, status, xp_bonus, points_earned, elapsed_ms, completed_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, challenge_id)
       DO UPDATE SET status = EXCLUDED.status,
                     xp_bonus = EXCLUDED.xp_bonus,
                     points_earned = EXCLUDED.points_earned,
                     elapsed_ms = EXCLUDED.elapsed_ms,
                     completed_at = CURRENT_TIMESTAMP`,
      [String(userId), challengeId, status, xpBonus, pointsEarned, elapsedMs]
    );
    return;
  }

  const record = global.__mockChallengeCompletions!.find(
    (entry) => entry.user_id === String(userId) && entry.challenge_id === challengeId
  );
  if (record) {
    record.status = status;
    record.xp_bonus = xpBonus;
    record.points_earned = pointsEarned;
    record.elapsed_ms = elapsedMs;
    record.completed_at = new Date();
  } else {
    global.__mockChallengeCompletions!.push({
      user_id: String(userId),
      challenge_id: challengeId,
      status,
      xp_bonus: xpBonus,
      points_earned: pointsEarned,
      elapsed_ms: elapsedMs,
      completed_at: new Date(),
    });
  }
}

async function ensureChallengeTables() {
  if (global.__challengeStatusSchemaReady) return;

  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id VARCHAR(100) PRIMARY KEY,
      module VARCHAR(50) NOT NULL,
      week INTEGER NOT NULL CHECK (week > 0),
      title TEXT NOT NULL,
      difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('Fácil', 'Intermedio', 'Avanzado')),
      xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
      objective TEXT NOT NULL,
      hints JSONB NOT NULL DEFAULT '[]'::jsonb,
      expected_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
      solution TEXT,
      tags JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const challengeRows = ALL_CHALLENGES.map((challenge) => ({
    id: challenge.id,
    module: challenge.module,
    week: challenge.week,
    title: challenge.title,
    difficulty: challenge.difficulty,
    xp: challenge.xp,
    objective: challenge.objective,
    hints: JSON.stringify(challenge.hints),
    expected_keywords: JSON.stringify(challenge.expectedKeywords),
    solution: challenge.solution,
    tags: JSON.stringify(challenge.tags),
  }));

  if (challengeRows.length > 0) {
    await pool.query(
      `INSERT INTO challenges (
         id, module, week, title, difficulty, xp, objective, hints, expected_keywords, solution, tags
       )
       SELECT * FROM UNNEST(
         $1::varchar[],
         $2::varchar[],
         $3::integer[],
         $4::text[],
         $5::varchar[],
         $6::integer[],
         $7::text[],
         $8::jsonb[],
         $9::jsonb[],
         $10::text[],
         $11::jsonb[]
       ) AS challenge_rows(
         id, module, week, title, difficulty, xp, objective, hints, expected_keywords, solution, tags
       )
       ON CONFLICT (id) DO UPDATE SET
         module = EXCLUDED.module,
         week = EXCLUDED.week,
         title = EXCLUDED.title,
         difficulty = EXCLUDED.difficulty,
         xp = EXCLUDED.xp,
         objective = EXCLUDED.objective,
         hints = EXCLUDED.hints,
         expected_keywords = EXCLUDED.expected_keywords,
         solution = EXCLUDED.solution,
         tags = EXCLUDED.tags`,
      [
        challengeRows.map((row) => row.id),
        challengeRows.map((row) => row.module),
        challengeRows.map((row) => row.week),
        challengeRows.map((row) => row.title),
        challengeRows.map((row) => row.difficulty),
        challengeRows.map((row) => row.xp),
        challengeRows.map((row) => row.objective),
        challengeRows.map((row) => row.hints),
        challengeRows.map((row) => row.expected_keywords),
        challengeRows.map((row) => row.solution),
        challengeRows.map((row) => row.tags),
      ]
    );
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_challenge_progress (
      user_id TEXT NOT NULL,
      challenge_id VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'faltante'
        CHECK (status IN ('resuelto', 'erroneo', 'faltante')),
      xp_bonus INTEGER NOT NULL DEFAULT 0 CHECK (xp_bonus >= 0),
      points_earned INTEGER NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
      elapsed_ms BIGINT NOT NULL DEFAULT 0 CHECK (elapsed_ms >= 0),
      completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, challenge_id),
      CONSTRAINT user_challenge_progress_challenge_fk
        FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'user_challenge_completions'
      ) THEN
        INSERT INTO user_challenge_progress (user_id, challenge_id, status, xp_bonus, points_earned, elapsed_ms, completed_at)
        SELECT user_id, challenge_id, status, xp_bonus, points_earned, elapsed_ms, completed_at
        FROM user_challenge_completions
        ON CONFLICT (user_id, challenge_id) DO UPDATE SET
          status = EXCLUDED.status,
          xp_bonus = EXCLUDED.xp_bonus,
          points_earned = EXCLUDED.points_earned,
          elapsed_ms = EXCLUDED.elapsed_ms,
          completed_at = EXCLUDED.completed_at;

        DROP TABLE user_challenge_completions;
      END IF;
    END $$;
  `);

  global.__challengeStatusSchemaReady = true;
}

export async function getChallengeLeaderboard(
  challenges: Array<{ id: string; xp: number }>
): Promise<ChallengeLeaderboardEntry[]> {
  const challengeXp = new Map(challenges.map((challenge) => [challenge.id, challenge.xp]));

  if (!getConnectionString()) {
    const totals = new Map<string, {
      username: string;
      points: number;
      completedChallenges: number;
      totalElapsedMs: number;
      timedChallenges: number;
    }>();

    for (const completion of global.__mockChallengeCompletions!) {
      if (completion.status !== "resuelto") continue;
      const userId = completion.user_id;
      const user = global.__mockUsers!.find((item) => String(item.id) === userId);
      const current = totals.get(userId) ?? {
        username: user?.username ?? "Usuario",
        points: 0,
        completedChallenges: 0,
        totalElapsedMs: 0,
        timedChallenges: 0,
      };
      current.points += completion.points_earned || (challengeXp.get(completion.challenge_id) ?? 0) + completion.xp_bonus;
      current.completedChallenges += 1;
      if (completion.elapsed_ms > 0) {
        current.totalElapsedMs += completion.elapsed_ms;
        current.timedChallenges += 1;
      }
      totals.set(userId, current);
    }

    return sortChallengeLeaderboard([...totals.values()].map((entry) => ({
      username: entry.username,
      completedChallenges: entry.completedChallenges,
      points: entry.points,
      averageTimeMs: entry.timedChallenges > 0 ? entry.totalElapsedMs / entry.timedChallenges : null,
    })));
  }

  await initDatabase();
  if (!global.__schemaInitialized) {
    throw new DatabaseUnavailableError();
  }
  await ensureChallengeTables();
  await ensureChallengeLeaderboardTable();

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const completionResult = await client.query(
      `SELECT
         completion.user_id,
         users.username,
         completion.challenge_id,
         completion.xp_bonus,
         completion.points_earned,
         completion.elapsed_ms
       FROM user_challenge_progress AS completion
       LEFT JOIN users ON users.id::text = completion.user_id
       WHERE completion.status = 'resuelto'`
    );
    const totals = new Map<string, {
      username: string;
      points: number;
      completedChallenges: number;
      totalElapsedMs: number;
      timedChallenges: number;
    }>();

    for (const row of completionResult.rows) {
      const userId = String(row.user_id);
      const current = totals.get(userId) ?? {
        username: typeof row.username === "string" ? row.username : "Usuario",
        points: 0,
        completedChallenges: 0,
        totalElapsedMs: 0,
        timedChallenges: 0,
      };
      const pointsEarned = Number(row.points_earned);
      current.points += pointsEarned > 0
        ? pointsEarned
        : (challengeXp.get(String(row.challenge_id)) ?? 0) + Number(row.xp_bonus);
      current.completedChallenges += 1;
      const elapsedMs = Number(row.elapsed_ms);
      if (elapsedMs > 0) {
        current.totalElapsedMs += elapsedMs;
        current.timedChallenges += 1;
      }
      totals.set(userId, current);
    }

    await client.query(
      `UPDATE user_challenge_leaderboard
       SET points = 0,
           completed_challenges = 0,
           total_elapsed_ms = 0,
           timed_challenges = 0,
           updated_at = CURRENT_TIMESTAMP`
    );

    if (totals.size > 0) {
      const entries = [...totals.entries()];
      await client.query(
        `INSERT INTO user_challenge_leaderboard (
           user_id, username, points, completed_challenges, total_elapsed_ms, timed_challenges, updated_at
         )
         SELECT user_id, username, points, completed_challenges, total_elapsed_ms, timed_challenges, CURRENT_TIMESTAMP
         FROM UNNEST(
           $1::text[],
           $2::varchar[],
           $3::bigint[],
           $4::integer[],
           $5::bigint[],
           $6::integer[]
         ) AS leaderboard_rows(user_id, username, points, completed_challenges, total_elapsed_ms, timed_challenges)
         ON CONFLICT (user_id)
         DO UPDATE SET username = EXCLUDED.username,
                       points = EXCLUDED.points,
                       completed_challenges = EXCLUDED.completed_challenges,
                       total_elapsed_ms = EXCLUDED.total_elapsed_ms,
                       timed_challenges = EXCLUDED.timed_challenges,
                       updated_at = CURRENT_TIMESTAMP`,
        [
          entries.map(([userId]) => userId),
          entries.map(([, entry]) => entry.username),
          entries.map(([, entry]) => entry.points),
          entries.map(([, entry]) => entry.completedChallenges),
          entries.map(([, entry]) => entry.totalElapsedMs),
          entries.map(([, entry]) => entry.timedChallenges),
        ]
      );
    }

    const leaderboardResult = await client.query(
      `SELECT
         username,
         completed_challenges,
         points,
         CASE
           WHEN timed_challenges > 0 THEN total_elapsed_ms::numeric / timed_challenges
           ELSE NULL
         END AS average_time_ms
       FROM user_challenge_leaderboard
       WHERE completed_challenges > 0
       ORDER BY points DESC, completed_challenges DESC, average_time_ms ASC NULLS LAST, username ASC`
    );
    await client.query("COMMIT");

    return leaderboardResult.rows.map((row) => ({
      username: String(row.username),
      completedChallenges: Number(row.completed_challenges),
      points: Number(row.points),
      averageTimeMs: row.average_time_ms === null ? null : Number(row.average_time_ms),
    }));
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function sortChallengeLeaderboard(entries: ChallengeLeaderboardEntry[]): ChallengeLeaderboardEntry[] {
  return entries.sort((a, b) =>
    b.points - a.points ||
    b.completedChallenges - a.completedChallenges ||
    (a.averageTimeMs ?? Number.POSITIVE_INFINITY) - (b.averageTimeMs ?? Number.POSITIVE_INFINITY) ||
    a.username.localeCompare(b.username)
  );
}

async function ensureChallengeLeaderboardTable() {
  if (global.__challengeLeaderboardSchemaReady) return;

  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_challenge_leaderboard (
      user_id TEXT PRIMARY KEY,
      username VARCHAR(100) NOT NULL DEFAULT 'Usuario',
      points BIGINT NOT NULL DEFAULT 0 CHECK (points >= 0),
      completed_challenges INTEGER NOT NULL DEFAULT 0 CHECK (completed_challenges >= 0),
      total_elapsed_ms BIGINT NOT NULL DEFAULT 0 CHECK (total_elapsed_ms >= 0),
      timed_challenges INTEGER NOT NULL DEFAULT 0 CHECK (timed_challenges >= 0),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  global.__challengeLeaderboardSchemaReady = true;
}

async function ensureEditorWorkspaceTable() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_editor_workspaces (
      user_id TEXT NOT NULL,
      module_key VARCHAR(50) NOT NULL,
      files JSONB NOT NULL DEFAULT '[]'::jsonb,
      active_file_id TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, module_key)
    );
  `);
}

async function ensureUserCourseProgressTable() {
  if (global.__courseProgressSchemaReady) return;

  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_course_progress (
      user_id TEXT NOT NULL,
      module_key VARCHAR(20) NOT NULL CHECK (module_key IN ('ssh', 'docker', 'postgres', 'typescript')),
      level_name VARCHAR(20) NOT NULL CHECK (level_name IN ('Principiante', 'Básico', 'Normal', 'Avanzado', 'Experto')),
      lesson_title VARCHAR(200) NOT NULL,
      completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, module_key, level_name, lesson_title)
    );
  `);
  global.__courseProgressSchemaReady = true;
}

export async function getUserCourseProgress(
  userId: number | string,
): Promise<Record<string, string[]>> {
  let entries: Array<{ module_key: string; level_name: string; lesson_title: string }>;

  if (getConnectionString()) {
    await initDatabase();
    await ensureUserCourseProgressTable();
    const result = await getPool().query(
      `SELECT module_key, level_name, lesson_title
       FROM user_course_progress
       WHERE user_id = $1
       ORDER BY completed_at ASC`,
      [String(userId)],
    );
    entries = result.rows;
  } else {
    entries = global.__mockUserCourseProgress!
      .filter((entry) => entry.user_id === String(userId));
  }

  return entries.reduce<Record<string, string[]>>((progress, entry) => {
    const key = `${entry.module_key}:${entry.level_name}`;
    const completed = progress[key] ?? [];
    if (!completed.includes(entry.lesson_title)) {
      progress[key] = [...completed, entry.lesson_title];
    }
    return progress;
  }, {});
}

export async function completeUserCourseLesson(
  userId: number | string,
  moduleKey: string,
  levelName: string,
  lessonTitle: string,
): Promise<void> {
  if (getConnectionString()) {
    await initDatabase();
    await ensureUserCourseProgressTable();
    await getPool().query(
      `INSERT INTO user_course_progress (user_id, module_key, level_name, lesson_title)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, module_key, level_name, lesson_title) DO NOTHING`,
      [String(userId), moduleKey, levelName, lessonTitle],
    );
    return;
  }

  const alreadyCompleted = global.__mockUserCourseProgress!.some(
    (entry) => entry.user_id === String(userId) &&
      entry.module_key === moduleKey &&
      entry.level_name === levelName &&
      entry.lesson_title === lessonTitle,
  );
  if (!alreadyCompleted) {
    global.__mockUserCourseProgress!.push({
      user_id: String(userId),
      module_key: moduleKey,
      level_name: levelName,
      lesson_title: lessonTitle,
      completed_at: new Date(),
    });
  }
}

export async function getEditorWorkspace(
  userId: number | string,
  moduleKey: string
): Promise<EditorWorkspaceRecord | null> {
  if (getConnectionString()) {
    await initDatabase();
    await ensureEditorWorkspaceTable();
    const pool = getPool();
    const result = await pool.query(
      `SELECT files, active_file_id, updated_at
       FROM user_editor_workspaces
       WHERE user_id = $1 AND module_key = $2
       LIMIT 1`,
      [String(userId), moduleKey]
    );
    const row = result.rows[0];
    if (!row) return null;

    return {
      files: typeof row.files === "string" ? JSON.parse(row.files) : row.files,
      activeFileId: row.active_file_id,
      updatedAt: row.updated_at,
    };
  }

  const workspace = global.__mockEditorWorkspaces!.find(
    (entry) => entry.user_id === String(userId) && entry.module_key === moduleKey
  );
  return workspace
    ? { files: workspace.files, activeFileId: workspace.active_file_id, updatedAt: workspace.updated_at }
    : null;
}

export async function saveEditorWorkspace(
  userId: number | string,
  moduleKey: string,
  files: EditorWorkspaceFile[],
  activeFileId: string | null
): Promise<void> {
  if (getConnectionString()) {
    await initDatabase();
    await ensureEditorWorkspaceTable();
    const pool = getPool();
    await pool.query(
      `INSERT INTO user_editor_workspaces (user_id, module_key, files, active_file_id, updated_at)
       VALUES ($1, $2, $3::jsonb, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, module_key)
       DO UPDATE SET files = EXCLUDED.files,
                     active_file_id = EXCLUDED.active_file_id,
                     updated_at = CURRENT_TIMESTAMP`,
      [String(userId), moduleKey, JSON.stringify(files), activeFileId]
    );
    return;
  }

  const existing = global.__mockEditorWorkspaces!.find(
    (entry) => entry.user_id === String(userId) && entry.module_key === moduleKey
  );
  if (existing) {
    existing.files = files;
    existing.active_file_id = activeFileId;
    existing.updated_at = new Date();
    return;
  }

  global.__mockEditorWorkspaces!.push({
    user_id: String(userId),
    module_key: moduleKey,
    files,
    active_file_id: activeFileId,
    updated_at: new Date(),
  });
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

    await pool.query(
      `UPDATE user_api_keys
       SET model = 'gemini-3.5-flash-lite', updated_at = CURRENT_TIMESTAMP
       WHERE provider = 'gemini' AND model IS DISTINCT FROM 'gemini-3.5-flash-lite'`
    );
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
         WHERE user_id::text = $1::text 
         ORDER BY updated_at DESC`,
        [String(userId)]
      );
      return res.rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        provider: r.provider || "gemini",
        api_key: r.api_key || "",
        base_url: r.base_url || "",
        model: r.provider === "gemini" ? "gemini-3.5-flash-lite" : r.model || "llama3",
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
  const defModel = normProvider === "ollama" ? (safeModel || "llama3") : "gemini-3.5-flash-lite";

  const connectionString = getConnectionString();
  if (connectionString) {
    await ensureUserApiKeysTable();
    const pool = getPool();
    try {
      if (isActive) {
        await pool.query(
          "UPDATE user_api_keys SET is_active = FALSE WHERE user_id::text = $1::text",
          [normUserId]
        );
      }

      const updateRes = await pool.query(
        `UPDATE user_api_keys 
         SET api_key = $1, base_url = $2, model = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id::text = $5::text AND provider = $6 
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
         VALUES ($1::text::integer, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
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
