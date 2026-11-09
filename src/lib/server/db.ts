import "server-only";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

/**
 * Base SQLite (module intégré à Node 24, aucun paquet à installer).
 * Le fichier est créé au premier lancement dans `data/`, ignoré par git.
 */
const CHEMIN = process.env.DATABASE_PATH ?? "data/taux-zero.sqlite";

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS utilisateurs (
    id            INTEGER PRIMARY KEY,
    email         TEXT    NOT NULL UNIQUE,
    prenom        TEXT,
    mot_de_passe  TEXT    NOT NULL,
    cree_le       INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id              TEXT    PRIMARY KEY,  -- empreinte SHA-256 du jeton du cookie
    utilisateur_id  INTEGER NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    expire_le       INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS profils (
    utilisateur_id  INTEGER PRIMARY KEY REFERENCES utilisateurs(id) ON DELETE CASCADE,
    sexe            TEXT    NOT NULL CHECK (sexe IN ('homme', 'femme')),
    poids_kg        REAL    NOT NULL,
    jeune_permis    INTEGER NOT NULL,
    a_jeun          INTEGER NOT NULL,
    modifie_le      INTEGER NOT NULL
  );
`;

// En développement, le rechargement à chaud réévalue ce fichier :
// on garde une seule connexion pour tout le processus.
const global = globalThis as unknown as { tauxZeroDb?: DatabaseSync };

/** Connexion à la base, ouverte au premier usage (et pas dès l'import du fichier) */
export function db(): DatabaseSync {
  if (!global.tauxZeroDb) {
    mkdirSync(dirname(CHEMIN), { recursive: true });
    // Attend jusqu'à 5 s si un autre processus écrit en même temps
    const connexion = new DatabaseSync(CHEMIN, { timeout: 5000 });
    connexion.exec(SCHEMA);
    global.tauxZeroDb = connexion;
  }
  return global.tauxZeroDb;
}
