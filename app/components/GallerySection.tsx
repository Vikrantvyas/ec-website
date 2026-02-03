"use client";

import { useState } from "react";

export default function GallerySection() {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section className="py-10 bg-white">
      <h2 className="text-center text-2xl font-bold mb-2">
        Gallery
      </h2>
      <p className="text-center text-gray-600 mb-6">
        Classroom activities & institute moments
      </p>

      <div className="max-w-5xl mx-auto px-4">
        <div className="gallery-track">
          {[1, 2, 3, 4, 5, 6].map((item) => {
            const imgSrc = `/home/gallery-${item}.jpg`;
            return (
              <div
                className="gallery-item"
                key={item}
                onClick={() => setActiveImage(imgSrc)}
              >
                <img
                  src={imgSrc}
                  alt={`English Club classroom activity ${item}`}
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== FULL VIEW MODAL ===== */}
      {activeImage && (
        <div
          className="gallery-modal"
          onClick={() => setActiveImage(null)}
        >
          <img src={activeImage} alt="Full view" />
          <span className="close-btn">✕</span>
        </div>
      )}

      <style>{`
        /* ===== COMMON ===== */
        .gallery-track {
          display: flex;
          gap: 16px;
        }

        .gallery-item {
          flex-shrink: 0;
          border-radius: 14px;
          overflow: hidden;
          background: #f3f4f6;
          cursor: pointer;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ===== DESKTOP (auto move) ===== */
        @media (min-width: 769px) {
          .gallery-track {
            animation: scrollGallery 22s linear infinite;
            will-change: transform;
          }

          .gallery-item {
            width: 240px;
            height: 150px;
          }

          @keyframes scrollGallery {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        }

        /* ===== MOBILE (reels / stories style) ===== */
        @media (max-width: 768px) {
          .gallery-track {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 10px;
          }

          .gallery-item {
            scroll-snap-align: start;
            width: 80%;
            height: 220px;
          }

          .gallery-track::-webkit-scrollbar {
            display: none;
          }
        }

        /* ===== FULL VIEW MODAL ===== */
        .gallery-modal {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .gallery-modal img {
          max-width: 90%;
          max-height: 90%;
          border-radius: 12px;
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 20px;
          color: #fff;
          font-size: 28px;
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}
