import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SkipLinks } from "@/components/SkipLinks";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Pages d'information, lisibles sans être connecté */
export default function InfoLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SkipLinks navigation={false} />
      <header className="b-topbar">
        <div className="b-topbar__inner b-container">
          <Logo />
          <div className="b-topbar__actions">
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main id="contenu" tabIndex={-1} className="app-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
