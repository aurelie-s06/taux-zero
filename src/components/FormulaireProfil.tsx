"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { enregistrerMonProfil } from "@/app/actions/profil";
import { ErreurChamp } from "@/components/ErreurChamp";
import type { Profil, Sexe } from "@/lib/alcool";

interface Props {
  /** Profil déjà enregistré (null au premier remplissage) */
  initial: Profil | null;
}

export function FormulaireProfil({ initial }: Props) {
  const [etat, action, enCours] = useActionState(enregistrerMonProfil, {});
  const [sexe, setSexe] = useState<Sexe>(initial?.sexe ?? "femme");
  const [jeunePermis, setJeunePermis] = useState(initial?.jeunePermis ?? false);
  const [aJeun, setAJeun] = useState(initial?.aJeun ?? false);
  const id = useId();
  const erreurPoids = etat.erreurs?.poids;

  return (
    <form className="b-form" action={action} noValidate>
      {/* Les choix à boutons sont envoyés par des champs cachés */}
      <input type="hidden" name="sexe" value={sexe} />
      <input type="hidden" name="jeunePermis" value={String(jeunePermis)} />
      <input type="hidden" name="aJeun" value={String(aJeun)} />

      <Choix
        label="Sexe"
        hint="Le corps d'une femme contient un peu moins d'eau : à poids égal, le taux monte plus haut."
        valeur={sexe}
        options={[
          { valeur: "femme", label: "Femme" },
          { valeur: "homme", label: "Homme" },
        ]}
        onChange={setSexe}
      />

      <div className="field">
        <label className="field__label" htmlFor={`${id}-poids`}>
          Poids
        </label>
        <div className="field__suffix">
          <input
            id={`${id}-poids`}
            name="poids"
            className="field__input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            required
            placeholder="ex. 62"
            defaultValue={
              etat.valeurs?.poids ?? (initial ? String(initial.poidsKg).replace(".", ",") : "")
            }
            aria-invalid={erreurPoids ? true : undefined}
            aria-describedby={`${id}-poids-aide${erreurPoids ? ` ${id}-poids-erreur` : ""}`}
          />
          <span aria-hidden="true">kg</span>
        </div>
        <ErreurChamp id={`${id}-poids-erreur`} message={erreurPoids} />
        <p id={`${id}-poids-aide`} className="field__hint">
          Plus le poids est élevé, plus l&apos;alcool est dilué dans le corps.
        </p>
      </div>

      <Choix
        label="Permis de conduire"
        hint="Le permis probatoire dure 3 ans (2 ans après une conduite accompagnée)."
        valeur={jeunePermis}
        options={[
          { valeur: false, label: "Classique · 0,5 g/L" },
          { valeur: true, label: "Jeune permis · 0,2 g/L" },
        ]}
        onChange={setJeunePermis}
      />

      <Choix
        label="As-tu mangé ?"
        hint="À jeun, l'alcool passe dans le sang en 30 minutes environ, contre une heure pendant un repas."
        valeur={aJeun}
        options={[
          { valeur: false, label: "Oui, pendant un repas" },
          { valeur: true, label: "Non, à jeun" },
        ]}
        onChange={setAJeun}
      />

      <div className="b-row">
        <button type="submit" className="btn btn--primary" disabled={enCours}>
          {enCours ? "Enregistrement…" : "Enregistrer"}
        </button>
        <p role="status" className="field__hint">
          {etat.message && !enCours && (
            <>
              {etat.message}{" "}
              <Link href="/" className="il">
                Voir ma soirée
              </Link>
            </>
          )}
        </p>
      </div>
    </form>
  );
}

/** Groupe de deux boutons, dont un seul est actif */
function Choix<T extends string | boolean>({
  label,
  hint,
  valeur,
  options,
  onChange,
}: {
  label: string;
  hint: string;
  valeur: T;
  options: { valeur: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const id = useId();
  return (
    <div className="field">
      <span className="field__label" id={`${id}-label`}>
        {label}
      </span>
      <div className="b-toggle" role="group" aria-labelledby={`${id}-label`} aria-describedby={`${id}-aide`}>
        {options.map((o) => (
          <button
            key={String(o.valeur)}
            type="button"
            aria-pressed={valeur === o.valeur}
            onClick={() => onChange(o.valeur)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p id={`${id}-aide`} className="field__hint">
        {hint}
      </p>
    </div>
  );
}
