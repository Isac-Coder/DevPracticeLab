"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Copy, Check } from "lucide-react";

export interface CommandResult {
  output: string;
  isError?: boolean;
}

export interface TerminalConfig {
  prompt: string;
  welcomeMessage: string;
  commands: Record<string, (args: string[]) => CommandResult>;
  theme: {
    bg: string;
    text: string;
    prompt: string;
    border: string;
    header: string;
    headerText: string;
    headerDots: [string, string, string];
  };
  onPasswordSubmit?: (password: string, context: string) => CommandResult;
}

interface HistoryEntry {
  command: string;
  output: string;
  isError?: boolean;
  prompt: string;
}

export default function SimulatedTerminal({ config }: { config: TerminalConfig }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [passwordMode, setPasswordMode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyTerminalContent = () => {
    let content = "";
    if (showWelcome) {
      content += config.welcomeMessage + "\n";
    }
    history.forEach((entry) => {
      content += `${entry.prompt}${entry.command}\n`;
      if (entry.output) {
        content += `${entry.output}\n`;
      }
    });

    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    setHistory([]);
    setCurrentInput("");
    setCommandHistory([]);
    setHistoryIndex(-1);
    setShowWelcome(true);
    setPasswordMode(null);
  }, [config]);

  const scrollToBottom = useCallback(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  const handleCommand = useCallback(
    (input: string) => {
      const trimmed = input.trim();

      // Handle password mode
      if (passwordMode) {
        if (config.onPasswordSubmit) {
          const result = config.onPasswordSubmit(trimmed, passwordMode);
          setHistory((prev) => [
            ...prev,
            {
              command: "",
              output: result.output,
              isError: result.isError,
              prompt: `root@${passwordMode}'s password: `,
            },
          ]);
        }
        setPasswordMode(null);
        return;
      }

      if (!trimmed) {
        setHistory((prev) => [
          ...prev,
          { command: "", output: "", prompt: config.prompt },
        ]);
        return;
      }

      const parts = trimmed.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      let result: CommandResult;

      if (cmd === "clear") {
        setHistory([]);
        setShowWelcome(false);
        return;
      }

      if (config.commands[cmd]) {
        result = config.commands[cmd](args);
      } else {
        result = {
          output: `Command not found: ${cmd}. Type --help for available commands.`,
          isError: true,
        };
      }

      // Check for password prompt marker
      if (result.output.startsWith("__PASSWORD_PROMPT__:")) {
        const context = result.output.replace("__PASSWORD_PROMPT__:", "");
        setHistory((prev) => [
          ...prev,
          {
            command: trimmed,
            output: "",
            prompt: config.prompt,
          },
        ]);
        setPasswordMode(context);
        setCommandHistory((prev) => [trimmed, ...prev]);
        setHistoryIndex(-1);
        return;
      }

      setHistory((prev) => [
        ...prev,
        {
          command: trimmed,
          output: result.output,
          isError: result.isError,
          prompt: config.prompt,
        },
      ]);
      setCommandHistory((prev) => [trimmed, ...prev]);
      setHistoryIndex(-1);
    },
    [config, passwordMode]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(currentInput);
      setCurrentInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setCurrentInput("");
      }
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={`overflow-hidden rounded-xl border shadow-2xl ${config.theme.border}`}
    >
      {/* Terminal Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${config.theme.header}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <div
              className={`h-3 w-3 rounded-full ${config.theme.headerDots[0]}`}
            />
            <div
              className={`h-3 w-3 rounded-full ${config.theme.headerDots[1]}`}
            />
            <div
              className={`h-3 w-3 rounded-full ${config.theme.headerDots[2]}`}
            />
          </div>
          <span className={`ml-2 text-sm font-medium ${config.theme.headerText}`}>
            {config.prompt.replace("$ ", "").replace("# ", "").replace("=# ", "")}
          </span>
        </div>

        {/* Copy terminal output button */}
        <button
          onClick={copyTerminalContent}
          className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          title="Copiar contenido de la terminal"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-400" />
              <span className="text-green-400">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Body */}
      <div
        ref={terminalRef}
        onClick={focusInput}
        className={`h-[500px] overflow-y-auto p-4 font-mono text-sm select-text ${config.theme.bg} ${config.theme.text}`}
      >
        {/* Welcome message */}
        {showWelcome && (
          <pre className="mb-4 whitespace-pre-wrap opacity-70">
            {config.welcomeMessage}
          </pre>
        )}

        {/* Command history */}
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            <div className="flex">
              <span className={`font-bold ${config.theme.prompt}`}>
                {entry.prompt}
              </span>
              <span className="ml-1">{entry.command}</span>
            </div>
            {entry.output && (
              <pre
                className={`mt-1 whitespace-pre-wrap ${
                  entry.isError ? "text-red-400" : ""
                }`}
              >
                {entry.output}
              </pre>
            )}
          </div>
        ))}

        {/* Current input line */}
        <div className="flex items-center">
          <span className={`font-bold ${config.theme.prompt}`}>
            {passwordMode
              ? `root@${passwordMode}'s password: `
              : config.prompt}
          </span>
          <input
            ref={inputRef}
            type={passwordMode ? "password" : "text"}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`ml-1 flex-1 border-none bg-transparent outline-none caret-current ${config.theme.text}`}
            autoFocus
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
