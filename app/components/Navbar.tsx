"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Terminal,
  Server,
  Container,
  Database,
  Code2,
  Home,
  User,
  LogIn,
  LogOut,
  UserPlus,
  BookOpen,
  GraduationCap,
  Medal,
  Trophy,
  Menu,
  X,
  Languages,
  Code,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { usePlatformMode } from "@/lib/PlatformModeContext";

const devNavItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/ssh", label: "SSH", icon: Server },
  { href: "/docker", label: "Docker", icon: Container },
  { href: "/postgres", label: "PostgreSQL", icon: Database },
  { href: "/typescript", label: "TypeScript", icon: Code2 },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/courses", label: "Cursos", icon: GraduationCap },
  { href: "/challenges", label: "Retos", icon: Trophy },
  { href: "/ranking", label: "Ranking", icon: Medal },
];

const englishNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/docs", label: "Grammar Docs", icon: BookOpen },
  { href: "/courses", label: "Top Notch Cursos", icon: GraduationCap },
  { href: "/challenges", label: "English Retos", icon: Trophy },
  { href: "/ranking", label: "Leaderboard", icon: Medal },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { mode, setMode, toggleMode, isEnglish } = usePlatformMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = isEnglish ? englishNavItems : devNavItems;

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <nav
      className={`w-full border-b transition-colors duration-300 ${
        isEnglish
          ? "border-blue-900/60 bg-[#040915] text-slate-100"
          : "border-zinc-800 bg-zinc-950 text-zinc-100"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition lg:hidden ${
                isEnglish
                  ? "border-blue-700/60 bg-blue-950/60 text-blue-200 hover:border-sky-400 hover:text-sky-300"
                  : "border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:border-emerald-500/40 hover:text-emerald-300"
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="hidden items-center gap-2 lg:flex">
              {isEnglish ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-sky-400 text-zinc-950 shadow-md shadow-blue-500/20">
                    <BookOpen className="h-4 w-4 stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-black tracking-tight text-white leading-tight">
                      TopNotch<span className="text-sky-400">English</span>
                    </span>
                    <span className="text-[10px] font-semibold text-blue-400 tracking-wider uppercase -mt-0.5">
                      Grammar & Practice
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Terminal className="h-6 w-6 text-emerald-400" />
                  <span className="text-lg font-bold text-white">
                    DevPractice<span className="text-emerald-400">Lab</span>
                  </span>
                </>
              )}
            </Link>
          </div>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  className={`group flex h-9 min-w-9 items-center justify-start rounded-lg px-2.5 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isActive
                      ? isEnglish
                        ? "bg-blue-600/20 text-sky-400 border border-sky-400/30 shadow-sm shadow-sky-500/10"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : isEnglish
                      ? "text-slate-300 hover:bg-blue-900/40 hover:text-white"
                      : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span
                    aria-hidden="true"
                    className="ml-0 max-w-0 overflow-hidden whitespace-nowrap text-xs font-semibold opacity-0 transition-[max-width,margin,opacity] delay-100 duration-300 ease-in-out group-hover:ml-2 group-hover:max-w-32 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:max-w-32 group-focus-visible:opacity-100"
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Dynamic Platform Toggle Button (Displays only current active mode and toggles on click) */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleMode}
              aria-label={isEnglish ? "Modo actual: Inglés. Clic para cambiar a Desarrollo" : "Modo actual: Desarrollo. Clic para cambiar a Inglés"}
              className={`group relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-black transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
                isEnglish
                  ? "bg-linear-to-r from-sky-400 via-cyan-300 to-sky-400 text-zinc-950 shadow-sky-400/25 ring-1 ring-sky-300/60 hover:shadow-sky-400/40"
                  : "bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-blue-600/30 ring-1 ring-white/15 hover:shadow-blue-600/50"
              }`}
              title={isEnglish ? "Cambiar a Modo Desarrollo (SSH, Docker, Postgres, TS)" : "Cambiar a Modo Inglés (Top Notch & Summit)"}
            >
              {isEnglish ? (
                <>
                  <Languages className="h-4 w-4 shrink-0 text-zinc-950 animate-pulse scale-105" />
                  <span className="tracking-tight">Top Notch (Inglés)</span>
                  <span className="rounded-full bg-zinc-950/20 px-1.5 py-0.2 text-[9px] font-mono font-black text-zinc-950">
                    A1-C1
                  </span>
                </>
              ) : (
                <>
                  <Code className="h-4 w-4 shrink-0 text-white" />
                  <span className="tracking-tight">Modo Dev</span>
                </>
              )}
            </button>

            {!loading && (
              <>
                {user ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                      href="/account"
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition ${
                        pathname === "/account"
                          ? isEnglish
                            ? "border-sky-400 bg-blue-500/20 text-sky-300"
                            : "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : isEnglish
                          ? "border-blue-900/70 bg-blue-950/50 text-slate-300 hover:border-blue-700 hover:text-white"
                          : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white"
                      }`}
                      title="Ver y editar Mi Cuenta"
                    >
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-full ${
                          isEnglish
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        <User className="h-3 w-3" />
                      </div>
                      <span className="font-semibold">{user.username}</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                      title="Cerrar sesión"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Salir</span>
                    </button>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                      href="/login"
                      className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                        isEnglish
                          ? "text-slate-300 hover:bg-blue-900/40 hover:text-white"
                          : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                      }`}
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Iniciar Sesión</span>
                    </Link>
                    <Link
                      href="/register"
                      className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                        isEnglish
                          ? "bg-sky-500 text-zinc-950 hover:bg-sky-400 shadow-md shadow-sky-500/20"
                          : "bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                      }`}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Registrarse</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {menuOpen && (
          <div className="fixed inset-x-0 top-16 z-50 lg:hidden">
            <div
              className={`mx-3 rounded-2xl border p-4 shadow-2xl shadow-black/80 backdrop-blur-md ${
                isEnglish
                  ? "border-blue-900/80 bg-[#061021]/95 text-slate-100"
                  : "border-zinc-800 bg-zinc-950/95 text-zinc-100"
              }`}
            >
              {/* Mobile Mode Switcher Banner (Zero green) */}
              <div
                onClick={() => {
                  toggleMode();
                  setMenuOpen(false);
                }}
                className={`mb-3 flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                  isEnglish
                    ? "border-sky-500/40 bg-blue-950/80 text-sky-300 shadow-sm"
                    : "border-blue-900/40 bg-zinc-900/90 text-blue-300"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isEnglish ? (
                    <Languages className="h-5 w-5 text-sky-400" />
                  ) : (
                    <Code className="h-5 w-5 text-blue-400" />
                  )}
                  <div className="text-xs">
                    <p className="font-bold">{isEnglish ? "Modo Inglés (Top Notch)" : "Modo Desarrollo (Dev)"}</p>
                    <p className="text-[10px] text-slate-400">Toca para cambiar de modo</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-900/60 text-sky-300 font-mono font-bold">
                  {isEnglish ? "A1-C1" : "DEV"}
                </span>
              </div>

              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? isEnglish
                            ? "bg-blue-600/20 text-sky-400 border border-sky-400/30"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : isEnglish
                          ? "text-slate-300 hover:bg-blue-900/40 hover:text-white"
                          : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {!loading && !user && (
                <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-950 ${
                      isEnglish ? "bg-sky-400" : "bg-emerald-500"
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    Registrarse
                  </Link>
                </div>
              )}

              {!loading && user && (
                <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3">
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  >
                    <User className="h-4 w-4" />
                    Mi cuenta
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-left text-sm font-medium text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
