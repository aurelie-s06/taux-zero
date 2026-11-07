"use client";

import { useEstMonte } from "@/hooks/useEstMonte";
import { analyser, formatHeure, formatTaux, type Profil, type Verre } from "@/lib/alcool";

// Exemple de démonstration du moteur (sera remplacé par la saisie aux étapes 3-4)
const profilExemple: Profil = {
  sexe: "homme",
  poidsKg: 75,
  jeunePermis: false,
  aJeun: false,
};

function verresExemple(): Verre[] {
  const d = new Date();
  const a20h = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 0).getTime();
  return [
    { id: "1", nom: "Coupe de champagne", volumeCl: 12, degre: 12, heure: a20h },
    { id: "2", nom: "Verre de vin rouge", volumeCl: 12, degre: 13, heure: a20h + 45 * 60_000 },
    { id: "3", nom: "Pinte de bière", volumeCl: 50, degre: 5, heure: a20h + 90 * 60_000 },
  ];
}

export function DemoCalcul() {
  const monte = useEstMonte();

  if (!monte) {
    return <section className="h-72 animate-pulse rounded-2xl border border-border bg-surface" />;
  }

  const verres = verresExemple();
  const analyse = analyser(profilExemple, verres);
  const analyseJeunePermis = analyser({ ...profilExemple, jeunePermis: true }, verres);

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-lg font-semibold">Exemple de calcul</h2>
      <p className="mt-1 text-sm text-muted">Homme, 75 kg, a mangé :</p>
      <ul className="mt-3 space-y-1 text-sm">
        {verres.map((v) => (
          <li key={v.id}>
            <span className="text-accent">{formatHeure(v.heure)}</span> — {v.nom} ({v.volumeCl} cl
            à {v.degre}°)
          </li>
        ))}
      </ul>

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Stat
          label="Pic d'alcoolémie"
          valeur={analyse.pic ? `${formatTaux(analyse.pic.taux)} à ${formatHeure(analyse.pic.t)}` : "—"}
        />
        <Stat
          label="Retour à 0 g/L"
          valeur={analyse.heureSobre ? formatHeure(analyse.heureSobre) : "—"}
        />
        <Stat
          label="Conduite (permis classique, 0,5 g/L)"
          valeur={analyse.heureConduite ? `dès ${formatHeure(analyse.heureConduite)}` : "Possible"}
        />
        <Stat
          label="Conduite (jeune permis, 0,2 g/L)"
          valeur={
            analyseJeunePermis.heureConduite
              ? `dès ${formatHeure(analyseJeunePermis.heureConduite)}`
              : "Possible"
          }
        />
      </dl>
    </section>
  );
}

function Stat({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-semibold">{valeur}</dd>
    </div>
  );
}
