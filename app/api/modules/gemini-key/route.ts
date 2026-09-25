import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKey } = await req.json();
    if (!apiKey) {
      return NextResponse.json({ error: "API Key is required" }, { status: 400 });
    }

    const pool = getPool();
    
    // UPSERT: Insert if not exists, update if it does for provider 'gemini'
    const query = `
      INSERT INTO public.user_api_keys (user_id, provider, api_key, model, is_active, updated_at)
      VALUES ($1, 'gemini', $2, 'gemini-2.0-flash', TRUE, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, provider) 
      DO UPDATE SET api_key = EXCLUDED.api_key, is_active = TRUE, updated_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;
    
    await pool.query(query, [auth.userId, apiKey.trim()]);

    return NextResponse.json({ message: "API Key updated successfully" });
  } catch (error) {
    console.error("Error updating API key:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getSession();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pool = getPool();
    const result = await pool.query(
      "SELECT api_key FROM public.user_api_keys WHERE user_id = $1 AND provider = 'gemini' LIMIT 1",
      [auth.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ apiKey: "" });
    }

    return NextResponse.json({ apiKey: result.rows[0].api_key });
  } catch (error) {
    console.error("Error fetching API key:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
