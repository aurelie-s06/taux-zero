"use client";

import { startTransition, useActionState, useId, useState, type FormEvent } from "react";
import { ajouterUnVerre } from "@/app/actions/verres";
import { ErreurChamp } from "@/components/ErreurChamp";
import {
  CATALOGUE,
  depuisHeureSaisie,
  NOM_MAX,
  versHeureSaisie,
} from "@/lib/boissons";

const virgule = (n: number) => String(n).replace(".", ",");

/** Ajout d'un verre : boisson du catalogue (ou personnalisée), volume, degré et heure */
export function FormulaireVerre({ maintenant }: { maintenant: number }) {
  const [etat, action, enCours] = useActionState(ajouterUnVerre, {});
  const [boissonId, setBoissonId] = useState(CATALOGUE[0].id);
  const [nom, setNom] = useState("");
  const [volume, setVolume] = useState(virgule(CATALOGUE[0].volumeCl));
  const [degre, setDegre] = useState(virgule(CATALOGUE[0].degre));
  const [heure, setHeure] = useState(() => versHeureSaisie(maintenant));
  const id = useId();
  const e = etat.erreurs ?? {};
  const autre = boissonId === "autre";
  const buLe = depuisHeureSaisie(heure, maintenant);

  // Envoi sans la remise à zéro automatique de React : les champs gardent la boisson
  // choisie, pratique pour ajouter plusieurs fois le même verre
  function envoyer(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    const donnees = new FormData(ev.currentTarget);
    startTransition(() => action(donnees));
  }

  function choisir(nouvelId: string) {
    setBoissonId(nouvelId);
    const b = CATALOGUE.find((x) => x.id === nouvelId);
    if (b) {
      setVolume(virgule(b.volumeCl));
      setDegre(virgule(b.degre));
    }
  }

  // Props d'accessibilité d'un champ, avec son éventuelle erreur
  const relier = (champ: string, message?: string) => ({
    id: `${id}-${champ}`,
    "aria-invalid": message ? true : undefined,
    "aria-describedby": message ? `${id}-${champ}-erreur` : undefined,
  });

  return (
    <form className="b-form" onSubmit={envoyer} noValidate>
      <input type="hidden" name="buLe" value={Number.isFinite(buLe) ? buLe : ""} />
      {autre && <input type="hidden" name="categorie" value="autre" />}

      <div className="field">
        <label className="field__label" htmlFor={`${id}-boisson`}>
          Boisson
        </label>
        <select
          id={`${id}-boisson`}
          name="boisson"
          className="field__input"
          value={boissonId}
          onChange={(ev) => choisir(ev.target.value)}
        >
          {CATALOGUE.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nom}
            </option>
          ))}
          <option value="autre">Autre boisson…</option>
        </select>
      </div>

      {autre && (
        <div className="field">
          <label className="field__label" htmlFor={`${id}-nom`}>
            Nom de la boisson
          </label>
          <input
            {...relier("nom", e.nom)}
            name="nom"
            className="field__input"
            required
            maxLength={NOM_MAX}
            placeholder="ex. Verre de sangria"
            value={nom}
            onChange={(ev) => setNom(ev.target.value)}
          />
          <ErreurChamp id={`${id}-nom-erreur`} message={e.nom} />
        </div>
      )}

      <div className="b-row b-row--fields">
        <div className="field">
          <label className="field__label" htmlFor={`${id}-volume`}>
            Volume
          </label>
          <div className="field__suffix">
            <input
              {...relier("volume", e.volumeCl)}
              name="volume"
              className="field__input"
              inputMode="decimal"
              autoComplete="off"
              required
              value={volume}
              onChange={(ev) => setVolume(ev.target.value)}
            />
            <span aria-hidden="true">cl</span>
          </div>
          <ErreurChamp id={`${id}-volume-erreur`} message={e.volumeCl} />
        </div>

        <div className="field">
          <label className="field__label" htmlFor={`${id}-degre`}>
            Degré
          </label>
          <div className="field__suffix">
            <input
              {...relier("degre", e.degre)}
              name="degre"
              className="field__input"
              inputMode="decimal"
              autoComplete="off"
              required
              value={degre}
              onChange={(ev) => setDegre(ev.target.value)}
            />
            <span aria-hidden="true">%</span>
          </div>
          <ErreurChamp id={`${id}-degre-erreur`} message={e.degre} />
        </div>
      </div>
      <p className="b-form__hint">Valeurs habituelles : modifie-les si ton verre est plus grand.</p>

      <div className="field">
        <label className="field__label" htmlFor={`${id}-heure`}>
          Heure
        </label>
        <div className="b-row">
          <input
            {...relier("heure", e.buLe)}
            type="time"
            className="field__input"
            style={{ flex: 1 }}
            required
            value={heure}
            onChange={(ev) => setHeure(ev.target.value)}
          />
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => setHeure(versHeureSaisie(Date.now()))}
          >
            Maintenant
          </button>
        </div>
        <ErreurChamp id={`${id}-heure-erreur`} message={e.buLe} />
      </div>

      <button type="submit" className="btn btn--primary btn--block" disabled={enCours}>
        {enCours ? "Ajout…" : "Ajouter ce verre"}
      </button>
      <p role="status" className="field__hint" style={{ marginTop: -8 }}>
        {!enCours && etat.message}
      </p>
    </form>
  );
}
