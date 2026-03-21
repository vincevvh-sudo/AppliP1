import { redirect } from "next/navigation";

/** Ancienne URL — redirige vers /evaluation/parler */
export default function SavoirParlerRedirectPage() {
  redirect("/enseignant/sons/evaluation/parler");
}
