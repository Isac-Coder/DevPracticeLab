export interface AccountLevelInfo {
  level: number;
  title: string;
  badgeColor: string;
  minCompleted: number;
  nextLevelTarget: number;
  progressPercent: number;
  totalXP: number;
  nextLevelXP: number;
  rankBadge: string;
  description: string;
}

const LEVEL_TIERS = [
  { level: 1, title: "Novato de Terminal", minCompleted: 0, nextTarget: 3, xpNeeded: 300, badge: "🌱", desc: "Iniciando en la línea de comandos y entornos simulados." },
  { level: 2, title: "Aprendiz de Sistemas", minCompleted: 3, nextTarget: 7, xpNeeded: 800, badge: "⚡", desc: "Dominando comandos básicos de navegación y configuración." },
  { level: 3, title: "Técnico Junior", minCompleted: 7, nextTarget: 12, xpNeeded: 1500, badge: "🛠️", desc: "Familiarizado con SSH, contenedores y consultas SQL iniciales." },
  { level: 4, title: "Desarrollador de Terminal", minCompleted: 12, nextTarget: 18, xpNeeded: 2500, badge: "💻", desc: "Manejo ágil de contenedores, scripts y tipos en TypeScript." },
  { level: 5, title: "Especialista DevOps Junior", minCompleted: 18, nextTarget: 25, xpNeeded: 3800, badge: "🚀", desc: "Capaz de resolver despliegues y automatizaciones complejas." },
  { level: 6, title: "Administrador de Sistemas", minCompleted: 25, nextTarget: 35, xpNeeded: 5500, badge: "🛡️", desc: "Control total de seguridad SSH y arquitecturas Docker Compose." },
  { level: 7, title: "Ingeniero Cloud & Datos", minCompleted: 35, nextTarget: 50, xpNeeded: 8000, badge: "🐘", desc: "Optimización de bases de datos PostgreSQL y pipelines tipados." },
  { level: 8, title: "Arquitecto de Infraestructura", minCompleted: 50, nextTarget: 75, xpNeeded: 12000, badge: "🏛️", desc: "Diseño de soluciones resilientes y orquestación avanzada." },
  { level: 9, title: "Maestro de Servidores", minCompleted: 75, nextTarget: 100, xpNeeded: 18000, badge: "👑", desc: "Dominio de más del 50% de todos los retos y tecnologías." },
  { level: 10, title: "Gran Maestro DevSecOps", minCompleted: 100, nextTarget: 140, xpNeeded: 26000, badge: "🔮", desc: "Experto en las cuatro tecnologías del laboratorio." },
  { level: 11, title: "Leyenda del Código & Servidor", minCompleted: 140, nextTarget: 200, xpNeeded: 40000, badge: "🌟", desc: "Ha completado la gran mayoría de los retos de DevPracticeLab." },
  { level: 12, title: "Dios de la Terminal (Top 1%)", minCompleted: 200, nextTarget: 200, xpNeeded: 60000, badge: "🏆", desc: "Completitud absoluta: Máximo nivel técnico alcanzado." },
];

export function calculateAccountLevel(completedCount: number, totalXP: number): AccountLevelInfo {
  let currentTier = LEVEL_TIERS[0];

  for (let i = 0; i < LEVEL_TIERS.length; i++) {
    if (completedCount >= LEVEL_TIERS[i].minCompleted) {
      currentTier = LEVEL_TIERS[i];
    } else {
      break;
    }
  }

  const prevMin = currentTier.minCompleted;
  const nextTarget = currentTier.nextTarget;
  const range = nextTarget - prevMin;
  const currentInRange = completedCount - prevMin;
  const progressPercent = range > 0 ? Math.min(100, Math.round((currentInRange / range) * 100)) : 100;

  const badgeColor =
    currentTier.level >= 10
      ? "from-amber-400 to-yellow-600 text-yellow-300 border-amber-500/40"
      : currentTier.level >= 7
      ? "from-purple-500 to-indigo-600 text-purple-300 border-purple-500/40"
      : currentTier.level >= 4
      ? "from-blue-500 to-cyan-600 text-blue-300 border-blue-500/40"
      : "from-emerald-500 to-teal-600 text-emerald-300 border-emerald-500/40";

  return {
    level: currentTier.level,
    title: currentTier.title,
    badgeColor,
    minCompleted: currentTier.minCompleted,
    nextLevelTarget: currentTier.nextTarget,
    progressPercent,
    totalXP,
    nextLevelXP: currentTier.xpNeeded,
    rankBadge: currentTier.badge,
    description: currentTier.desc,
  };
}
