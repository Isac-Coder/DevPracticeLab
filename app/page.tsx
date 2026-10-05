"use client";

import Link from "next/link";
import {
  Server,
  Container,
  Database,
  Code2,
  Terminal,
  BookOpen,
  Zap,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Activity,
  GraduationCap,
  Trophy,
  Medal,
  Sparkles,
  CheckCircle2,
  BookMarked,
  Languages,
} from "lucide-react";
import PracticeCard from "@/app/components/PracticeCard";
import Navbar from "@/app/components/Navbar";
import { OverallProgressDashboard } from "@/app/components/PracticeProgressBar";
import { useAuth } from "@/lib/AuthContext";
import { usePlatformMode } from "@/lib/PlatformModeContext";
import { TOP_NOTCH_LEVELS } from "@/lib/topNotchData";

export default function Home() {
  const { user } = useAuth();
  const { isEnglish } = usePlatformMode();

  if (isEnglish) {
    return (
      <div className="flex min-h-screen flex-col bg-[#030814] text-slate-100 transition-colors duration-300">
        <Navbar />

        <main className="flex-1">
          {/* Top Notch English Hero */}
          <section className="relative overflow-hidden border-b border-blue-900/50">
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 via-sky-500/5 to-indigo-600/10" />
            <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300 border border-sky-400/30 shadow-sm shadow-sky-500/10">
                  <Languages className="h-3.5 w-3.5 text-sky-400" />
                  <span>Metodología Oficial Top Notch & Summit (A1 — C1)</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300 border border-blue-500/20">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  <span>Gramática Activa & Desafíos Interactivos</span>
                </div>
              </div>

              {user ? (
                <div className="mb-6 inline-flex items-center gap-2 rounded-xl bg-blue-950/60 border border-sky-500/30 px-4 py-2 text-sm text-sky-200">
                  <UserCheck className="h-4 w-4 text-sky-400" />
                  <span>
                    Bienvenido al programa de inglés, <strong className="text-white font-bold">{user.username}</strong> ({user.email})
                  </span>
                </div>
              ) : (
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-2.5 text-sm font-bold text-zinc-950 transition hover:bg-sky-300 shadow-lg shadow-sky-500/20"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Iniciar Sesión para Guardar Progreso</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-800 bg-blue-950/60 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900/60"
                  >
                    <span>Crear Cuenta Gratis</span>
                  </Link>
                </div>
              )}

              <h1 className="mb-4 text-4xl sm:text-5xl font-black tracking-tight text-white">
                Aprende y Domina Inglés con{" "}
                <span className="bg-linear-to-r from-sky-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Top Notch & Summit
                </span>
              </h1>

              <p className="mb-8 max-w-2xl text-base sm:text-lg leading-relaxed text-slate-300">
                Aprende gramática rigurosa, fluidez comunicativa y precisión estructural desde <strong className="text-white">Fundamentals (A1)</strong> hasta <strong className="text-white">Summit 2 (C1)</strong> con retos interactivos, cursos por libro y manual de reglas gramaticales.
              </p>

              <div className="flex flex-wrap gap-6 text-sm text-slate-300">
                <Link href="/docs" className="flex items-center gap-2 hover:text-sky-300 transition">
                  <BookOpen className="h-4 w-4 text-sky-400" />
                  <span>Manual de Gramática Top Notch</span>
                </Link>
                <Link href="/courses" className="flex items-center gap-2 hover:text-blue-300 transition">
                  <GraduationCap className="h-4 w-4 text-blue-400" />
                  <span>6 Niveles por Libro</span>
                </Link>
                <Link href="/challenges" className="flex items-center gap-2 hover:text-amber-300 transition">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>Retos Semanales & XP</span>
                </Link>
                <Link href="/ranking" className="flex items-center gap-2 hover:text-cyan-300 transition">
                  <Medal className="h-4 w-4 text-cyan-400" />
                  <span>Leaderboard de Inglés</span>
                </Link>
              </div>
            </div>
          </section>

          {/* Top Notch Book Levels Grid */}
          <section className="mx-auto max-w-7xl px-6 py-14">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
                  <BookMarked className="h-4 w-4" />
                  <span>Estructura Curricular</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Niveles de los Libros Top Notch & Summit
                </h2>
                <p className="mt-2 text-slate-400 max-w-2xl">
                  Selecciona tu nivel para practicar sus reglas gramaticales, vocabulario clave y resolver retos diseñados específicamente para cada libro.
                </p>
              </div>

              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 bg-blue-950/70 px-4 py-2 text-xs font-bold text-sky-300 hover:border-sky-400 transition"
              >
                <span>Ver Plan de Cursos Completo</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TOP_NOTCH_LEVELS.map((lvl) => (
                <div
                  key={lvl.id}
                  className="group relative rounded-2xl border border-blue-900/60 bg-[#07152b] p-6 shadow-xl transition-all duration-300 hover:border-sky-400/50 hover:shadow-blue-900/20 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 h-24 w-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${lvl.badgeBg} ${lvl.badgeBorder} ${lvl.badgeText} border`}>
                        {lvl.cefrLevel}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {lvl.unitCount} Unidades
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
                      {lvl.bookTitle}
                    </h3>
                    <p className="text-xs text-sky-400 font-medium mb-3">{lvl.targetAudience}</p>
                    <p className="text-sm text-slate-300 leading-relaxed mb-4">
                      {lvl.description}
                    </p>

                    <div className="space-y-1.5 border-t border-blue-900/40 pt-3">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gramática Destacada:</p>
                      {lvl.coreGrammar.slice(0, 3).map((g, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{g}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 pt-4 border-t border-blue-900/40">
                    <Link
                      href={`/challenges?level=${lvl.id}`}
                      className="flex-1 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-sky-400/30 text-center py-2 text-xs font-bold text-sky-200 transition"
                    >
                      Retos de este Libro
                    </Link>
                    <Link
                      href={`/courses?level=${lvl.id}`}
                      className="flex-1 rounded-xl bg-sky-400 hover:bg-sky-300 text-center py-2 text-xs font-bold text-zinc-950 transition"
                    >
                      Ver Curso
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Access Sections */}
          <section className="border-t border-blue-900/50 bg-[#061122]/60">
            <div className="mx-auto max-w-7xl px-6 py-14">
              <h2 className="mb-8 text-2xl font-bold text-white text-center">
                Módulos de Práctica de Inglés
              </h2>

              <div className="grid gap-6 md:grid-cols-3">
                <Link
                  href="/docs"
                  className="group rounded-2xl border border-blue-900/60 bg-[#07162d] p-6 hover:border-sky-400/50 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300">Manual de Gramática</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    Explicaciones de cada tiempo verbal, fórmulas, ejemplos bilingües y errores comunes basados en Top Notch.
                  </p>
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                    Explorar Docs <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>

                <Link
                  href="/challenges"
                  className="group rounded-2xl border border-blue-900/60 bg-[#07162d] p-6 hover:border-sky-400/50 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-amber-300">Desafíos Dinámicos</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    Resuelve retos interactivos de conjugación, reconstrucción de oraciones, caza de errores y transforma tiempos.
                  </p>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    Resolver Retos <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>

                <Link
                  href="/ranking"
                  className="group rounded-2xl border border-blue-900/60 bg-[#07162d] p-6 hover:border-sky-400/50 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4 group-hover:scale-110 transition-transform">
                    <Medal className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300">Ranking & Badges</h3>
                  <p className="text-sm text-slate-300 leading-relaxed mb-4">
                    Gana puntos XP, desbloquea insignias de nivel (desde Fundamentals hasta Summit Master) y compite en el leaderboard.
                  </p>
                  <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                    Ver Ranking <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-blue-900/60 bg-[#040915]">
          <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-slate-400">
            TopNotch EnglishLab — Programa de Gramática, Cursos y Retos interactivos basados en la serie Top Notch & Summit
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-800">
          <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
          <div className="relative mx-auto max-w-7xl px-6 py-20">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <Terminal className="h-3.5 w-3.5" />
                <span>Entorno de práctica interactivo</span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20">
                <Activity className="h-3.5 w-3.5" />
                <span>Servicio Backend PostgreSQL & dont_stop activo</span>
              </div>
            </div>

            {user ? (
              <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm text-emerald-300">
                <UserCheck className="h-4 w-4 text-emerald-400" />
                <span>
                  Bienvenido de nuevo, <strong className="text-white font-bold">{user.username}</strong> ({user.email})
                </span>
              </div>
            ) : (
              <div className="mb-6 flex items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Iniciar Sesión para Practicar</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/60 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                >
                  <span>Crear Cuenta</span>
                </Link>
              </div>
            )}

            <h1 className="mb-4 text-5xl font-bold tracking-tight text-white">
              DevPractice<span className="text-emerald-400">Lab</span>
            </h1>
            <p className="mb-8 max-w-2xl text-lg leading-relaxed text-zinc-400">
              Practica comandos de <strong className="text-white">SSH</strong>,{" "}
              <strong className="text-white">Docker</strong>,{" "}
              <strong className="text-white">PostgreSQL</strong> y{" "}
              <strong className="text-white">TypeScript</strong> en terminales
              simuladas sin necesidad de configurar servidores reales. Inicia sesión
              para registrar tu progreso en tiempo real y desbloquear todas las terminales.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
              <Link href="/docs" className="flex items-center gap-2 hover:text-emerald-400 transition">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>Docs en vivo desde Internet</span>
              </Link>
              <Link href="/challenges" className="flex items-center gap-2 hover:text-amber-400 transition">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>200 Retos Semanales con XP</span>
              </Link>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-400" />
                <span>4 módulos de práctica</span>
              </div>
            </div>
          </div>
        </section>

        {/* Practice Progress Section if Logged In */}
        {user && (
          <section className="mx-auto max-w-7xl px-6 pt-12">
            <OverallProgressDashboard />
          </section>
        )}

        {/* Cards Section */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Elige qué quieres practicar
              </h2>
              <p className="mt-2 text-zinc-400">
                {user
                  ? "Selecciona una tecnología para abrir su terminal interactiva y continuar acumulando progreso."
                  : "Inicia sesión con tu cuenta para desbloquear las terminales interactivas y registrar tu progreso."}
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            <PracticeCard
              href="/ssh"
              moduleType="ssh"
              title="SSH"
              description="Practica conexiones remotas, transferencia de archivos, generación de claves y servidores simulados."
              icon={Server}
              gradient="bg-linear-to-br from-green-500 to-emerald-600"
              iconColor="text-emerald-400"
              features={[
                "Conexión a servidores simulados",
                "Generación de claves SSH",
                "Transferencia con SCP/SFTP",
                "Navegación de sistema de archivos",
              ]}
            />

            <PracticeCard
              href="/docker"
              moduleType="docker"
              title="Docker"
              description="Gestiona contenedores, imágenes, redes y volúmenes. Practica Docker Compose y administración."
              icon={Container}
              gradient="bg-linear-to-br from-sky-500 to-blue-600"
              iconColor="text-sky-400"
              features={[
                "Gestión de contenedores",
                "Manejo de imágenes y builds",
                "Redes y volúmenes",
                "Docker Compose",
              ]}
            />

            <PracticeCard
              href="/postgres"
              moduleType="postgres"
              title="PostgreSQL"
              description="Ejecuta consultas SQL, crea tablas, inserta datos y practica con bases de datos simuladas pre-cargadas."
              icon={Database}
              gradient="bg-linear-to-br from-indigo-500 to-violet-600"
              iconColor="text-indigo-400"
              features={[
                "Consultas SELECT con filtros",
                "INSERT, UPDATE y DELETE",
                "Creación de tablas",
                "Datos de prueba pre-cargados",
              ]}
            />

            <PracticeCard
              href="/typescript"
              moduleType="typescript"
              title="TypeScript"
              description="Practica tipado estático, interfaces, genéricos, utility types y compila código con validación de errores."
              icon={Code2}
              gradient="bg-linear-to-br from-blue-500 to-cyan-600"
              iconColor="text-blue-400"
              features={[
                "Editor de código TypeScript",
                "Validación de errores con tsc",
                "Tipos, interfaces y enums",
                "Utility Types (Partial, Pick, Omit)",
              ]}
            />
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-zinc-800 bg-zinc-900/30">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="mb-10 text-2xl font-bold text-white">¿Cómo funciona?</h2>
            <div className="grid gap-8 md:grid-cols-4">
              {[
                {
                  step: "1",
                  title: "Inicia Sesión",
                  desc: "Crea tu cuenta o inicia sesión para acceder a las terminales y guardar tu progreso.",
                },
                {
                  step: "2",
                  title: "Elige una tecnología",
                  desc: "Selecciona SSH, Docker, PostgreSQL o TypeScript según lo que quieras practicar.",
                },
                {
                  step: "3",
                  title: "Terminal simulada",
                  desc: "Escribe comandos reales en la terminal interactiva y observa las respuestas en vivo.",
                },
                {
                  step: "4",
                  title: "Aprende con --help",
                  desc: "Usa el comando --help en cualquier terminal para ver todos los comandos disponibles.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-sm text-zinc-500">
          DevPracticeLab — Entorno de práctica interactivo para desarrolladores
        </div>
      </footer>
    </div>
  );
}
