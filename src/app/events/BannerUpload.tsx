"use client";
import { useRef, useState } from "react";

interface Props {
  current: string | null;
  onChange: (dataUrl: string | null) => void;
}

export default function BannerUpload({ current, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(current);
  const [error, setError] = useState("");

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image must be under 10 MB."); return; }
    setError("");

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX_W = 1200;
        const scale = img.width > MAX_W ? MAX_W / img.width : 1;
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        setPreview(dataUrl);
        onChange(dataUrl);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-40 rounded-xl overflow-hidden cursor-pointer bg-[#F8EACD] flex items-center justify-center border-2 border-dashed border-[#3758BF]/30 hover:border-[#3758BF] transition"
      >
        {preview ? (
          <>
            <img src={preview} alt="banner" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <span className="text-white font-semibold text-sm">Change Banner</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#3758BF]/60">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span className="text-sm font-medium">Click to upload event banner</span>
          </div>
        )}
      </div>
      {preview && (
        <button
          type="button"
          onClick={() => { setPreview(null); onChange(null); }}
          className="mt-1 text-xs text-slate-400 hover:text-red-500 transition"
        >
          Remove banner
        </button>
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
