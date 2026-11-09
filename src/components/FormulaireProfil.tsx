"use client";

import { useId, useState, type FormEvent } from "react";
import Link from "next/link";
import { profilStockage } from "@/hooks/useProfil";
import { type Profil, type Sexe } from "@/lib/alcool";
import { erreurPoids, lirePoids } from "@/lib/profil";

interface Props {
  /** Profil déjà enregistré (null au premier remplissage) */
  initial: Profil | null;
}

export function FormulaireProfil({ initial }: Props) {
  const [sexe, setSexe] = useState<Sexe>(initial?.sexe ?? "femme");
  const [poids, setPoids] = useState(initial ? String(initial.poidsKg).replace(".", ",") : "");
  const [jeunePermis, setJeunePermis] = useState(initial?.jeunePermis ?? false);
  const [aJeun, setAJeun] = useState(initial?.aJeun ?? false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const id = useId();

  function enregistrer(e: FormEvent) {
    e.preventDefault();
    const poidsKg = lirePoids(poids);
    const probleme = erreurPoids(poidsKg);
    setErreur(probleme);
    if (probleme) {
      setMessage(null);
      document.getElementById(`${id}-poids`)?.focus();
      return;
    }
    profilStockage.ecrire({ sexe, poidsKg, jeunePermis, aJeun });
    setMessage("Profil enregistré.");
  }

  function effacer() {
    profilStockage.effacer();
    setSexe("femme");
    setPoids("");
    setJeunePermis(false);
    setAJeun(false);
    setErreur(null);
    setMessage("Profil effacé de ce navigateur.");
  }

  // Toute modification efface le message « enregistré »
  const modifier =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setMessage(null);
    };

  return (
    <form className="b-form" onSubmit={enregistrer} noValidate>
      <Choix
        label="Sexe"
        hint="Le corps d'une femme contient un peu moins d'eau : à poids égal, le taux monte plus haut."
        valeur={sexe}
        options={[
          { valeur: "femme", label: "Femme" },
          { valeur: "homme", label: "Homme" },
        ]}
        onChange={modifier(setSexe)}
      />

      <div className="field">
        <label className="field__label" htmlFor={`${id}-poids`}>
          Poids
        </label>
        <div className="field__suffix">
          <input
            id={`${id}-poids`}
            className="field__input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            required
            placeholder="ex. 62"
            value={poids}
            onChange={(e) => modifier(setPoids)(e.target.value)}
            aria-invalid={erreur ? true : undefined}
            aria-describedby={`${id}-poids-aide${erreur ? ` ${id}-poids-erreur` : ""}`}
          />
          <span aria-hidden="true">kg</span>
        </div>
        {erreur && (
          <p id={`${id}-poids-erreur`} className="field__error">
            {erreur}
          </p>
        )}
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
        onChange={modifier(setJeunePermis)}
      />

      <Choix
        label="As-tu mangé ?"
        hint="À jeun, l'alcool passe dans le sang en 30 minutes environ, contre une heure pendant un repas."
        valeur={aJeun}
        options={[
          { valeur: false, label: "Oui, pendant un repas" },
          { valeur: true, label: "Non, à jeun" },
        ]}
        onChange={modifier(setAJeun)}
      />

      <div className="b-row">
        <button type="submit" className="btn btn--primary">
          Enregistrer
        </button>
        {initial && (
          <button type="button" className="btn btn--ghost" onClick={effacer}>
            Effacer mon profil
          </button>
        )}
      </div>

      <p role="status" className="field__hint">
        {message && (
          <>
            {message}{" "}
            {message === "Profil enregistré." && (
              <Link href="/" className="il">
                Voir ma soirée
              </Link>
            )}
          </>
        )}
      </p>
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
