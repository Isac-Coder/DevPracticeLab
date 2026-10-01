import { NextResponse } from "next/server";
import { ESLint } from "eslint";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = typeof body?.code === "string" ? body.code : "";

    if (!code.trim()) {
      return NextResponse.json({
        ok: true,
        summary: "Sin código para validar.",
        issues: [],
      });
    }

    const eslint = new (ESLint as any)({
      overrideConfigFile: true,
      ignore: false,
      overrideConfig: {
        languageOptions: {
          parser: tsParser,
          parserOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            ecmaFeatures: { jsx: true },
          },
        },
        plugins: {
          "@typescript-eslint": tsPlugin,
        },
        rules: {
          "no-unused-vars": "off",
          "@typescript-eslint/no-unused-vars": "warn",
          "@typescript-eslint/no-explicit-any": "warn",
          "no-console": "off",
        },
      } as any,
    });

    const [result] = await eslint.lintText(code, { filePath: "app.ts" });
    const issues = (result.messages || []).map((message: {
      line?: number;
      column?: number;
      message: string;
      severity: number;
    }) => ({
      line: message.line ?? 1,
      column: message.column ?? 1,
      message: message.message,
      severity: message.severity === 2 ? "error" : "warning",
    }));

    const errors = issues.filter((issue: { severity: string }) => issue.severity === "error");
    const warnings = issues.filter((issue: { severity: string }) => issue.severity === "warning");

    return NextResponse.json({
      ok: errors.length === 0,
      summary:
        errors.length > 0
          ? `${errors.length} error(es) ESLint`
          : warnings.length > 0
            ? `${warnings.length} advertencia(s) ESLint`
            : "ESLint sin problemas.",
      issues,
    });
  } catch (error) {
    console.error("ESLint validation failed:", error);
    return NextResponse.json(
      {
        ok: false,
        summary: "ESLint no pudo ejecutarse.",
        issues: [
          {
            line: 1,
            column: 1,
            message: error instanceof Error ? error.message : "Error desconocido",
            severity: "error",
          },
        ],
      },
      { status: 500 }
    );
  }
}
