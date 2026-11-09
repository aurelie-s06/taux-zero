"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { CLE_THEME } from "@/lib/theme";

type Theme = "light" | "dark";

// Le thème est porté par <html data-theme="…"> (posé avant l'affichage, voir layout)
function lireTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function abonner(f: () => void) {
  const obs = new MutationObserver(f);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(abonner, lireTheme, () => "light" as Theme);
  const isDark = theme === "dark";

  const basculer = () => {
    const suivant: Theme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = suivant;
    try {
      localStorage.setItem(CLE_THEME, suivant);
    } catch {
      /* stockage bloqué */
    }
  };

  const libelle = isDark ? "Passer au thème clair" : "Passer au thème sombre";
  return (
    <button type="button" className="iconbtn" onClick={basculer} aria-label={libelle} title={libelle}>
      <Sun size={16} className={`themetoggle__icon ${isDark ? "themetoggle__icon--on" : ""}`} />
      <Moon size={16} className={`themetoggle__icon ${isDark ? "" : "themetoggle__icon--on"}`} />
    </button>
  );
}
