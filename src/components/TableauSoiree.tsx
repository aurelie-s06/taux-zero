"use client";

import Link from "next/link";
import { Beer, Martini, UserRound, Wine } from "lucide-react";
import { Jauge } from "@/components/Jauge";
import { useEstMonte } from "@/hooks/useEstMonte";
import { useProfil } from "@/hooks/useProfil";
import {
  analyser,
  formatHeure,
  formatTaux,
  grammesAlcool,
  type Verre,
} from "@/lib/alcool";
import { libelles } from "@/lib/profil";

// Verres d'exemple : la saisie arrive à l'étape 4
function verresExemple(): Verre[] {
  const d = new Date();
  const a20h = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 0).getTime();
  return [
    { id: "1", nom: "Coupe de champagne", volumeCl: 12, degre: 12, heure: a20h },
    { id: "2", nom: "Verre de vin rouge", volumeCl: 12, degre: 13, heure: a20h + 45 * 60_000 },
    { id: "3", nom: "Pinte de bière", volumeCl: 50, degre: 5, heure: a20h + 90 * 60_000 },
  ];
}

const ICONES = { "1": Martini, "2": Wine, "3": Beer } as Record<string, typeof Wine>;

export function TableauSoiree() {
  const monte = useEstMonte();
  const profil = useProfil();

  // Rendu serveur : squelettes, le profil est lu dans le navigateur
  if (!monte) {
    return (
      <div className="page">
        <EnTete />
        <div className="b-dash" aria-hidden="true">
          <div className="b-skeleton b-span-4" />
          <div className="b-skeleton b-span-4" />
          <div className="b-skeleton b-span-4" />
        </div>
      </div>
    );
  }

  if (!profil) {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty__mark">
            <UserRound size={22} aria-hidden="true" />
          </div>
          <h1>Commence par ton profil</h1>
          <p>
            Ton poids, ton sexe et ton type de permis permettent d&apos;estimer ton taux
            d&apos;alcool et l&apos;heure à laquelle tu peux reprendre le volant.
          </p>
          <Link href="/profil" className="btn btn--primary">
            Remplir mon profil
          </Link>
        </div>
      </div>
    );
  }

  const verres = verresExemple();
  const analyse = analyser(profil, verres);
  const pic = analyse.pic?.taux ?? 0;
  const depasse = analyse.heureConduite !== null;
  const ratioLimite = Math.round((pic / analyse.limite) * 100);

  return (
    <div className="page">
      <EnTete />

      <div className="b-dash">
        {/* Pic */}
        <section className="b-tile b-span-4">
          <h2 className="b-tile__label">Taux maximal estimé</h2>
          <Jauge taux={pic} limite={analyse.limite} />
          <p className="b-tile__hint" style={{ textAlign: "center" }}>
            {analyse.pic ? `Atteint vers ${formatHeure(analyse.pic.t)}` : "Aucun verre"} · repère :
            limite {formatTaux(analyse.limite)}
          </p>
        </section>

        {/* Volant */}
        <section className="b-tile b-span-4">
          <h2 className="b-tile__label">Reprendre le volant</h2>
          <div className={`b-tile__value ${depasse ? "" : "b-amount--in"}`}>
            {depasse ? `Dès ${formatHeure(analyse.heureConduite!)}` : "Possible"}
          </div>
          <p className="b-tile__hint">
            {depasse
              ? `Heure à laquelle tu repasses sous ${formatTaux(analyse.limite)}.`
              : `Tu ne dépasses pas ${formatTaux(analyse.limite)}.`}
          </p>
          <dl className="b-figures" style={{ marginTop: 16 }}>
            <div>
              <dt>Limite</dt>
              <dd>{formatTaux(analyse.limite)}</dd>
            </div>
            <div className="b-figures__total">
              <dt>Retour à 0 g/L</dt>
              <dd>{analyse.heureSobre ? formatHeure(analyse.heureSobre) : "—"}</dd>
            </div>
          </dl>
          <div className="b-rate">
            <div className="b-bar">
              <div
                className="b-bar__fill"
                style={{
                  width: `${Math.min(ratioLimite, 100)}%`,
                  background: ratioLimite >= 100 ? "var(--out)" : "var(--ink)",
                }}
              />
            </div>
            <span className="b-tile__hint">Pic à {ratioLimite} % de la limite</span>
          </div>
        </section>

        {/* Profil */}
        <section className="b-tile b-span-4">
          <header className="b-tile__head">
            <h2 className="b-tile__label">Mon profil</h2>
            <Link href="/profil" className="b-link">
              Modifier
            </Link>
          </header>
          <dl className="b-figures">
            <div>
              <dt>Sexe</dt>
              <dd>{libelles.sexe(profil)}</dd>
            </div>
            <div>
              <dt>Poids</dt>
              <dd>{libelles.poids(profil)}</dd>
            </div>
            <div>
              <dt>Permis</dt>
              <dd>{libelles.permis(profil)}</dd>
            </div>
            <div>
              <dt>Estomac</dt>
              <dd>{libelles.repas(profil)}</dd>
            </div>
          </dl>
        </section>

        {/* Verres */}
        <section className="b-tile b-span-12">
          <header className="b-tile__head">
            <div>
              <h2 className="section__title">
                Verres de la soirée <span className="b-badge">Exemple</span>
              </h2>
              <p className="section__description">
                Une soirée type pour tester le calcul avec ton profil. Tu pourras bientôt
                ajouter tes propres verres.
              </p>
            </div>
          </header>
          <ul>
            {verres.map((v) => {
              const Icone = ICONES[v.id] ?? Wine;
              return (
                <li key={v.id} className="b-item">
                  <span className="b-item__icon">
                    <Icone size={18} aria-hidden="true" />
                  </span>
                  <div className="b-item__main">
                    <div className="b-item__title">{v.nom}</div>
                    <div className="b-item__meta">
                      {v.volumeCl} cl · {v.degre}° · ≈ {Math.round(grammesAlcool(v))} g
                      d&apos;alcool
                    </div>
                  </div>
                  <span className="b-amount">{formatHeure(v.heure)}</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

function EnTete() {
  return (
    <header className="page__header">
      <div>
        <h1 className="page__title">Ma soirée</h1>
        <p className="page__description">Ton taux d&apos;alcool estimé, verre après verre.</p>
      </div>
    </header>
  );
}
