import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { completeUserCourseLesson, getUserCourseProgress } from "@/lib/db";

const moduleKeys = new Set(["ssh", "docker", "postgres", "typescript"]);
const levelNames = new Set(["Principiante", "Básico", "Normal", "Avanzado", "Experto"]);

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Inicia sesión para cargar tu progreso." }, { status: 401 });
    }

    const progress = await getUserCourseProgress(session.userId);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Error al cargar el progreso de cursos:", error);
    return NextResponse.json({ error: "No se pudo cargar el progreso de cursos." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Inicia sesión para guardar tu progreso." }, { status: 401 });
    }

    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null) {
      return NextResponse.json({ error: "Los datos de progreso no son válidos." }, { status: 400 });
    }

    const { moduleKey, levelName, lessonTitle } = body as Record<string, unknown>;
    if (
      typeof moduleKey !== "string" || !moduleKeys.has(moduleKey) ||
      typeof levelName !== "string" || !levelNames.has(levelName) ||
      typeof lessonTitle !== "string" || !lessonTitle.trim() || lessonTitle.length > 200
    ) {
      return NextResponse.json({ error: "El módulo, nivel o ejercicio no son válidos." }, { status: 400 });
    }

    await completeUserCourseLesson(session.userId, moduleKey, levelName, lessonTitle.trim());
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al guardar el progreso de cursos:", error);
    return NextResponse.json({ error: "No se pudo guardar el progreso de cursos." }, { status: 500 });
  }
}