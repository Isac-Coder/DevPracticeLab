import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey } = await req.json();
    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 });
    }

    const pool = getPool();
    await pool.query(`
      INSERT INTO user_api_keys (user_id, api_key, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET api_key = EXCLUDED.api_key, updated_at = CURRENT_TIMESTAMP
    `, [session.userId, apiKey]);

    return NextResponse.json({ message: "API key updated successfully" });
  } catch (error: any) {
    console.error("Error updating API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getPool();
    const result = await pool.query("SELECT api_key FROM user_api_keys WHERE user_id = $1", [session.userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ apiKey: "" });
    }

    return NextResponse.json({ apiKey: result.rows[0].api_key });
  } catch (error: any) {
    console.error("Error fetching API key:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

