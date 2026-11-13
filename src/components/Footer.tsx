import Link from "next/link";

export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`b-footer ${compact ? "b-footer--compact" : ""}`}>
      Taux Zéro · © Aurélie Sirot · Résultats indicatifs, qui ne remplacent pas un éthylotest.
      Dans le doute, ne prends pas le volant. ·{" "}
      <Link href="/confidentialite" className="il">
        Confidentialité
      </Link>
    </footer>
  );
}
