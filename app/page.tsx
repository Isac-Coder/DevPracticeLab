"use client";

import Link from "next/link";
import { Server, Container, Database, Terminal, BookOpen, Zap, UserCheck, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import PracticeCard from "@/app/components/PracticeCard";
import Navbar from "@/app/components/Navbar";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-zinc-800">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5" />
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
                  <span>Iniciar Sesión</span>
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
              <strong className="text-white">Docker</strong> y{" "}
              <strong className="text-white">PostgreSQL</strong> en terminales
              simuladas sin necesidad de configurar servidores reales. Aprende,
              experimenta y domina estas herramientas esenciales de desarrollo.
            </p>

            <div className="flex flex-wrap gap-6 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                Comandos reales simulados
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                Sin configuración necesaria
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-400" />
                Terminales interactivas
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white">
              Elige qué quieres practicar
            </h2>
            <p className="mt-2 text-zinc-400">
              Selecciona una tecnología para abrir su terminal interactiva con
              comandos simulados.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <PracticeCard
              href="/ssh"
              title="SSH"
              description="Practica conexiones remotas, transferencia de archivos, generación de claves y configuración de servidores simulados."
              icon={Server}
              gradient="bg-gradient-to-br from-green-500 to-emerald-600"
              iconColor="text-emerald-400"
              features={[
                "Conexión a servidores simulados",
                "Generación de claves SSH",
                "Transferencia de archivos con SCP",
                "Navegación de sistema de archivos",
              ]}
            />

            <PracticeCard
              href="/docker"
              title="Docker"
              description="Gestiona contenedores, imágenes, redes y volúmenes. Practica Docker Compose y comandos de administración."
              icon={Container}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              iconColor="text-blue-400"
              features={[
                "Gestión de contenedores",
                "Manejo de imágenes y builds",
                "Redes y volúmenes",
                "Docker Compose",
              ]}
            />

            <PracticeCard
              href="/postgres"
              title="PostgreSQL"
              description="Ejecuta consultas SQL, crea tablas, inserta datos y practica con bases de datos simuladas pre-cargadas."
              icon={Database}
              gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
              iconColor="text-indigo-400"
              features={[
                "Consultas SELECT con filtros",
                "INSERT, UPDATE y DELETE",
                "Creación de tablas",
                "Datos de prueba pre-cargados",
              ]}
            />
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-zinc-800 bg-zinc-900/30">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="mb-10 text-2xl font-bold text-white">¿Cómo funciona?</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Elige una tecnología",
                  desc: "Selecciona SSH, Docker o PostgreSQL según lo que quieras practicar.",
                },
                {
                  step: "2",
                  title: "Usa la terminal simulada",
                  desc: "Escribe comandos reales en la terminal interactiva y observa las respuestas simuladas.",
                },
                {
                  step: "3",
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
