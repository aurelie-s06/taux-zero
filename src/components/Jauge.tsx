import { useId } from "react";
import { formatTaux } from "@/lib/alcool";

interface JaugeProps {
  /** Taux à afficher (g/L) */
  taux: number;
  /** Limite légale (g/L), affichée par un repère sur l'arc */
  limite: number;
  /** Valeur maximale de l'échelle (g/L) */
  max?: number;
  /** Texte sous la valeur */
  legende?: string;
}

const RAYON = 80;
const CIRCONFERENCE = 2 * Math.PI * RAYON;
const OUVERTURE = 0.75; // arc de 270°
const LONGUEUR_ARC = CIRCONFERENCE * OUVERTURE;

/** Jauge circulaire du taux d'alcool, avec repère de la limite légale */
export function Jauge({ taux, limite, max = 1, legende }: JaugeProps) {
  const idDegrade = useId();
  const ratio = Math.min(taux / max, 1);
  const depasse = taux >= limite;

  // Position du repère de limite (en degrés, départ à 135°)
  const angleLimite = 135 + (Math.min(limite / max, 1) * 270);
  const rad = (angleLimite * Math.PI) / 180;
  const repere = {
    x1: 100 + (RAYON - 14) * Math.cos(rad),
    y1: 100 + (RAYON - 14) * Math.sin(rad),
    x2: 100 + (RAYON + 14) * Math.cos(rad),
    y2: 100 + (RAYON + 14) * Math.sin(rad),
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-64">
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`Taux : ${formatTaux(taux)}`}>
        <defs>
          <linearGradient id={idDegrade} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--ok)" />
            <stop offset="55%" stopColor="var(--accent-2)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>

        {/* Fond de l'arc */}
        <circle
          cx="100"
          cy="100"
          r={RAYON}
          fill="none"
          stroke="var(--surface-strong)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${LONGUEUR_ARC} ${CIRCONFERENCE}`}
          transform="rotate(135 100 100)"
        />
        {/* Valeur */}
        <circle
          cx="100"
          cy="100"
          r={RAYON}
          fill="none"
          stroke={`url(#${idDegrade})`}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${LONGUEUR_ARC * ratio} ${CIRCONFERENCE}`}
          transform="rotate(135 100 100)"
          style={{ filter: "drop-shadow(0 0 6px rgb(255 77 141 / 0.5))" }}
        />
        {/* Repère de la limite légale */}
        <line {...repere} stroke="var(--foreground)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-display text-5xl font-bold ${depasse ? "text-danger" : "text-foreground"}`}>
          {taux.toFixed(2).replace(".", ",")}
        </span>
        <span className="text-sm text-muted">g/L de sang</span>
        {legende && <span className="mt-2 text-xs uppercase tracking-widest text-muted">{legende}</span>}
      </div>

      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface-strong px-3 py-1 text-xs text-muted">
        ┃ limite {formatTaux(limite)}
      </span>
    </div>
  );
}
