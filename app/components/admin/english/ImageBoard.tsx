"use client";

import { supabase } from "@/lib/supabaseClient";

interface ImageBoardProps {
  image: any;
}

export default function ImageBoard({
  image
}: ImageBoardProps) {

  if (!image) {
    return null;
  }

  const { data } =
    supabase.storage
      .from("images")
      .getPublicUrl(image.file_path);

  const imageUrl = data.publicUrl;

  return (
    <div className="w-full h-full flex items-center justify-center bg-white">

      <img
        src={imageUrl}
        alt={image.name || "Image"}
        className="max-w-full max-h-full object-contain"
      />

    </div>
  );
}