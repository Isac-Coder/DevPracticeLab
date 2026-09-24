import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || "";

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
}

const pool =
  global.__dbPool ||
  new Pool({
    connectionString: connectionString || undefined,
    ssl: connectionString
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

global.__dbPool = pool;

// Fallback in-memory stores in case DB connection fails or credentials expire
if (!global.__mockUsers) global.__mockUsers = [];
if (!global.__mockDontStop) global.__mockDontStop = [];

let schemaInitialized = false;

export async function initDatabase() {
  if (schemaInitialized || !connectionString) return;

  try {
    const client = await pool.connect();
    try {
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

      schemaInitialized = true;
      console.log("✅ Supabase PostgreSQL: Tables verified/created successfully.");
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn(
      "⚠️ PostgreSQL connection warning (operating in resilient fallback mode):",
      (error as Error).message
    );
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
  await initDatabase();
  try {
    const res = await pool.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, email, username, password_hash, created_at, updated_at`,
      [email.toLowerCase().trim(), username.trim(), passwordHash]
    );
    return res.rows[0];
  } catch (err) {
    console.warn("Falling back to local user store:", (err as Error).message);
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
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  await initDatabase();
  try {
    const res = await pool.query(
      `SELECT id, email, username, password_hash, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email.trim()]
    );
    return res.rows[0] || null;
  } catch (err) {
    console.warn("Reading from local user store:", (err as Error).message);
    const user = global.__mockUsers!.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
    return user || null;
  }
}

export async function findUserById(id: number | string): Promise<UserRecord | null> {
  await initDatabase();
  try {
    const res = await pool.query(
      `SELECT id, email, username, password_hash, created_at, updated_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [id]
    );
    return res.rows[0] || null;
  } catch (err) {
    console.warn("Reading from local user store:", (err as Error).message);
    const user = global.__mockUsers!.find((u) => u.id === Number(id));
    return user || null;
  }
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
  await initDatabase();
  try {
    const res = await pool.query(
      `INSERT INTO dont_stop (source, message, payload)
       VALUES ($1, $2, $3)
       RETURNING id, source, message, payload, created_at`,
      [source, message, JSON.stringify(payload)]
    );
    return res.rows[0];
  } catch (err) {
    console.warn("Falling back to local dont_stop store:", (err as Error).message);
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
}

export async function getDontStopEntries(limit = 50): Promise<DontStopRecord[]> {
  await initDatabase();
  try {
    const res = await pool.query(
      `SELECT id, source, message, payload, created_at
       FROM dont_stop
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  } catch (err) {
    console.warn("Reading from local dont_stop store:", (err as Error).message);
    return [...global.__mockDontStop!]
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }
}

export async function query(text: string, params?: unknown[]) {
  await initDatabase();
  return pool.query(text, params);
}

export default pool;
