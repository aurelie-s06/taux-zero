import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export const metadata: Metadata = { title: "Page introuvable" };

export default function PageIntrouvable() {
  return (
    <main id="contenu" className="app-main">
      <div className="empty">
        <LogoMark size={44} />
        <h1>Page introuvable</h1>
        <p>Cette adresse ne mène nulle part. Elle a peut-être été mal tapée.</p>
        <Link href="/" className="btn btn--primary">
          Retour à ma soirée
        </Link>
      </div>
    </main>
  );
}
