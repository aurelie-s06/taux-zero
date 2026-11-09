"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRound, Wine } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export const liens = [
  { href: "/", label: "Ma soirée", icon: Wine },
  { href: "/profil", label: "Profil", icon: UserRound },
];

const estActif = (chemin: string, href: string) =>
  href === "/" ? chemin === "/" : chemin.startsWith(href);

/**
 * Une seule barre, collée en haut : logo, liens en pastilles et thème.
 */
export function MainNav() {
  const chemin = usePathname();

  return (
    <header className="b-topbar">
      <div className="b-topbar__inner b-container">
        <Logo />

        <nav id="navigation" tabIndex={-1} className="b-topnav" aria-label="Navigation principale">
          {liens.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="b-topnav__item"
              aria-current={estActif(chemin, href) ? "page" : undefined}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="b-topbar__actions">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
