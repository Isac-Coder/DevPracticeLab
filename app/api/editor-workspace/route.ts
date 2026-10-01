import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getEditorWorkspace, saveEditorWorkspace, type EditorWorkspaceFile } from "@/lib/db";

const MAX_FILES = 1000;
const MAX_CODE_LENGTH = 1_000_000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedModule = searchParams.get("module") ?? "typescript";
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Inicia sesión para cargar tus archivos." }, { status: 401 });
    }

    const workspace = await getEditorWorkspace(session.userId, requestedModule);
    return NextResponse.json({
      files: workspace?.files ?? [],
      activeFileId: workspace?.activeFileId ?? null,
      updatedAt: workspace?.updatedAt ?? null,
    });
  } catch (error) {
    console.error("Error al cargar el workspace del editor:", error);
    return NextResponse.json({ error: "No se pudieron cargar los archivos." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Inicia sesión para guardar tus archivos." }, { status: 401 });
    }

    const body = await request.json();
    const moduleKey = body.moduleKey ?? "typescript";
    if (!Array.isArray(body?.files) || body.files.length === 0 || body.files.length > MAX_FILES) {
      return NextResponse.json({ error: `El workspace debe tener entre 1 y ${MAX_FILES} archivos.` }, { status: 400 });
    }

    const files: EditorWorkspaceFile[] = [];
    let totalCodeLength = 0;
    for (const file of body.files) {
      if (
        !file ||
        typeof file.id !== "string" ||
        !file.id ||
        typeof file.name !== "string" ||
        !file.name.trim() ||
        typeof file.code !== "string"
      ) {
        return NextResponse.json({ error: "Uno de los archivos tiene datos no válidos." }, { status: 400 });
      }
      totalCodeLength += file.code.length;
      files.push({ id: file.id, name: file.name.trim().slice(0, 255), code: file.code });
    }

    if (totalCodeLength > MAX_CODE_LENGTH) {
      return NextResponse.json({ error: "El workspace supera el tamaño máximo permitido." }, { status: 413 });
    }

    const activeFileId = files.some((file) => file.id === body.activeFileId)
      ? body.activeFileId as string
      : files[0].id;

    await saveEditorWorkspace(session.userId, moduleKey, files, activeFileId);
    return NextResponse.json({ success: true, activeFileId });
  } catch (error) {
    console.error("Error al guardar el workspace del editor:", error);
    return NextResponse.json({ error: "No se pudieron guardar los archivos." }, { status: 500 });
  }
}