"use client";

import { useState } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  basePath?: string;
};

export default function GallerySection({
  title = "Gallery",
  subtitle = "Classroom activities & institute moments",
  basePath = "/home",
}: Props) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section className="py-10 bg-white">
      <h2 className="text-center text-2xl font-bold mb-2">
        {title}
      </h2>
      <p className="text-center text-gray-600 mb-6">
        {subtitle}
      </p>

      <div className="max-w-5xl mx-auto px-4">
        <div className="gallery-track">
          {[1, 2, 3, 4, 5, 6].map((item) => {
            const imgSrc = `${basePath}/gallery-${item}.jpg`;
            return (
              <div
                className="gallery-item"
                key={item}
                onClick={() => setActiveImage(imgSrc)}
              >
                <img
                  src={imgSrc}
                  alt={`${title} image ${item}`}
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      </div>

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

        @media (min-width: 769px) {
          .gallery-track {
            animation: scrollGallery 22s linear infinite;
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
