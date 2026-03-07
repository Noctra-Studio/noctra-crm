import Image from "next/image";
import Link from "next/link";
import { Clock, BarChart, Database } from "lucide-react";

export default function MigrationGuideCard({
  guide,
  locale,
}: {
  guide: any;
  locale: string;
}) {
  const getDifficultyStyles = (level: string) => {
    switch (level) {
      case "easy":
        return "bg-emerald-950/30 text-emerald-400 border border-emerald-800/40";
      case "medium":
        return "bg-amber-950/30 text-amber-400 border border-amber-800/40";
      case "advanced":
        return "bg-red-950/30 text-red-400 border border-red-800/40";
      default:
        return "bg-slate-800 text-slate-300";
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level) {
      case "easy":
        return "Fácil";
      case "medium":
        return "Medio";
      case "advanced":
        return "Avanzado";
      default:
        return "Desconocido";
    }
  };

  return (
    <Link
      href={`/${locale}/docs/migracion/${guide.slug.current}`}
      className="group flex flex-col items-center justify-center p-8 transition-all duration-300 relative overflow-hidden">
      <div className="flex flex-col items-center gap-6 relative z-10">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white/5 border border-white/5 transition-all duration-500 group-hover:bg-white/10 group-hover:border-white/20 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          {guide.platformLogo ? (
            <Image
              src={guide.platformLogo.asset.url}
              alt={guide.platform}
              width={40}
              height={40}
              className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <span className="text-2xl font-bold text-white/50 group-hover:text-white transition-colors">
              {guide.platform.charAt(0)}
            </span>
          )}
        </div>

        <div className="text-center">
          <h3 className="text-sm font-bold text-slate-500 group-hover:text-white uppercase tracking-[0.2em] transition-colors duration-300">
            {guide.platform}
          </h3>
          <div className="mt-2 flex items-center justify-center gap-3 text-[10px] text-slate-600 font-medium tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <span className="uppercase">{guide.estimatedTime}</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span className="uppercase">
              {getDifficultyLabel(guide.difficulty)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
