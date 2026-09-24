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
  Trophy,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/ssh", label: "SSH", icon: Server },
  { href: "/docker", label: "Docker", icon: Container },
  { href: "/postgres", label: "PostgreSQL", icon: Database },
  { href: "/typescript", label: "TypeScript", icon: Code2 },
  { href: "/nextjs", label: "Next.js", icon: Code2 },
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/challenges", label: "Retos", icon: Trophy },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="w-full border-b border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/80 text-zinc-200 transition hover:border-emerald-500/40 hover:text-emerald-300 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="hidden items-center gap-2 lg:flex">
              <Terminal className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">
                DevPractice<span className="text-emerald-400">Lab</span>
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-400 hover:bg-zinc-800/80 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <div className="hidden sm:flex items-center gap-2">
                    <Link
                      href="/account"
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition ${
                        pathname === "/account"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                          : "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-700 hover:text-white"
                      }`}
                      title="Ver y editar Mi Cuenta"
                    >
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
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
                      className="flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Iniciar Sesión</span>
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400"
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
            <div className="mx-3 rounded-2xl border border-zinc-800 bg-zinc-950/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-md">
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}

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
                      className="flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 text-sm font-semibold text-zinc-950"
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
          </div>
        )}
      </div>
    </nav>
  );
}
