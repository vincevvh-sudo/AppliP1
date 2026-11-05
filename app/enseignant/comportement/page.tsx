import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { ComportementFeuilles } from "../../components/ComportementFeuilles";

const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mon comportement",
};

export default function ComportementPage() {
  return <ComportementFeuilles fontClass={fredoka.className} />;
}
