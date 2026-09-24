"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Code2, Copy, Play, RefreshCcw, TriangleAlert } from "lucide-react";
import * as ts from "typescript";

interface CodePracticeEditorProps {
  title: string;
  subtitle: string;
  accent: string;
  fileName: string;
  initialCode: string;
  moduleKey: "typescript" | "nextjs";
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

export default function CodePracticeEditor({
  title,
  subtitle,
  accent,
  fileName,
  initialCode,
  moduleKey,
  onRun,
}: CodePracticeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<{ ok: boolean; output: string[]; summary: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const theme = useMemo(
    () => ({
      shell: accent === "blue" ? "border-blue-500/40 bg-[#09182d]" : "border-sky-500/40 bg-[#071827]",
      button: accent === "blue" ? "bg-blue-500 hover:bg-blue-400 text-blue-950" : "bg-sky-500 hover:bg-sky-400 text-sky-950",
      ring: accent === "blue" ? "focus:ring-blue-500/60" : "focus:ring-sky-500/60",
      badge: accent === "blue" ? "text-blue-300 bg-blue-500/10 border-blue-500/20" : "text-sky-300 bg-sky-500/10 border-sky-500/20",
      border: accent === "blue" ? "border-blue-800/50" : "border-sky-800/50",
    }),
    [accent]
  );

  const runCompile = () => {
    const source = code.trim();
    const compileResult = ts.transpileModule(source, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: moduleKey === "nextjs" ? ts.JsxEmit.ReactJSX : ts.JsxEmit.React,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        skipLibCheck: true,
        resolveJsonModule: true,
      },
      reportDiagnostics: true,
      fileName,
    });

    const diagnostics = compileResult.diagnostics ?? [];
    const errors = diagnostics
      .filter((diag) => (diag.category === ts.DiagnosticCategory.Error))
      .map((diag) => formatDiagnostic(diag));

    const warnings = diagnostics
      .filter((diag) => diag.category === ts.DiagnosticCategory.Warning)
      .map((diag) => formatDiagnostic(diag));

    const output: string[] = [];

    if (errors.length === 0) {
      output.push("✓ Compilación correcta");
      output.push(`Archivo: ${fileName}`);
      output.push(`Target: ES2020`);
      output.push(`Strict: true`);
      if (warnings.length) {
        output.push(`Avisos: ${warnings.length}`);
      }
      setResult({ ok: true, output, summary: "Sin errores de compilación." });
    } else {
      output.push("✗ Errores de compilación detectados");
      errors.forEach((diag) => {
        output.push(`L${diag.line}:${diag.column} - ${diag.message}`);
      });
      if (warnings.length) {
        output.push("");
        output.push(`Advertencias: ${warnings.length}`);
      }
      setResult({ ok: false, output, summary: `${errors.length} error(es) detectado(s).` });
    }

    if (onRun) {
      onRun(errors.length === 0 ? "tsc" : "tsc --check");
    }
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-zinc-800 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Code2 className={`h-4 w-4 ${accent === "blue" ? "text-blue-400" : "text-sky-400"}`} />
            {title}
          </div>
          <p className="mt-1 text-xs text-zinc-400">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-[11px] font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
          <button
            onClick={runCompile}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${theme.button}`}
          >
            <Play className="h-3.5 w-3.5" />
            Compilar
          </button>
        </div>
      </div>

      <div className={`border-b ${theme.border} ${theme.shell}`}>
        <div className="flex items-center gap-2 border-b border-zinc-800/70 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-zinc-400">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="ml-1 font-medium text-zinc-300">{fileName}</span>
        </div>

        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          spellCheck={false}
          className={`w-full min-h-[340px] resize-y bg-transparent px-4 py-4 font-mono text-sm leading-6 text-slate-200 outline-none ${theme.ring}`}
        />
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${theme.badge}`}>
            <RefreshCcw className="h-3 w-3" />
            Resultado de compilación
          </div>
          {result && (
            <span className={`text-[11px] font-semibold ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
              {result.summary}
            </span>
          )}
        </div>

        <div className={`rounded-xl border p-4 font-mono text-xs ${result?.ok ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200" : "border-red-500/20 bg-red-500/5 text-red-200"}`}>
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
