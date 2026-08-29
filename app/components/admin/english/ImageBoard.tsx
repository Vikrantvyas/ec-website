"use client";

import { supabase } from "@/lib/supabaseClient";

interface ImageBoardProps {
  images: any[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function ImageBoard({
  images,
  currentIndex,
  onPrevious,
  onNext
}: ImageBoardProps) {

  const image = images?.[currentIndex];

  if (!image) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Select an image
      </div>
    );
  }

  const { data } =
    supabase.storage
      .from("images")
      .getPublicUrl(image.file_path);

  const imageUrl = data.publicUrl;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === images.length - 1;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-white">

      {/* PREVIOUS */}
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className="absolute left-3 bottom-3 z-10
           w-10 h-10 rounded-full bg-black/50 text-white
           text-2xl flex items-center justify-center
           hover:bg-black/70 disabled:opacity-20
           disabled:cursor-not-allowed"
      >
        ←
      </button>

      {/* IMAGE */}
      <img
        src={imageUrl}
        alt={image.name || "Image"}
        className="max-w-full max-h-full object-contain"
      />

      {/* NEXT */}
      <button
        type="button"
        onClick={onNext}
        disabled={isLast}
        className="absolute right-3 bottom-3 z-10
           w-10 h-10 rounded-full bg-black/50 text-white
           text-2xl flex items-center justify-center
           hover:bg-black/70 disabled:opacity-20
           disabled:cursor-not-allowed"
      >
        →
      </button>

    </div>
  );
}