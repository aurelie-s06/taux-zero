"use client";

import Link from "next/link";
import {
  Apple,
  Beer,
  CupSoda,
  GlassWater,
  Martini,
  Trash2,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { supprimerUnVerre, viderMaSoiree } from "@/app/actions/verres";
import { FormulaireVerre } from "@/components/FormulaireVerre";
import { Jauge } from "@/components/Jauge";
import { useMaintenant } from "@/hooks/useMaintenant";
import {
  analyser,
  formatDuree,
  formatHeure,
  formatTaux,
  grammesAlcool,
  type Profil,
  type Verre,
} from "@/lib/alcool";
import { libelles } from "@/lib/profil";

const ICONES: Record<string, LucideIcon> = {
  champagne: Wine,
  vin: Wine,
  biere: Beer,
  cidre: Apple,
  spiritueux: GlassWater,
  cocktail: Martini,
};

const virgule = (n: number) => String(n).replace(".", ",");

/** Ma soirée : taux en direct, heure de reprise du volant, verres et ajout d'un verre */
export function TableauSoiree({ profil, verres }: { profil: Profil; verres: Verre[] }) {
  // Calcul dans le navigateur, à l'heure de l'utilisateur, rafraîchi toutes les 30 s
  const maintenant = useMaintenant();

  if (maintenant === null) {
    return (
      <div className="b-soiree" aria-hidden="true">
        <div className="b-dash b-soiree__dash">
          <div className="b-skeleton b-span-6" />
          <div className="b-skeleton b-span-6" />
        </div>
        <div className="b-skeleton b-soiree__ajout" style={{ minHeight: 420 }} />
      </div>
    );
  }

  const analyse = analyser(profil, verres, maintenant);
  const { tauxActuel, limite, pic, heureConduite, heureSobre } = analyse;
  const doitAttendre = heureConduite !== null && heureConduite > maintenant;
  const encoreDeLAlcool = heureSobre !== null && heureSobre > maintenant;
  const ratio = Math.round((tauxActuel / limite) * 100);
  // L'échelle de la jauge s'agrandit si la soirée dépasse 1 g/L
  const max = Math.max(1, Math.ceil((pic?.taux ?? 0) * 2) / 2);

  return (
    // Ordre sur mobile : taux, ajout d'un verre, liste, profil
    <div className="b-soiree">
      <div className="b-dash b-soiree__dash">
        {/* Taux maintenant */}
        <section className="b-tile b-span-6">
          <h2 className="b-tile__label">Taux estimé maintenant</h2>
          <Jauge taux={tauxActuel} limite={limite} max={max} />
          <p className="b-tile__hint" style={{ textAlign: "center" }}>
            {pic && pic.taux > 0
              ? `Pic : ${formatTaux(pic.taux)} vers ${formatHeure(pic.t)}`
              : "Aucun verre pour l'instant"}{" "}
            · repère : limite {formatTaux(limite)}
          </p>
        </section>

        {/* Volant */}
        <section className="b-tile b-span-6">
          <h2 className="b-tile__label">Reprendre le volant</h2>
          <div className={`b-tile__value ${doitAttendre ? "" : "b-amount--in"}`}>
            {doitAttendre ? `Dès ${formatHeure(heureConduite)}` : "Possible"}
          </div>
          <p className="b-tile__hint">
            {doitAttendre
              ? `Encore ${formatDuree(heureConduite - maintenant)} avant de repasser sous ${formatTaux(limite)}.`
              : heureConduite !== null
                ? `Sous la limite de ${formatTaux(limite)} depuis ${formatHeure(heureConduite)}.`
                : `Tu ne dépasses pas ${formatTaux(limite)}.`}
          </p>
          <dl className="b-figures" style={{ marginTop: 16 }}>
            <div>
              <dt>Limite ({libelles.permis(profil).toLowerCase()})</dt>
              <dd>{formatTaux(limite)}</dd>
            </div>
            <div className="b-figures__total">
              <dt>Retour à 0 g/L</dt>
              <dd>{encoreDeLAlcool ? formatHeure(heureSobre) : "Déjà atteint"}</dd>
            </div>
          </dl>
          <div className="b-rate">
            <div className="b-bar">
              <div
                className="b-bar__fill"
                style={{
                  width: `${Math.min(ratio, 100)}%`,
                  background: ratio >= 100 ? "var(--out)" : "var(--ink)",
                }}
              />
            </div>
            <span className="b-tile__hint">Taux actuel : {ratio} % de la limite</span>
          </div>
        </section>
      </div>

      {/* Verres */}
      <section className="b-tile b-soiree__verres">
        <header className="b-tile__head">
          <div>
            <h2 className="section__title">
              Verres de la soirée <span className="b-badge">{verres.length}</span>
            </h2>
            <p className="section__description">Les verres des dernières 24 heures.</p>
          </div>
          {verres.length > 0 && (
            <form
              action={viderMaSoiree}
              onSubmit={(ev) => {
                if (!window.confirm("Effacer tous les verres de la soirée ?")) ev.preventDefault();
              }}
            >
              <button type="submit" className="b-link b-link--danger">
                Nouvelle soirée
              </button>
            </form>
          )}
        </header>

        {verres.length === 0 ? (
          <p className="b-empty">
            Aucun verre pour l&apos;instant. Ajoute ton premier verre avec le formulaire.
          </p>
        ) : (
          <ul>
            {[...verres].reverse().map((v) => {
              const Icone = ICONES[v.categorie ?? ""] ?? CupSoda;
              return (
                <li key={v.id} className="b-item">
                  <span className="b-item__icon">
                    <Icone size={18} aria-hidden="true" />
                  </span>
                  <div className="b-item__main">
                    <div className="b-item__title">{v.nom}</div>
                    <div className="b-item__meta">
                      {virgule(v.volumeCl)} cl · {virgule(v.degre)}° · ≈{" "}
                      {Math.round(grammesAlcool(v))} g d&apos;alcool
                    </div>
                  </div>
                  <span className="b-amount">{formatHeure(v.heure)}</span>
                  <form action={supprimerUnVerre.bind(null, v.id)}>
                    <button
                      type="submit"
                      className="iconbtn iconbtn--danger"
                      aria-label={`Supprimer : ${v.nom} de ${formatHeure(v.heure)}`}
                      title="Supprimer ce verre"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="panel b-soiree__ajout" aria-labelledby="titre-ajout">
        <h2 id="titre-ajout" className="section__title" style={{ marginBottom: 16 }}>
          Ajouter un verre
        </h2>
        <FormulaireVerre maintenant={maintenant} />
      </section>

      <section className="b-tile b-soiree__profil">
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
    </div>
  );
}
