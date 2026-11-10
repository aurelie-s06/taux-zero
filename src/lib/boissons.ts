/**
 * Catalogue des boissons et validation d'un verre ajouté.
 * (Sans dépendance serveur : testable avec `npm test`.)
 */

export type Categorie = "champagne" | "vin" | "biere" | "cidre" | "spiritueux" | "cocktail" | "autre";

export interface Boisson {
  id: string;
  nom: string;
  categorie: Categorie;
  /** Volume servi habituellement (cl) */
  volumeCl: number;
  /** Degré d'alcool habituel (% vol.) */
  degre: number;
}

/** Verres « standard » servis en France (environ 10 g d'alcool chacun) */
export const CATALOGUE: Boisson[] = [
  { id: "champagne", nom: "Coupe de champagne", categorie: "champagne", volumeCl: 12, degre: 12 },
  { id: "vin-rouge", nom: "Verre de vin rouge", categorie: "vin", volumeCl: 12, degre: 13 },
  { id: "vin-blanc", nom: "Verre de vin blanc", categorie: "vin", volumeCl: 12, degre: 11.5 },
  { id: "vin-rose", nom: "Verre de rosé", categorie: "vin", volumeCl: 12, degre: 12 },
  { id: "demi", nom: "Demi de bière", categorie: "biere", volumeCl: 25, degre: 5 },
  { id: "pinte", nom: "Pinte de bière", categorie: "biere", volumeCl: 50, degre: 5 },
  { id: "biere-forte", nom: "Bière forte (33 cl)", categorie: "biere", volumeCl: 33, degre: 8 },
  { id: "cidre", nom: "Bolée de cidre", categorie: "cidre", volumeCl: 25, degre: 5 },
  { id: "spritz", nom: "Spritz", categorie: "cocktail", volumeCl: 20, degre: 8 },
  { id: "cocktail", nom: "Cocktail (mojito, punch…)", categorie: "cocktail", volumeCl: 20, degre: 10 },
  { id: "pastis", nom: "Pastis", categorie: "spiritueux", volumeCl: 2, degre: 45 },
  { id: "whisky", nom: "Whisky", categorie: "spiritueux", volumeCl: 4, degre: 40 },
  { id: "shot", nom: "Shot (vodka, rhum, tequila…)", categorie: "spiritueux", volumeCl: 3, degre: 40 },
];

export const CATEGORIES: Categorie[] = ["champagne", "vin", "biere", "cidre", "spiritueux", "cocktail", "autre"];

export const estCategorie = (c: unknown): c is Categorie =>
  typeof c === "string" && (CATEGORIES as string[]).includes(c);

// ---------- Validation ----------

export const NOM_MAX = 60;
export const VOLUME_MIN = 1;
export const VOLUME_MAX = 100;
export const DEGRE_MIN = 0.5;
export const DEGRE_MAX = 80;
/** On ne garde que les verres des dernières 24 h */
export const FENETRE_SOIREE_MS = 24 * 60 * 60 * 1000;
/** Petite marge pour un verre noté juste avant de le boire */
export const AVANCE_MAX_MS = 15 * 60 * 1000;
export const VERRES_MAX = 50;

export interface SaisieVerre {
  nom: string;
  volumeCl: number;
  degre: number;
  buLe: number;
}

export type ErreursVerre = Partial<Record<keyof SaisieVerre, string>>;

/** Lit un nombre tapé par l'utilisateur (« 12,5 » ou « 12.5 ») */
export function lireNombre(saisie: string): number {
  const texte = saisie.trim().replace(",", ".");
  return texte === "" ? NaN : Number(texte);
}

export function validerVerre(v: SaisieVerre, maintenant: number): ErreursVerre {
  const erreurs: ErreursVerre = {};
  if (!v.nom.trim()) erreurs.nom = "Donne un nom à ta boisson.";
  else if (v.nom.length > NOM_MAX) erreurs.nom = `${NOM_MAX} caractères maximum.`;

  if (!Number.isFinite(v.volumeCl) || v.volumeCl < VOLUME_MIN || v.volumeCl > VOLUME_MAX) {
    erreurs.volumeCl = `Le volume doit être compris entre ${VOLUME_MIN} et ${VOLUME_MAX} cl.`;
  }
  if (!Number.isFinite(v.degre) || v.degre < DEGRE_MIN || v.degre > DEGRE_MAX) {
    erreurs.degre = `Le degré doit être compris entre ${DEGRE_MIN.toString().replace(".", ",")} et ${DEGRE_MAX}°.`;
  }
  if (!Number.isFinite(v.buLe)) {
    erreurs.buLe = "Indique l'heure à laquelle tu as bu ce verre.";
  } else if (v.buLe > maintenant + AVANCE_MAX_MS) {
    erreurs.buLe = "Cette heure est dans le futur.";
  } else if (v.buLe < maintenant - FENETRE_SOIREE_MS) {
    erreurs.buLe = "Ce verre date de plus de 24 h.";
  }
  return erreurs;
}

// ---------- Heure ----------

/** « 21:30 » pour un timestamp, à l'heure locale */
export function versHeureSaisie(t: number): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/**
 * Convertit l'heure tapée (« 23:00 ») en timestamp, à l'heure locale.
 * Une heure plus tard que maintenant désigne la veille :
 * à 1 h du matin, « 23:00 » veut dire hier soir.
 */
export function depuisHeureSaisie(heure: string, maintenant: number): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(heure);
  if (!m) return NaN;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return NaN;
  const d = new Date(maintenant);
  d.setHours(h, min, 0, 0);
  if (d.getTime() > maintenant + AVANCE_MAX_MS) d.setDate(d.getDate() - 1);
  return d.getTime();
}
