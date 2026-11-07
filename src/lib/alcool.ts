/**
 * Moteur de calcul d'alcoolémie — Taux Zéro
 *
 * Basé sur la formule de Widmark :
 *   taux (g/L) = grammes d'alcool / (poids en kg × coefficient de diffusion)
 *
 * On y ajoute :
 *  - une phase d'absorption progressive (l'alcool passe dans le sang en 30 à 60 min) ;
 *  - une élimination constante par le foie (≈ 0,10 à 0,15 g/L par heure).
 *
 * ⚠️ Ce sont des estimations : chaque organisme est différent.
 */

// ---------- Types ----------

export type Sexe = "homme" | "femme";

export interface Profil {
  sexe: Sexe;
  poidsKg: number;
  /** Permis probatoire (jeune conducteur) → limite à 0,2 g/L */
  jeunePermis: boolean;
  /** À jeun, l'alcool est absorbé plus vite */
  aJeun: boolean;
}

export interface Verre {
  id: string;
  nom: string;
  /** Volume du verre en centilitres */
  volumeCl: number;
  /** Degré d'alcool (% vol.) */
  degre: number;
  /** Heure à laquelle le verre a été bu (timestamp en ms) */
  heure: number;
}

export interface Point {
  /** Timestamp en ms */
  t: number;
  /** Taux d'alcool en g/L de sang */
  taux: number;
}

export interface Analyse {
  tauxActuel: number;
  pic: Point | null;
  /** Limite légale applicable au profil (g/L) */
  limite: number;
  /** Heure à partir de laquelle on repasse sous la limite (null = jamais dépassée) */
  heureConduite: number | null;
  /** Heure à laquelle le taux revient à 0 g/L */
  heureSobre: number | null;
  points: Point[];
}

// ---------- Constantes ----------

/** Coefficient de diffusion de l'alcool dans le corps (Widmark) */
export const COEF_DIFFUSION: Record<Sexe, number> = {
  homme: 0.7,
  femme: 0.6,
};

/** Masse volumique de l'éthanol (g/mL) */
export const DENSITE_ALCOOL = 0.8;

/**
 * Élimination par heure (g/L/h).
 * La littérature donne 0,10 à 0,15 : on prend la valeur basse, plus prudente.
 */
export const ELIMINATION_PAR_HEURE = 0.1;

/** Durée d'absorption d'un verre (minutes) */
export const DUREE_ABSORPTION_MIN = {
  aJeun: 30,
  repas: 60,
};

/** Limites légales en France (g/L de sang) */
export const LIMITES = {
  standard: 0.5,
  probatoire: 0.2,
};

const MINUTE = 60_000;
/** Garde-fou : on ne simule jamais plus de 3 jours */
const SIMULATION_MAX_MIN = 3 * 24 * 60;

// ---------- Fonctions ----------

/** Quantité d'alcool pur contenue dans un verre (en grammes) */
export function grammesAlcool(verre: Pick<Verre, "volumeCl" | "degre">): number {
  const volumeMl = verre.volumeCl * 10;
  return volumeMl * (verre.degre / 100) * DENSITE_ALCOOL;
}

/** Limite légale selon le type de permis */
export function limiteLegale(profil: Pick<Profil, "jeunePermis">): number {
  return profil.jeunePermis ? LIMITES.probatoire : LIMITES.standard;
}

/**
 * Simule l'évolution du taux minute par minute,
 * du premier verre jusqu'au retour à 0 g/L.
 *
 * @param pasMin intervalle (en minutes) entre deux points renvoyés
 */
export function simuler(profil: Profil, verres: Verre[], pasMin = 1): Point[] {
  if (verres.length === 0 || profil.poidsKg <= 0) return [];

  const tries = [...verres].sort((a, b) => a.heure - b.heure);
  const debut = tries[0].heure;
  const dureeAbs = profil.aJeun
    ? DUREE_ABSORPTION_MIN.aJeun
    : DUREE_ABSORPTION_MIN.repas;
  const finAbsorption = tries[tries.length - 1].heure + dureeAbs * MINUTE;

  const masseDiffusion = profil.poidsKg * COEF_DIFFUSION[profil.sexe];
  const eliminationParMin = ELIMINATION_PAR_HEURE / 60;

  // Taux apporté par minute d'absorption, pour chaque verre
  const apports = tries.map((v) => ({
    debut: v.heure,
    fin: v.heure + dureeAbs * MINUTE,
    parMinute: grammesAlcool(v) / masseDiffusion / dureeAbs,
  }));

  const points: Point[] = [];
  let taux = 0;

  for (let i = 0; i <= SIMULATION_MAX_MIN; i++) {
    const t = debut + i * MINUTE;

    // Point enregistré avant le calcul de la minute (état à l'instant t)
    if (i % pasMin === 0) points.push({ t, taux });

    // Fin : tout est absorbé et éliminé
    if (t >= finAbsorption && taux === 0) {
      if (i % pasMin !== 0) points.push({ t, taux });
      break;
    }

    for (const a of apports) {
      if (t >= a.debut && t < a.fin) taux += a.parMinute;
    }
    taux = Math.max(0, taux - eliminationParMin);
  }

  return points;
}

/** Taux estimé à un instant donné, à partir d'une simulation */
export function tauxA(points: Point[], t: number): number {
  if (points.length === 0 || t < points[0].t) return 0;
  if (t >= points[points.length - 1].t) return 0;
  // Recherche du dernier point <= t
  let bas = 0;
  let haut = points.length - 1;
  while (bas < haut) {
    const milieu = Math.ceil((bas + haut) / 2);
    if (points[milieu].t <= t) bas = milieu;
    else haut = milieu - 1;
  }
  return points[bas].taux;
}

/** Analyse complète : taux actuel, pic, heure de reprise du volant, heure sobre */
export function analyser(
  profil: Profil,
  verres: Verre[],
  maintenant: number = Date.now(),
): Analyse {
  const limite = limiteLegale(profil);
  const points = simuler(profil, verres, 1);

  if (points.length === 0) {
    return {
      tauxActuel: 0,
      pic: null,
      limite,
      heureConduite: null,
      heureSobre: null,
      points,
    };
  }

  const pic = points.reduce((max, p) => (p.taux > max.taux ? p : max));

  // Dernier instant où le taux atteint ou dépasse la limite
  let dernierDepassement: Point | null = null;
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].taux >= limite) {
      dernierDepassement = points[i];
      break;
    }
  }

  return {
    tauxActuel: tauxA(points, maintenant),
    pic,
    limite,
    heureConduite: dernierDepassement ? dernierDepassement.t + MINUTE : null,
    heureSobre: points[points.length - 1].t,
    points,
  };
}

// ---------- Affichage ----------

/** Formate un timestamp en "20h30" */
export function formatHeure(t: number): string {
  const d = new Date(t);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}h${m}`;
}

/** Formate un taux en "0,42 g/L" */
export function formatTaux(taux: number): string {
  return `${taux.toFixed(2).replace(".", ",")} g/L`;
}
