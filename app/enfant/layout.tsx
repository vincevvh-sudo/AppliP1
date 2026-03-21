"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getEnfantSession } from "../../utils/enfant-session";
import { supabase } from "../../utils/supabase";
import { parseAvatarData } from "../components/AvatarCreator";
import { getAvatarFromStorage } from "../data/avatar-storage";

export default function EnfantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const session = getEnfantSession();
    if (!session) {
      if (pathname !== "/enfant") router.replace("/enfant");
      return;
    }
    if (pathname === "/enfant/avatar") {
      return;
    }
    (async () => {
      try {
        const { data } = await supabase
          .from("eleves")
          .select("avatar_json")
          .eq("id", session.id)
          .single();
        const parsed = parseAvatarData(data?.avatar_json ?? null);
        if (!parsed) {
          const stored = getAvatarFromStorage(session.id);
          if (!parseAvatarData(stored)) router.replace("/enfant/avatar");
        }
      } catch {
        const stored = getAvatarFromStorage(session.id);
        if (!parseAvatarData(stored)) router.replace("/enfant/avatar");
      }
    })();
  }, [pathname, router]);

  return <>{children}</>;
}
