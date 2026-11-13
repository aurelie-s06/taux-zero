import type { MetadataRoute } from "next";

/** Application installable sur l'écran d'accueil (« Ajouter à l'écran d'accueil ») */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Taux Zéro",
    short_name: "Taux Zéro",
    description:
      "Estime ton taux d'alcool dans le sang et sache quand tu peux reprendre le volant.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f6",
    theme_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
