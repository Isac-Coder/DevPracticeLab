import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { findUserById, getAvailableModules, getUserSubscribedModules, initDatabase } from "@/lib/db";

export async function GET() {
  try {
    await initDatabase();
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión para ver tus suscripciones." },
        { status: 401 }
      );
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    const modules = await getAvailableModules();
    const subscribedModules = await getUserSubscribedModules(user.id);
    const subscribedSlugs = subscribedModules.map((module) => module.slug);

    return NextResponse.json({
      modules,
      subscribedModules: subscribedSlugs,
    });
  } catch (error) {
    console.error("Error en /api/modules/available:", error);
    return NextResponse.json(
      { error: (error as Error).message || "No se pudieron cargar los módulos." },
      { status: 500 }
    );
  }
}
