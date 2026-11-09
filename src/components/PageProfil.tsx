"use client";

import { FormulaireProfil } from "@/components/FormulaireProfil";
import { useEstMonte } from "@/hooks/useEstMonte";
import { profilStockage } from "@/hooks/useProfil";
import { LIMITES } from "@/lib/alcool";

export function PageProfil() {
  const monte = useEstMonte();

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Mon profil</h1>
          <p className="page__description">
            Ces informations servent à estimer ton taux d&apos;alcool. Elles restent dans ce
            navigateur.
          </p>
        </div>
      </header>

      <div className="b-split">
        <section className="panel" aria-label="Formulaire du profil">
          {/* Le formulaire attend le navigateur pour reprendre le profil enregistré */}
          {monte ? (
            <FormulaireProfil initial={profilStockage.lire()} />
          ) : (
            <div className="b-skeleton" style={{ minHeight: 420, border: "none" }} />
          )}
        </section>

        <aside className="panel">
          <div className="section">
            <h2 className="section__title">Comment est fait le calcul ?</h2>
            <p className="section__description">
              Avec la formule de Widmark : la quantité d&apos;alcool bue, divisée par ton poids
              multiplié par un coefficient (0,7 pour un homme, 0,6 pour une femme). Le foie
              élimine ensuite environ 0,10 à 0,15 g/L par heure ; l&apos;application retient
              la valeur la plus prudente.
            </p>
          </div>
          <div className="section">
            <h2 className="section__title">Limites en France</h2>
            <dl className="b-figures" style={{ marginTop: 10 }}>
              <div>
                <dt>Permis classique</dt>
                <dd>{LIMITES.standard.toString().replace(".", ",")} g/L</dd>
              </div>
              <div>
                <dt>Jeune permis</dt>
                <dd>{LIMITES.probatoire.toString().replace(".", ",")} g/L</dd>
              </div>
            </dl>
          </div>
          <div className="section">
            <h2 className="section__title">Une estimation</h2>
            <p className="section__description">
              Fatigue, médicaments ou métabolisme changent le résultat. Seul un éthylotest
              mesure ton taux réel.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
