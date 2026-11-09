import Link from "next/link";

/**
 * Logo de Taux Zéro : un verre à pied dans un carré, avec un fond de boisson
 * dans la couleur « sous la limite ».
 * Les couleurs suivent le thème clair / sombre.
 */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" style={{ fill: "var(--ink)" }} />
      {/* coupe */}
      <path d="M10 7 H22 L20.8 14 A4.8 4.8 0 0 1 11.2 14 Z" style={{ fill: "var(--paper)" }} />
      {/* boisson */}
      <path
        d="M10.8 11.5 H21.2 L20.8 14 A4.8 4.8 0 0 1 11.2 14 Z"
        style={{ fill: "var(--in-mark)" }}
      />
      {/* pied */}
      <rect x="15.2" y="18.4" width="1.6" height="5.2" style={{ fill: "var(--paper)" }} />
      <rect x="11.5" y="23.2" width="9" height="1.8" rx="0.9" style={{ fill: "var(--paper)" }} />
    </svg>
  );
}

export function Logo({ href = "/", size = 28 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="b-logo">
      <LogoMark size={size} />
      <span>Taux Zéro</span>
    </Link>
  );
}
