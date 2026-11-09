"use client";

import { Jauge } from "@/components/Jauge";
import { useEstMonte } from "@/hooks/useEstMonte";
import { analyser, formatHeure, grammesAlcool, type Profil, type Verre } from "@/lib/alcool";

// Exemple de démonstration du moteur (sera remplacé par la saisie aux étapes 3-4)
const profilExemple: Profil = {
  sexe: "homme",
  poidsKg: 75,
  jeunePermis: false,
  aJeun: false,
};

const EMOJIS: Record<string, string> = { "1": "🥂", "2": "🍷", "3": "🍺" };

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
    return <div className="carte h-[28rem] animate-pulse" />;
  }

  const verres = verresExemple();
  const analyse = analyser(profilExemple, verres);
  const analyseJP = analyser({ ...profilExemple, jeunePermis: true }, verres);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-xl font-semibold">Exemple de soirée</h2>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          👤 Homme · 75 kg · a mangé
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        {/* Jauge du pic */}
        <section className="carte flex flex-col justify-center p-6">
          <Jauge
            taux={analyse.pic?.taux ?? 0}
            limite={analyse.limite}
            legende={analyse.pic ? `pic à ${formatHeure(analyse.pic.t)}` : undefined}
          />
        </section>

        {/* Verdicts */}
        <section className="grid gap-3">
          <Verdict
            titre="Permis classique"
            sousTitre="limite 0,5 g/L"
            heure={analyse.heureConduite}
          />
          <Verdict
            titre="Jeune permis"
            sousTitre="limite 0,2 g/L"
            heure={analyseJP.heureConduite}
          />
          <div className="carte flex items-center gap-4 p-5">
            <span className="text-3xl">😴</span>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">Retour à 0 g/L</p>
              <p className="font-display text-2xl font-bold">
                {analyse.heureSobre ? formatHeure(analyse.heureSobre) : "—"}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Chronologie des verres */}
      <section className="carte p-6">
        <h3 className="mb-4 text-xs uppercase tracking-widest text-muted">Les verres</h3>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {verres.map((v) => (
            <li key={v.id} className="relative">
              <span className="absolute -left-[2.15rem] flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background text-sm">
                {EMOJIS[v.id]}
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <p className="font-medium">{v.nom}</p>
                <p className="font-mono text-sm texte-neon">{formatHeure(v.heure)}</p>
              </div>
              <p className="text-sm text-muted">
                {v.volumeCl} cl · {v.degre}° · ≈ {Math.round(grammesAlcool(v))} g d&apos;alcool
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Verdict({
  titre,
  sousTitre,
  heure,
}: {
  titre: string;
  sousTitre: string;
  heure: number | null;
}) {
  const ok = heure === null;
  return (
    <div className="carte flex items-center gap-4 p-5">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${
          ok ? "bg-ok/15" : "bg-danger/15"
        }`}
      >
        🚗
      </span>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest text-muted">
          {titre} · {sousTitre}
        </p>
        <p className={`font-display text-2xl font-bold ${ok ? "text-ok" : "text-foreground"}`}>
          {ok ? "Conduite possible" : <>Volant dès <span className="texte-neon">{formatHeure(heure)}</span></>}
        </p>
      </div>
    </div>
  );
}
