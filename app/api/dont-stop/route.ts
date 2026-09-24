import { NextRequest, NextResponse } from "next/server";
import { createDontStopEntry, getDontStopEntries } from "@/lib/db";

// POST /api/dont-stop - Insert a new entry into dont_stop table
export async function POST(req: NextRequest) {
  try {
    let body: { source?: string; message?: string; payload?: Record<string, unknown> } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional, default values will be used
    }

    const source = body.source || "cron_2h_script";
    const message =
      body.message ||
      `Ping cada 2 horas - Keep practicing! (${new Date().toISOString()})`;
    const payload = body.payload || {
      timestamp: new Date().toISOString(),
      service: "DevPracticeLab-Backend",
      status: "active",
    };

    const entry = await createDontStopEntry(source, message, payload);

    return NextResponse.json(
      {
        success: true,
        message: "Registro enviado exitosamente a la tabla 'dont_stop'.",
        entry,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/dont-stop:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error al registrar en dont_stop." },
      { status: 500 }
    );
  }
}

// GET /api/dont-stop - List recent records OR trigger periodic insert (Vercel Cron)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // If triggered by Vercel Cron or explicit ping param
    const isCronTrigger =
      searchParams.get("cron") === "true" ||
      searchParams.get("action") === "ping" ||
      req.headers.has("x-vercel-cron");

    if (isCronTrigger) {
      const source = "vercel_cron_2h";
      const message = `Heartbeat cada 2 horas (Vercel Cron): DevPracticeLab activo (${new Date().toISOString()})`;
      const payload = {
        timestamp: new Date().toISOString(),
        service: "DevPracticeLab-Vercel-Cron",
        trigger: "cron_2h",
        status: "active",
      };

      const entry = await createDontStopEntry(source, message, payload);

      return NextResponse.json(
        {
          success: true,
          message: "Registro periódico (cada 2 horas) insertado exitosamente en 'dont_stop'.",
          entry,
        },
        { status: 201 }
      );
    }

    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const entries = await getDontStopEntries(limit);

    return NextResponse.json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (error) {
    console.error("Error en GET /api/dont-stop:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error al obtener registros de dont_stop." },
      { status: 500 }
    );
  }
}
