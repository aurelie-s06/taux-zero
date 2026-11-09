import { NextResponse, type NextRequest } from "next/server";

/**
 * Vérification rapide avant chaque page : sans cookie de session,
 * inutile d'afficher l'application, on part directement à la connexion.
 * (La vraie vérification, en base, est faite dans chaque page et chaque action.)
 */
const PAGES_PUBLIQUES = ["/connexion", "/inscription"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const connecte = req.cookies.has("tz_session");

  if (!connecte && !PAGES_PUBLIQUES.includes(pathname)) {
    return NextResponse.redirect(new URL("/connexion", req.url));
  }
  return NextResponse.next();
}

export const config = {
  // Toutes les pages, sauf les fichiers de Next et les images
  matcher: ["/((?!_next/|favicon.ico|.*\\.(?:png|svg|ico|webmanifest)$).*)"],
};
