"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

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

  const isVideo = image?.media_type === "video";

  useEffect(() => {
    if (!image?.video_url?.includes("instagram.com")) return;

    const processInstagram = () => {
      (window as any).instgrm?.Embeds?.process();
    };

    const existingScript = document.querySelector(
      'script[src="https://www.instagram.com/embed.js"]'
    );

    if (existingScript) {
      processInstagram();
    } else {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = processInstagram;
      document.body.appendChild(script);
    }
  }, [isVideo, image?.video_url]);

  if (!image) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        Select an image
      </div>
    );
  }

  const instagramUrl =
    image?.video_url?.replace("/reels/", "/reel/") || "";

  const isSocialPortraitVideo =
    isVideo &&
    (
      // YouTube Shorts
      image.video_url?.includes("youtube.com/shorts/") ||

      // Facebook
      image.video_url?.includes("facebook.com/reel/") ||
      image.video_url?.includes("facebook.com/videos/") ||
      image.video_url?.includes("facebook.com/watch") ||

      // Instagram
      image.video_url?.includes("instagram.com/reel/") ||
      image.video_url?.includes("instagram.com/reels/") ||
      image.video_url?.includes("instagram.com/p/")
    );


  let imageUrl = "";

  if (!isVideo) {
    const { data } =
      supabase.storage
        .from("images")
        .getPublicUrl(image.file_path);

    imageUrl = data.publicUrl;
  }

  let videoUrl = "";

  if (isVideo) {
    const rawUrl = image.video_url || "";

    // YouTube
    // YouTube Shorts
    if (rawUrl.includes("youtube.com/shorts/")) {
      const videoId = rawUrl
        .split("youtube.com/shorts/")[1]
        ?.split("?")[0]
        ?.split("&")[0];

      videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    // YouTube normal video
    else if (rawUrl.includes("youtube.com/watch?v=")) {
      const videoId = rawUrl.split("v=")[1]?.split("&")[0];

      videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    // YouTube short/normal youtu.be link
    else if (rawUrl.includes("youtu.be/")) {
      const videoId = rawUrl
        .split("youtu.be/")[1]
        ?.split("?")[0]
        ?.split("&")[0];

      videoUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    // Instagram
    else if (rawUrl.includes("instagram.com")) {
      const cleanUrl = rawUrl.split("?")[0].replace(/\/$/, "");
      videoUrl = `${cleanUrl}/embed`;
    }

    // Facebook
    else if (
      rawUrl.includes("facebook.com/reel/") ||
      rawUrl.includes("facebook.com/videos/") ||
      rawUrl.includes("facebook.com/watch")
    ) {
      videoUrl =
        `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
          rawUrl
        )}&show_text=false&width=1000`;
    }

    // Other URL
    else {
      videoUrl = rawUrl;
    }
  }


  const isFirst = currentIndex === 0;
  const isLast = currentIndex === images.length - 1;

  // =========================================================
  // MOUSE WHEEL NAVIGATION
  // =========================================================

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (images.length <= 1) return;

    if (e.deltaY > 0) {
      // Mouse wheel down → Next
      if (!isLast) {
        onNext();
      }
    } else {
      // Mouse wheel up → Previous
      if (!isFirst) {
        onPrevious();
      }
    }
  };

  return (
    <div
      className="relative w-full h-full flex items-center justify-center bg-white"
      onWheel={handleWheel}
    >

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

      {/* IMAGE / VIDEO */}
      {isVideo ? (
        image.video_url?.includes("instagram.com") ? (
          <div className="h-full w-full flex items-center justify-center overflow-auto">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={instagramUrl}
              data-instgrm-version="14"
              style={{
                background: "#FFF",
                border: 0,
                borderRadius: 3,
                boxShadow:
                  "0 0 1px 0 rgba(0,0,0,0.5), 0 1px 10px 0 rgba(0,0,0,0.15)",
                margin: 1,
                maxWidth: "540px",
                minWidth: "326px",
                padding: 0,
                width: "calc(100% - 2px)",
              }}
            >
              <a
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                View this post on Instagram
              </a>
            </blockquote>
          </div>
        ) : (
          <iframe
            src={videoUrl}
            title={image.name || "Video"}
            className={
              isSocialPortraitVideo
                ? "h-full aspect-[9/16] max-w-full"
                : "w-full h-full"
            }
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        )
      ) : (
        <img
          src={imageUrl}
          alt={image.name || "Image"}
          className="max-w-full max-h-full object-contain"
        />
      )}

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