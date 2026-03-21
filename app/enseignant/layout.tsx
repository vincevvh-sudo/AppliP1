import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DEFAULT_SESSION_TOKEN = "enseignant-session-dev";

function getSessionToken(): string {
  return (process.env.ENSEIGNANT_SESSION_TOKEN ?? DEFAULT_SESSION_TOKEN).trim();
}

export default async function EnseignantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("enseignant_ok");
  const expected = getSessionToken();

  if (!cookie || cookie.value !== expected) {
    redirect("/code-enseignant");
  }

  return <>{children}</>;
}
