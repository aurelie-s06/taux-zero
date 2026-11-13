"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { formatHeure, formatTaux, tauxA, type Point, type Verre } from "@/lib/alcool";

interface Props {
  /** Simulation minute par minute (analyse.points) */
  points: Point[];
  limite: number;
  maintenant: number;
  verres: Verre[];
}

const MINUTE = 60_000;
const HAUTEUR = 240;
const MARGE = { haut: 18, droite: 16, bas: 28, gauche: 40 };
const PAS_CLAVIER = 15 * MINUTE;

/** Pas « rond » pour l'axe des taux */
function pasTaux(max: number) {
  if (max <= 0.6) return 0.1;
  if (max <= 1.5) return 0.2;
  return 0.5;
}

/** Pas des heures sur l'axe horizontal, selon la durée affichée */
function pasHeures(dureeMs: number) {
  const h = dureeMs / (60 * MINUTE);
  if (h <= 6) return 1;
  if (h <= 12) return 2;
  return 3;
}

const virgule = (n: number, decimales = 1) => n.toFixed(decimales).replace(".", ",");

/** Largeur disponible, suivie quand la fenêtre change de taille */
function useLargeur<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [largeur, setLargeur] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([entree]) => setLargeur(entree.contentRect.width));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, largeur] as const;
}

/**
 * Courbe du taux d'alcool au fil de la soirée : partie au-dessus de la limite en rouge,
 * ligne de la limite légale, repère « maintenant » et un point par verre.
 */
export function CourbeTaux({ points, limite, maintenant, verres }: Props) {
  const [conteneur, largeur] = useLargeur<HTMLDivElement>();
  const [curseur, setCurseur] = useState<number | null>(null);
  const idBrut = useId();
  const id = idBrut.replace(/[^a-zA-Z0-9]/g, "");

  if (points.length === 0) return null;

  // ---------- Échelles ----------
  const debut = points[0].t - 15 * MINUTE;
  const fin = Math.max(points[points.length - 1].t, maintenant) + 15 * MINUTE;
  const pic = Math.max(...points.map((p) => p.taux));
  const pas = pasTaux(Math.max(pic, limite));
  const yMax = Math.ceil((Math.max(pic, limite) * 1.1) / pas) * pas;

  const l = Math.max(largeur, 280);
  const xMin = MARGE.gauche;
  const xMax = l - MARGE.droite;
  const yBas = HAUTEUR - MARGE.bas;
  const yHaut = MARGE.haut;
  const x = (t: number) => xMin + ((t - debut) / (fin - debut)) * (xMax - xMin);
  const y = (taux: number) => yBas - (taux / yMax) * (yBas - yHaut);
  const tDepuisX = (px: number) =>
    Math.min(fin, Math.max(debut, debut + ((px - xMin) / (xMax - xMin)) * (fin - debut)));

  // ---------- Tracés ----------
  // Un point toutes les 5 minutes suffit pour une courbe lisse
  const echantillon = points.filter((_, i) => i % 5 === 0 || i === points.length - 1);
  const ligne = echantillon
    .map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.taux).toFixed(1)}`)
    .join("");
  const aire = `${ligne}L${x(echantillon.at(-1)!.t).toFixed(1)},${yBas}L${x(echantillon[0].t).toFixed(1)},${yBas}Z`;
  const yLimite = y(limite);

  const graduationsY: number[] = [];
  for (let v = 0; v <= yMax + 1e-9; v += pas) graduationsY.push(Math.round(v * 10) / 10);

  const heures = pasHeures(fin - debut);
  const graduationsX: number[] = [];
  const premiere = new Date(debut);
  premiere.setMinutes(0, 0, 0);
  for (let t = premiere.getTime(); t <= fin; t += 60 * MINUTE) {
    if (t >= debut && new Date(t).getHours() % heures === 0) graduationsX.push(t);
  }

  const tauxMaintenant = tauxA(points, maintenant);
  const maintenantVisible = maintenant >= debut && maintenant <= fin;

  // ---------- Survol et clavier ----------
  const tCurseur = curseur === null ? null : Math.round(curseur / MINUTE) * MINUTE;
  const tauxCurseur = tCurseur === null ? 0 : tauxA(points, tCurseur);
  const verresProches =
    tCurseur === null ? [] : verres.filter((v) => Math.abs(v.heure - tCurseur) <= 10 * MINUTE);

  function survoler(ev: PointerEvent<SVGSVGElement>) {
    const rect = ev.currentTarget.getBoundingClientRect();
    setCurseur(tDepuisX(ev.clientX - rect.left));
  }

  function clavier(ev: KeyboardEvent<SVGSVGElement>) {
    const actuel = curseur ?? Math.min(Math.max(maintenant, debut), fin);
    const suivant: Record<string, number> = {
      ArrowRight: actuel + PAS_CLAVIER,
      ArrowLeft: actuel - PAS_CLAVIER,
      Home: debut,
      End: fin,
    };
    if (ev.key in suivant) {
      ev.preventDefault();
      setCurseur(Math.min(fin, Math.max(debut, suivant[ev.key])));
    } else if (ev.key === "Escape") {
      setCurseur(null);
    }
  }

  // Infobulle : à droite du curseur, ou à gauche près du bord
  const xCurseur = tCurseur === null ? 0 : x(tCurseur);
  const infobulleAGauche = xCurseur > l - 170;

  // ---------- Tableau des données (toutes les 30 minutes) ----------
  const lignesTableau: { t: number; taux: number }[] = [];
  const debutTableau = new Date(points[0].t);
  debutTableau.setMinutes(debutTableau.getMinutes() < 30 ? 0 : 30, 0, 0);
  for (
    let t = debutTableau.getTime();
    t <= points[points.length - 1].t + 30 * MINUTE;
    t += 30 * MINUTE
  ) {
    lignesTableau.push({ t, taux: tauxA(points, t) });
  }

  return (
    <div>
      <ul className="b-legend" aria-hidden="true">
        <li>
          <span className="b-legend__line" style={{ background: "var(--ink)" }} />
          Taux estimé
        </li>
        <li>
          <span className="b-legend__line" style={{ background: "var(--out)" }} />
          Limite {formatTaux(limite)}
        </li>
        <li>
          <span className="b-legend__dot" />
          Un verre
        </li>
      </ul>

      <div ref={conteneur} className="b-courbe">
        {largeur > 0 && (
          <svg
            width={l}
            height={HAUTEUR}
            role="img"
            tabIndex={0}
            aria-label={`Courbe du taux d'alcool de ${formatHeure(points[0].t)} à ${formatHeure(points[points.length - 1].t)}. Pic : ${formatTaux(pic)}. Maintenant : ${formatTaux(tauxMaintenant)}. Flèches gauche et droite pour parcourir la courbe ; détail dans les données chiffrées.`}
            onPointerMove={survoler}
            onPointerLeave={() => setCurseur(null)}
            onKeyDown={clavier}
            onBlur={() => setCurseur(null)}
          >
            <defs>
              <clipPath id={`${id}-dessus`}>
                <rect x={0} y={0} width={l} height={Math.max(0, yLimite)} />
              </clipPath>
              <clipPath id={`${id}-dessous`}>
                <rect x={0} y={yLimite} width={l} height={Math.max(0, HAUTEUR - yLimite)} />
              </clipPath>
            </defs>

            {/* Grille et axe des taux */}
            {graduationsY.map((v) => (
              <g key={v}>
                <line x1={xMin} x2={xMax} y1={y(v)} y2={y(v)} className="b-courbe__grille" />
                <text
                  x={xMin - 8}
                  y={y(v)}
                  className="b-courbe__axe"
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {virgule(v)}
                </text>
              </g>
            ))}

            {/* Axe des heures */}
            {graduationsX.map((t) => (
              <text key={t} x={x(t)} y={HAUTEUR - 8} className="b-courbe__axe" textAnchor="middle">
                {new Date(t).getHours()}h
              </text>
            ))}

            {/* Aire et courbe : noire sous la limite, rouge au-dessus */}
            <path d={aire} className="b-courbe__aire" />
            <path d={ligne} className="b-courbe__ligne" clipPath={`url(#${id}-dessous)`} />
            <path
              d={ligne}
              className="b-courbe__ligne b-courbe__ligne--dessus"
              clipPath={`url(#${id}-dessus)`}
            />

            {/* Limite légale */}
            <line x1={xMin} x2={xMax} y1={yLimite} y2={yLimite} className="b-courbe__limite" />
            <text
              x={xMax}
              y={yLimite - 6}
              className="b-courbe__axe b-courbe__etiquette"
              textAnchor="end"
            >
              limite {formatTaux(limite)}
            </text>

            {/* Verres, posés sur l'axe */}
            {verres.map((v) => (
              <circle key={v.id} cx={x(v.heure)} cy={yBas} r={4} className="b-courbe__verre" />
            ))}

            {/* Maintenant */}
            {maintenantVisible && (
              <g>
                <line
                  x1={x(maintenant)}
                  x2={x(maintenant)}
                  y1={yHaut - 4}
                  y2={yBas}
                  className="b-courbe__maintenant"
                />
                <text
                  x={x(maintenant)}
                  y={yHaut - 8}
                  className="b-courbe__axe b-courbe__etiquette"
                  textAnchor="middle"
                >
                  maintenant
                </text>
                <circle
                  cx={x(maintenant)}
                  cy={y(tauxMaintenant)}
                  r={5}
                  className={`b-courbe__point ${tauxMaintenant >= limite ? "b-courbe__point--dessus" : ""}`}
                />
              </g>
            )}

            {/* Curseur */}
            {tCurseur !== null && (
              <g pointerEvents="none">
                <line
                  x1={xCurseur}
                  x2={xCurseur}
                  y1={yHaut}
                  y2={yBas}
                  className="b-courbe__curseur"
                />
                <circle
                  cx={xCurseur}
                  cy={y(tauxCurseur)}
                  r={4}
                  className={`b-courbe__point ${tauxCurseur >= limite ? "b-courbe__point--dessus" : ""}`}
                />
              </g>
            )}
          </svg>
        )}

        {tCurseur !== null && (
          <div
            className="b-infobulle"
            style={{
              left: infobulleAGauche ? undefined : xCurseur + 12,
              right: infobulleAGauche ? l - xCurseur + 12 : undefined,
            }}
            role="status"
          >
            <strong>{formatTaux(tauxCurseur)}</strong>
            <span>
              à {formatHeure(tCurseur)} ·{" "}
              {tauxCurseur >= limite ? "au-dessus de la limite" : "sous la limite"}
            </span>
            {verresProches.map((v) => (
              <span key={v.id}>
                {v.nom} ({formatHeure(v.heure)})
              </span>
            ))}
          </div>
        )}
      </div>

      <details className="b-chart-data">
        <summary>Voir les données chiffrées</summary>
        <div className="b-table-wrap">
          <table className="b-table">
            <caption className="sr-only">Taux d&apos;alcool estimé toutes les 30 minutes</caption>
            <thead>
              <tr>
                <th scope="col">Heure</th>
                <th scope="col" className="b-num">
                  Taux
                </th>
                <th scope="col">Volant ({formatTaux(limite)})</th>
              </tr>
            </thead>
            <tbody>
              {lignesTableau.map((r) => (
                <tr key={r.t}>
                  <th scope="row">{formatHeure(r.t)}</th>
                  <td className="b-num">{formatTaux(r.taux)}</td>
                  <td className={r.taux >= limite ? "b-amount--out" : "b-amount--in"}>
                    {r.taux >= limite ? "Au-dessus" : "Sous la limite"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
