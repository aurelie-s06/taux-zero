import { formatTaux } from "@/lib/alcool";

interface JaugeProps {
  /** Taux à afficher (g/L) */
  taux: number;
  /** Limite légale (g/L), affichée par un repère sur l'arc */
  limite: number;
  /** Valeur maximale de l'échelle (g/L) */
  max?: number;
}

const RAYON = 80;
const CIRCONFERENCE = 2 * Math.PI * RAYON;
const LONGUEUR_ARC = CIRCONFERENCE * 0.75; // arc de 270°

/** Jauge circulaire du taux : verte sous la limite, rouge au-dessus */
export function Jauge({ taux, limite, max = 1 }: JaugeProps) {
  const ratio = Math.min(taux / max, 1);
  const depasse = taux >= limite;
  const couleur = depasse ? "var(--out)" : "var(--in)";

  // Repère de la limite (l'arc commence à 135°)
  const angle = ((135 + Math.min(limite / max, 1) * 270) * Math.PI) / 180;
  const point = (r: number) => ({ x: 100 + r * Math.cos(angle), y: 100 + r * Math.sin(angle) });
  const a = point(RAYON - 12);
  const b = point(RAYON + 12);

  return (
    <div className="b-gauge">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle
          cx="100"
          cy="100"
          r={RAYON}
          fill="none"
          stroke="var(--line)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${LONGUEUR_ARC} ${CIRCONFERENCE}`}
          transform="rotate(135 100 100)"
        />
        {ratio > 0 && (
          <circle
            cx="100"
            cy="100"
            r={RAYON}
            fill="none"
            stroke={couleur}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${LONGUEUR_ARC * ratio} ${CIRCONFERENCE}`}
            transform="rotate(135 100 100)"
          />
        )}
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      <div className="b-gauge__center">
        <span className={`b-tile__value ${depasse ? "b-amount--out" : ""}`}>
          {taux.toFixed(2).replace(".", ",")}
        </span>
        <span className="b-gauge__unit">g/L de sang</span>
      </div>
      <p className="sr-only">
        Taux de {formatTaux(taux)}, {depasse ? "au-dessus" : "en dessous"} de la limite de{" "}
        {formatTaux(limite)}.
      </p>
    </div>
  );
}
