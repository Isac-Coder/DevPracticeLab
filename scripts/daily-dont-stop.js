/**
 * Cron Script for 'dont_stop' table (every 2 hours)
 *
 * This script sends a POST request every 2 hours to the /api/dont-stop endpoint
 * (or inserts directly into the database if the HTTP server is unreachable).
 *
 * Usage:
 *   node scripts/daily-dont-stop.js          # Starts the 2-hour cron scheduler
 *   node scripts/daily-dont-stop.js --now    # Sends an immediate POST request
 */

const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const { Pool } = require("pg");

// Load environment variables from .env.local or .env if present locally
function loadLocalEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch (err) {
        console.warn(`[Env] No se pudo leer ${file}:`, err.message);
      }
    }
  }
}

loadLocalEnv();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const DATABASE_URL = process.env.DATABASE_URL || "";

async function sendScheduledPing() {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] 🚀 Enviando petición periódica (cada 2h) a tabla 'dont_stop'...`);

  const payload = {
    source: "cron_2h_script",
    message: `Heartbeat cada 2 horas: DevPracticeLab activo el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
    payload: {
      timestamp,
      environment: process.env.NODE_ENV || "development",
      type: "scheduled_post_2h",
      status: "alive_dont_stop",
    },
  };

  // 1. Try sending via HTTP POST to the backend endpoint
  try {
    const res = await fetch(`${APP_URL}/api/dont-stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("✅ [HTTP POST Éxito] Respuesta del servidor:", data);
      return;
    } else {
      console.warn(`⚠️ [HTTP POST Falló con status ${res.status}], intentando inserción directa en DB...`);
    }
  } catch (httpError) {
    console.warn(`⚠️ [HTTP no disponible: ${httpError.message}], recurriendo a inserción directa PostgreSQL...`);
  }

  // 2. Direct PostgreSQL fallback if HTTP server is not listening
  if (!DATABASE_URL) {
    console.warn("⚠️ [PostgreSQL Directo] No se encontró la variable DATABASE_URL en el entorno.");
    return;
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS dont_stop (
        id SERIAL PRIMARY KEY,
        source VARCHAR(100) DEFAULT 'cron_script',
        message TEXT DEFAULT 'Keep going, do not stop!',
        payload JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const result = await pool.query(
      `INSERT INTO dont_stop (source, message, payload)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [payload.source, payload.message, JSON.stringify(payload.payload)]
    );

    console.log("✅ [PostgreSQL Directo Éxito] Registro insertado en tabla dont_stop:", result.rows[0]);
  } catch (dbError) {
    console.error("❌ [Error al insertar en DB]:", dbError.message);
  } finally {
    await pool.end();
  }
}

// Check arguments
const args = process.argv.slice(2);
if (args.includes("--now")) {
  sendScheduledPing().then(() => {
    console.log("✨ Petición inmediata completada.");
    process.exit(0);
  });
} else {
  console.log("==================================================");
  console.log("🕒 Servicio Cron 'dont_stop' iniciado");
  console.log("📅 Programado para ejecutarse cada 2 horas (0 */2 * * *)");
  console.log("🎯 Endpoint destino:", `${APP_URL}/api/dont-stop`);
  console.log("==================================================\n");

  // Send initial ping on startup
  sendScheduledPing();

  // Schedule to run every 2 hours (0 */2 * * *)
  cron.schedule("0 */2 * * *", () => {
    sendScheduledPing();
  });
}
