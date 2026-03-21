import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AvatarData = {
  hairColor: number;
  hairCut: number;
  eyeShape: number;
  eyebrows: number;
  skinColor: number;
  nose: number;
  mouth: number;
  shirtColor: number;
};

export type EleveRow = {
  id: number;
  prenom: string;
  nom: string;
  code: string;
  created_at?: string;
  avatar_json?: string | null;
  avatar_can_change?: boolean | null;
  avatar_photo_url?: string | null;
};
