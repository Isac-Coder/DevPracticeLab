import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserById, initDatabase, setUserModuleSubscriptions, updateUserLastSubscriptionUpdate } from "@/lib/db";

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

    // Check 1: Max 2 subscriptions
    if (moduleSlugs.length > 2) {
        return NextResponse.json({ error: "Solo puedes tener un máximo de 2 suscripciones activas." }, { status: 400 });
    }

    // Check 2: 48h cooldown
    const now = new Date();
    const lastUpdate = new Date(user.last_subscription_update);
    const diffHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (diffHours < 48) {
        const remainingHours = Math.ceil(48 - diffHours);
        return NextResponse.json({ error: `Debes esperar ${remainingHours} horas para volver a cambiar tus suscripciones.` }, { status: 400 });
    }

    const savedModules = await setUserModuleSubscriptions(user.id, moduleSlugs);
    await updateUserLastSubscriptionUpdate(user.id);

    return NextResponse.json({
      success: true,
      subscribedModules: savedModules.map((module: any) => module.slug),
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
