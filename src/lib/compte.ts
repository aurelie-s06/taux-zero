/**
 * Validation des formulaires de compte (inscription, connexion).
 * Sans dépendance serveur : testable avec `npm test`.
 */

export const MDP_MIN = 8;
export const MDP_MAX = 128;
export const PRENOM_MAX = 50;

export type Erreurs = Partial<Record<string, string>>;

export function normaliserEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function erreurEmail(email: string): string | null {
  if (!email) return "Indique ton adresse email.";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Cette adresse email n'est pas valide (ex. : prenom@exemple.fr).";
  }
  return null;
}

export function erreurMotDePasse(mdp: string): string | null {
  if (mdp.length < MDP_MIN) return `Le mot de passe doit contenir au moins ${MDP_MIN} caractères.`;
  if (mdp.length > MDP_MAX) return `Le mot de passe ne doit pas dépasser ${MDP_MAX} caractères.`;
  return null;
}

/** Vérifie les champs de l'inscription ; renvoie les erreurs par champ */
export function validerInscription(champs: {
  prenom: string;
  email: string;
  motDePasse: string;
  confirmation: string;
  /** Acceptation de la politique de confidentialité */
  consentement: boolean;
}): Erreurs {
  const erreurs: Erreurs = {};
  if (champs.prenom.length > PRENOM_MAX) {
    erreurs.prenom = `Le prénom ne doit pas dépasser ${PRENOM_MAX} caractères.`;
  }
  const email = erreurEmail(champs.email);
  if (email) erreurs.email = email;
  const mdp = erreurMotDePasse(champs.motDePasse);
  if (mdp) erreurs.motDePasse = mdp;
  else if (champs.confirmation !== champs.motDePasse) {
    erreurs.confirmation = "Les deux mots de passe ne sont pas identiques.";
  }
  if (!champs.consentement) {
    erreurs.consentement =
      "Pour créer un compte, accepte que tes données soient traitées comme décrit dans la politique de confidentialité.";
  }
  return erreurs;
}

/** Initiales affichées dans la barre du haut (« AS », ou la 1re lettre de l'email) */
export function initiales(prenom: string | null, email: string): string {
  const source = prenom?.trim() || email;
  const mots = source.split(/[\s-]+/).filter(Boolean);
  const lettres = mots.length > 1 ? mots[0][0] + mots[1][0] : source.slice(0, 1);
  return lettres.toUpperCase();
}
