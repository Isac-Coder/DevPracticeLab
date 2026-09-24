import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserById, initDatabase, setUserModuleSubscriptions } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await initDatabase();
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para guardar tus suscripciones." },
        { status: 401 }
      );
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    const body = await req.json();
    const moduleSlugs = Array.isArray(body?.moduleSlugs)
      ? body.moduleSlugs.map((slug: unknown) => String(slug).trim().toLowerCase()).filter(Boolean)
      : [];

    const savedModules = await setUserModuleSubscriptions(user.id, moduleSlugs);

    return NextResponse.json({
      success: true,
      subscribedModules: savedModules.map((module) => module.slug),
      message: "Suscripciones de módulos actualizadas correctamente.",
    });
  } catch (error) {
    console.error("Error en /api/modules/subscribe:", error);
    return NextResponse.json(
      { error: (error as Error).message || "No se pudieron guardar las suscripciones." },
      { status: 500 }
    );
  }
}
