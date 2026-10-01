"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  CheckCircle2,
  Check,
  Code2,
  Copy,
  Download,
  FilePlus2,
  FolderOpen,
  PencilLine,
  Play,
  RefreshCcw,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";
import * as ts from "typescript";

interface EditorFile {
  id: string;
  name: string;
  code: string;
}

interface CodePracticeEditorProps {
  title: string;
  accent: string;
  fileName: string;
  initialCode: string;
  moduleKey: "typescript";
  onRun?: (command: string) => void;
}

const formatDiagnostic = (diagnostic: ts.Diagnostic) => {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  const line = diagnostic.file ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line + 1 : 0;
  const column = diagnostic.file ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0).character + 1 : 0;

  return {
    message,
    line,
    column,
  };
};

const buildFile = (name: string, code: string): EditorFile => ({
  id: `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name,
  code,
});

export default function CodePracticeEditor({
  title,
  accent,
  fileName,
  initialCode,
  moduleKey,
  onRun,
}: CodePracticeEditorProps) {
  const [files, setFiles] = useState<EditorFile[]>([
    buildFile(fileName || "app.ts", initialCode || ""),
  ]);
  const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id ?? "");
  const [result, setResult] = useState<{ ok: boolean; output: string[]; summary: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [lintEnabled, setLintEnabled] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [canPersistWorkspace, setCanPersistWorkspace] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"loading" | "saved" | "saving" | "error" | "signin">("loading");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  const code = activeFile?.code ?? "";
  const fileNameInUse = activeFile?.name ?? fileName;
  const lineCount = Math.max(1, code.split("\n").length);
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1);

  useEffect(() => {
    let cancelled = false;

    const loadWorkspace = async () => {
      try {
        const response = await fetch(`/api/editor-workspace?module=${moduleKey}`);
        if (!response.ok) {
          if (!cancelled) {
            setCanPersistWorkspace(false);
            setSaveStatus(response.status === 401 ? "signin" : "error");
          }
          return;
        }

        const workspace = await response.json();
        if (cancelled) return;

        if (Array.isArray(workspace.files) && workspace.files.length > 0) {
          setFiles(workspace.files);
          setActiveFileId(
            workspace.files.some((file: EditorFile) => file.id === workspace.activeFileId)
              ? workspace.activeFileId
              : workspace.files[0].id
          );
        }
        setCanPersistWorkspace(true);
        setSaveStatus("saved");
      } catch {
        if (!cancelled) {
          setCanPersistWorkspace(false);
          setSaveStatus("error");
        }
      } finally {
        if (!cancelled) setWorkspaceLoaded(true);
      }
    };

    loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, [moduleKey]);

  useEffect(() => {
    if (!workspaceLoaded || !canPersistWorkspace) return;

    const timeout = window.setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const response = await fetch("/api/editor-workspace", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleKey, files, activeFileId }),
        });
        if (!response.ok) throw new Error("No se pudo guardar el workspace.");
        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [activeFileId, canPersistWorkspace, files, moduleKey, workspaceLoaded]);

  const theme = useMemo(
    () => ({
      shell: accent === "blue" ? "border-blue-500/30 bg-[#081827]" : "border-sky-500/30 bg-[#081827]",
      button: accent === "blue" ? "bg-blue-500 hover:bg-blue-400 text-blue-950" : "bg-sky-500 hover:bg-sky-400 text-sky-950",
      ring: accent === "blue" ? "focus:ring-blue-500/50" : "focus:ring-sky-500/50",
      badge: accent === "blue" ? "text-blue-200 bg-blue-500/10 border-blue-500/20" : "text-sky-200 bg-sky-500/10 border-sky-500/20",
      border: accent === "blue" ? "border-blue-800/50" : "border-sky-800/50",
      success: accent === "blue" ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200" : "border-emerald-500/20 bg-emerald-500/5 text-emerald-200",
      danger: accent === "blue" ? "border-red-500/30 bg-red-500/5 text-red-200" : "border-red-500/30 bg-red-500/5 text-red-200",
    }),
    [accent]
  );

  const updateActiveFile = (nextCode: string) => {
    setFiles((current) =>
      current.map((file) => (file.id === activeFileId ? { ...file, code: nextCode } : file))
    );
  };

  const createNewFile = () => {
    const fileIndex = files.length + 1;
    const newFile = buildFile(`archivo-${fileIndex}.ts`, "");
    setFiles((current) => [...current, newFile]);
    setActiveFileId(newFile.id);
  };

  const deleteFile = (fileId: string) => {
    const remainingFiles = files.filter((file) => file.id !== fileId);
    if (remainingFiles.length === 0) {
      const emptyFile = buildFile(fileName || "app.ts", "");
      setFiles([emptyFile]);
      setActiveFileId(emptyFile.id);
    } else {
      setFiles(remainingFiles);
      if (activeFileId === fileId) {
        const deletedIndex = files.findIndex((file) => file.id === fileId);
        setActiveFileId(remainingFiles[Math.max(0, deletedIndex - 1)].id);
      }
    }
    setIsRenaming(false);
    setResult(null);
  };

  const renameActiveFile = () => {
    if (!activeFile) return;
    const nextName = renameValue.trim();
    if (!nextName) return;

    setFiles((current) =>
      current.map((file) => (file.id === activeFileId ? { ...file, name: nextName } : file))
    );
    setIsRenaming(false);
  };

  const importFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (!selected.length) return;

    const importedFiles = await Promise.all(
      selected.map(
        (file) =>
          new Promise<EditorFile>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const content = typeof reader.result === "string" ? reader.result : "";
              resolve(buildFile(file.name || "archivo-importado.ts", content));
            };
            reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`));
            reader.readAsText(file);
          })
      )
    );

    setFiles((current) => {
      const nextFiles = [...current, ...importedFiles];
      if (importedFiles.length > 0) {
        setActiveFileId(importedFiles[0].id);
      }
      return nextFiles;
    });

    if (event.target) {
      event.target.value = "";
    }
  };

  const exportActiveFile = () => {
    if (!activeFile) return;
    const normalizedName = activeFile.name.endsWith(".ts") || activeFile.name.endsWith(".tsx") || activeFile.name.endsWith(".js") || activeFile.name.endsWith(".jsx") ? activeFile.name : `${activeFile.name}.ts`;
    const blob = new Blob([activeFile.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = normalizedName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const runLintCheck = async (source: string) => {
    if (!lintEnabled) return null;

    try {
      const response = await fetch("/api/lint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: source, fileName: fileNameInUse }),
      });

      if (!response.ok) {
        return {
          ok: false,
          output: ["✗ ESLint no pudo ejecutarse.", "Revisa la configuración del servidor."],
          summary: "ESLint falló.",
        };
      }

      const data = await response.json();
      const issues = data.issues ?? [];
      const output: string[] = [];

      if (issues.length === 0) {
        output.push("✓ ESLint: sin advertencias ni errores.");
        return { ok: true, output, summary: "ESLint sin problemas." };
      }

      output.push("✗ ESLint detectó avisos o errores");
      issues.forEach((issue: { line: number; column: number; message: string; severity: string }) => {
        output.push(`L${issue.line}:${issue.column} - ${issue.message}`);
      });

      return {
        ok: issues.every((issue: { severity: string }) => issue.severity !== "error"),
        output,
        summary: issues.some((issue: { severity: string }) => issue.severity === "error")
          ? `${issues.filter((issue: { severity: string }) => issue.severity === "error").length} error(es) ESLint`
          : `${issues.length} advertencia(s) ESLint`,
      };
    } catch (error) {
      return {
        ok: false,
        output: ["✗ ESLint no disponible en este momento.", String(error)],
        summary: "ESLint no disponible.",
      };
    }
  };

  const runCompile = async () => {
    const source = code.trim();
    if (!source) {
      setResult({
        ok: false,
        output: ["✗ El editor está vacío.", "Escribe tu código y pulsa Compilar para validar."],
        summary: "Sin código para compilar.",
      });
      return;
    }

    const compileResult = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        moduleResolution: ts.ModuleResolutionKind.Node10,
      },
      reportDiagnostics: true,
      fileName: fileNameInUse,
    });

    const diagnostics = compileResult.diagnostics ?? [];
    const errors = diagnostics
      .filter((diag) => diag.category === ts.DiagnosticCategory.Error)
      .map((diag) => formatDiagnostic(diag));

    const warnings = diagnostics
      .filter((diag) => diag.category === ts.DiagnosticCategory.Warning)
      .map((diag) => formatDiagnostic(diag));

    const output: string[] = [];

    if (errors.length === 0) {
      output.push("✓ Compilación correcta");
      output.push(`Archivo: ${fileNameInUse}`);
      output.push("Target: ES2020");
      output.push("Strict: true");
      if (warnings.length) {
        output.push(`Avisos: ${warnings.length}`);
      }
    } else {
      output.push("✗ Errores de compilación detectados");
      errors.forEach((diag) => {
        output.push(`L${diag.line}:${diag.column} - ${diag.message}`);
      });
      if (warnings.length) {
        output.push("");
        output.push(`Advertencias: ${warnings.length}`);
      }
    }

    const lintResult = lintEnabled ? await runLintCheck(source) : null;

    if (lintResult) {
      output.push("");
      output.push("--- ESLint ---");
      output.push(...lintResult.output);
    }

    const hasCompileError = errors.length > 0;
    const finalOk = !hasCompileError && (!lintResult || lintResult.ok);

    setResult({
      ok: finalOk,
      output,
      summary: hasCompileError
        ? `${errors.length} error(es) detectado(s).`
        : lintResult
          ? lintResult.summary
          : "Sin errores de compilación.",
    });

    if (onRun) {
      onRun(hasCompileError ? "tsc --check" : lintEnabled ? "tsc && eslint" : "tsc");
    }
  };

  const copyCode = async () => {
    if (!code.trim()) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#070d1e]/90 shadow-[0_20px_60px_rgba(2,6,23,0.7)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 border-b border-zinc-800 bg-zinc-950/60 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Code2 className={`h-4 w-4 ${accent === "blue" ? "text-blue-400" : "text-sky-400"}`} />
            {title}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={createNewFile}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            Nuevo
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Importar
          </button>

          <button
            type="button"
            onClick={exportActiveFile}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>

          <button
            type="button"
            onClick={() => {
              if (!activeFile) return;
              setRenameValue(activeFile.name);
              setIsRenaming(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            <PencilLine className="h-3.5 w-3.5" />
            Renombrar
          </button>

          <button
            type="button"
            onClick={() => setLintEnabled((prev) => !prev)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition ${
              lintEnabled
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500 hover:text-white"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${lintEnabled ? "bg-emerald-400" : "bg-zinc-500"}`} />
            ESLint {lintEnabled ? "ON" : "OFF"}
          </button>

          <button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <button
            onClick={runCompile}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition ${theme.button}`}
          >
            <Play className="h-3.5 w-3.5" />
            {lintEnabled ? "Compilar + ESLint" : "Compilar"}
          </button>
        </div>
      </div>

      <div className="border-b border-zinc-800 bg-[#0a1423] px-3 py-2">
        {isRenaming && (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              renameActiveFile();
            }}
            className="mb-2 flex max-w-sm items-center gap-2"
          >
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setIsRenaming(false);
              }}
              aria-label="Nombre del archivo"
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs text-white outline-none focus:border-sky-500"
            />
            <button type="submit" aria-label="Guardar nombre" title="Guardar nombre" className="rounded-lg p-2 text-emerald-300 hover:bg-emerald-500/10">
              <Check className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Cancelar renombrado" title="Cancelar" onClick={() => setIsRenaming(false)} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className={`flex items-center rounded-t-xl border text-[11px] font-medium transition ${
                file.id === activeFileId
                  ? "border-blue-500/40 bg-[#0d1727] text-white"
                  : "border-transparent bg-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveFileId(file.id);
                  setIsRenaming(false);
                }}
                className="px-3 py-2"
              >
                {file.name}
              </button>
              <button
                type="button"
                onClick={() => deleteFile(file.id)}
                aria-label={`Eliminar ${file.name}`}
                title="Eliminar archivo"
                className="mr-1 rounded p-1 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={`border-b ${theme.border} ${theme.shell}`}>
        <div className="flex items-center gap-2 border-b border-zinc-800/80 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="ml-1 font-medium text-zinc-300">{fileNameInUse}</span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".ts,.tsx,.js,.jsx,.json,.txt"
          multiple
          className="hidden"
          onChange={importFiles}
        />

        <div className="flex min-h-[330px] bg-[#0d1727]">
          <div className="w-12 shrink-0 select-none border-r border-zinc-800 bg-[#0b1622] px-2 py-4 text-right font-mono text-[11px] leading-6 text-zinc-600">
            {lineNumbers.map((line) => (
              <div key={line} className="h-6">
                {line}
              </div>
            ))}
          </div>

          <div className="relative flex-1">
            {!code.trim() && (
              <div className="pointer-events-none absolute left-4 top-4 text-xs text-zinc-500">
                Escribe tu código TypeScript aquí...
              </div>
            )}
            <textarea
              value={code}
              onChange={(event) => updateActiveFile(event.target.value)}
              spellCheck={false}
              placeholder=""
              className={`h-[330px] w-full resize-y border-0 bg-transparent px-4 py-4 font-mono text-sm leading-6 text-slate-200 outline-none placeholder:text-zinc-600 ${theme.ring}`}
              style={{
                tabSize: 2,
                lineHeight: "1.5rem",
                caretColor: "#60a5fa",
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${theme.badge}`}>
            <RefreshCcw className="h-3 w-3" />
            Resultado de compilación
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] ${saveStatus === "saved" ? "text-emerald-400" : saveStatus === "error" ? "text-red-400" : "text-zinc-500"}`}>
              {saveStatus === "loading" ? "Cargando archivos..." : saveStatus === "saving" ? "Guardando..." : saveStatus === "saved" ? "Guardado" : saveStatus === "signin" ? "Inicia sesión para sincronizar" : "No se pudo guardar"}
            </span>
          {result && (
            <span className={`text-[11px] font-semibold ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
              {result.summary}
            </span>
          )}
          </div>
        </div>

        <div className={`rounded-2xl border p-4 font-mono text-xs shadow-inner ${result?.ok ? theme.success : result ? theme.danger : "border-zinc-800 bg-zinc-900/60 text-zinc-400"}`}>
          {result ? (
            <pre className="whitespace-pre-wrap leading-6">{result.output.join("\n")}</pre>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400">
              <TriangleAlert className="h-4 w-4" />
              Presiona “Compilar” para validar el código.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
