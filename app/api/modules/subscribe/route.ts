import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserById, initDatabase, setUserModuleSubscriptions, getLastSubscriptionUpdate, getAvailableModules } from "@/lib/db";

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

    const lastUpdate = await getLastSubscriptionUpdate(user.id);
    if (lastUpdate) {
      const diffHours = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
      if (diffHours < 48) {
        const remainingHours = Math.ceil(48 - diffHours);
        return NextResponse.json(
          { error: `No puedes cambiar tus suscripciones todavía. Debes esperar ${remainingHours} horas para realizar otra modificación.` },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const moduleSlugs = Array.isArray(body?.moduleSlugs)
      ? body.moduleSlugs.map((slug: unknown) => String(slug).trim().toLowerCase()).filter(Boolean)
      : [];

    if (moduleSlugs.length > 2) {
      return NextResponse.json({ error: "Solo puedes tener un máximo de 2 suscripciones de módulo activas al mismo tiempo." }, { status: 400 });
    }

    const allAvailable = await getAvailableModules();
    const validSlugs = moduleSlugs.filter((slug) => allAvailable.some((m) => m.slug === slug));

    const savedModules = await setUserModuleSubscriptions(user.id, validSlugs);

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
