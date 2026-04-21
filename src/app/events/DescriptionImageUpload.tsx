"use client";
import { useRef, useState } from "react";

interface Props {
  images: string[];
  onChange: (images: string[]) => void;
}

const MAX_IMAGES = 5;

export default function DescriptionImageUpload({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setError("");

    const remaining = MAX_IMAGES - images.length;
    const toProcess = files.slice(0, remaining);
    if (files.length > remaining) setError(`Only ${remaining} more image(s) can be added (max ${MAX_IMAGES}).`);

    let processed = 0;
    const newImages: string[] = [];

    toProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) { processed++; if (processed === toProcess.length) onChange([...images, ...newImages]); return; }
      if (file.size > 10 * 1024 * 1024) { processed++; if (processed === toProcess.length) onChange([...images, ...newImages]); return; }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX_W = 1000;
          const scale = img.width > MAX_W ? MAX_W / img.width : 1;
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
          newImages.push(canvas.toDataURL("image/jpeg", 0.82));
          processed++;
          if (processed === toProcess.length) onChange([...images, ...newImages]);
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {images.map((src, i) => (
          <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0">
            <img src={src} alt={`image ${i + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-[#3758BF]/30 hover:border-[#3758BF] bg-[#F8EACD] flex flex-col items-center justify-center text-[#3758BF]/60 hover:text-[#3758BF] transition shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-xs mt-1">Add image</span>
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
    </div>
  );
}
