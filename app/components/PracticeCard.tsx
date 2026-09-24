"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface PracticeCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  iconColor: string;
  features: string[];
}

export default function PracticeCard({
  href,
  title,
  description,
  icon: Icon,
  gradient,
  iconColor,
  features,
}: PracticeCardProps) {
  return (
    <Link href={href} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1`}
      >
        {/* Gradient overlay */}
        <div
          className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 ${gradient}`}
        />

        <div className="relative z-10">
          <div
            className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-800 ${iconColor}`}
          >
            <Icon className="h-7 w-7" />
          </div>

          <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
          <p className="mb-4 text-sm leading-relaxed text-zinc-400">
            {description}
          </p>

          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                <div className={`h-1.5 w-1.5 rounded-full ${iconColor.replace("text-", "bg-")}`} />
                {feature}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors group-hover:text-white">
            Comenzar práctica
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
