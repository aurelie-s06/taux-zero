import type { Metadata } from "next";
import { PageProfil } from "@/components/PageProfil";

export const metadata: Metadata = {
  title: "Mon profil",
};

export default function Profil() {
  return <PageProfil />;
}
