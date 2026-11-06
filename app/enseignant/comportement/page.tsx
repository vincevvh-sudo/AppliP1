import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { ComportementFeuilles } from "../../components/ComportementFeuilles";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  title: "Mon comportement",
};

export default function ComportementPage() {
  return <ComportementFeuilles fontClass={fredoka.className} />;
}
