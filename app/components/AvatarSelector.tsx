"use client";

import { useRef, useState } from "react";
import { AvatarBust } from "./AvatarCreator";
import { getAvatarPhotoFromStorage, setAvatarPhotoInStorage } from "../data/avatar-storage";
import { supabase } from "../../utils/supabase";
import type { AvatarData } from "../../utils/supabase";

const BUCKET = "avatars";
const MAX_SIZE_KB = 500;

type Props = {
  eleveId: number | string;
  avatarData: AvatarData | null;
  photoUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  onPersist?: (url: string | null) => Promise<void>;
  canChange?: boolean;
  size?: number;
  className?: string;
};

export default function AvatarSelector({
  eleveId,
  avatarData,
  photoUrl,
  onPhotoChange,
  onPersist,
  canChange = false,
  size = 80,
  className = "",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handlePhotoInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canChange) return;
    if (file.size > MAX_SIZE_KB * 1024) {
      alert(`Photo trop grande. Maximum ${MAX_SIZE_KB} Ko.`);
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${String(eleveId)}-${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);
      const url = urlData.publicUrl;
      onPhotoChange(url);
      setAvatarPhotoInStorage(eleveId, url);
      await onPersist?.(url);
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onPhotoChange(dataUrl);
        setAvatarPhotoInStorage(eleveId, dataUrl);
        onPersist?.(dataUrl);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      setShowModal(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleUseAvatar = () => {
    onPhotoChange(null);
    setAvatarPhotoInStorage(eleveId, null);
    onPersist?.(null);
    setShowModal(false);
  };

  const displayPhotoUrl = photoUrl ?? getAvatarPhotoFromStorage(eleveId);

  return (
    <>
      <button
        type="button"
        onClick={() => canChange && setShowModal(true)}
        className={`block shrink-0 rounded-full transition hover:ring-4 hover:ring-[#4a7c5a]/30 focus:outline-none focus:ring-4 focus:ring-[#4a7c5a]/50 ${!canChange ? "cursor-default" : "cursor-pointer"} ${className}`}
        title={canChange ? "Modifier mon avatar" : undefined}
      >
        <AvatarBust data={avatarData} photoUrl={displayPhotoUrl} size={size} />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d4a3e]/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-[#2d4a3e]">Mon image</h3>
            <p className="mt-1 text-sm text-[#2d4a3e]/75">Choisis comment tu veux t&apos;afficher</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#a8d5ba] py-3 font-semibold text-[#2d4a3e] transition hover:bg-[#8bc5a0] disabled:opacity-50"
              >
                {uploading ? "Chargement…" : "📷 Insérer ma photo"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoInput}
              />
              <button
                type="button"
                onClick={handleUseAvatar}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#2d4a3e]/20 py-3 font-semibold text-[#2d4a3e] transition hover:bg-[#f0f0f0]"
              >
                👤 Mon avatar
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="mt-4 w-full rounded-xl py-2 text-sm text-[#2d4a3e]/70 hover:text-[#2d4a3e]"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}
