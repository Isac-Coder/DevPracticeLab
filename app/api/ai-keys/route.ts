import { NextRequest, NextResponse } from "next/server";
import { getUserAiConfigs, saveUserAiConfig, setActiveAiProvider } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const auth = await getSession();
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const configsRaw = await getUserAiConfigs(auth.userId);

    const configs = configsRaw.map((row) => ({
      provider: row.provider || "gemini",
      apiKey: row.api_key || "",
      baseUrl: row.base_url || "",
      model: "gemini-3.5-flash-lite",
      isActive: Boolean(row.is_active),
      updatedAt: row.updated_at,
    }));

    const activeConfig = configs.find((c) => c.isActive) || configs[0];
    const activeProvider = activeConfig?.provider || "gemini";

    return NextResponse.json({
      configs,
      activeProvider,
    });
  } catch (error: any) {
    console.error("Error al obtener configuraciones de IA:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al consultar configuraciones." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getSession();
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { provider = "gemini", apiKey = "", baseUrl = "", model = "", isActive = false } = await req.json();

    if (!["gemini"].includes(provider)) {
      return NextResponse.json(
        { error: "Proveedor no soportado. Usa 'gemini'." },
        { status: 400 }
      );
    }

    const savedRecord = await saveUserAiConfig(
      auth.userId,
      provider,
      apiKey,
      baseUrl,
      "gemini-3.5-flash-lite",
      isActive
    );

    return NextResponse.json({
      message: `Configuración para Google Gemini guardada correctamente.`,
      config: savedRecord,
      provider,
      isActive,
    });
  } catch (error: any) {
    console.error("Error al guardar configuración de IA:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno al guardar la clave/configuración de IA." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getSession();
    if (!auth) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { activeProvider } = await req.json();

    if (!["gemini"].includes(activeProvider)) {
      return NextResponse.json(
        { error: "Proveedor no válido." },
        { status: 400 }
      );
    }

    await setActiveAiProvider(auth.userId, activeProvider);

    return NextResponse.json({
      message: `Proveedor activo cambiado a ${activeProvider.toUpperCase()}.`,
      activeProvider,
    });
  } catch (error: any) {
    console.error("Error al cambiar proveedor activo de IA:", error);
    return NextResponse.json(
      { error: error?.message || "Error al actualizar el proveedor activo." },
      { status: 500 }
    );
  }
}
