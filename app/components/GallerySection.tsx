export default function GallerySection() {
  return (
    <section style={{ padding: "40px 0", background: "#ffffff" }}>
      <h2 style={{ textAlign: "center" }}>Gallery</h2>
      <p style={{ textAlign: "center", marginBottom: "20px", color: "#555" }}>
        Classroom activities & institute moments
      </p>

      {/* Center aligned container (same as reviews width) */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          overflow: "hidden",
          padding: "0 16px",
        }}
      >
        <div className="gallery-track">
          {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((item, index) => (
            <div className="gallery-item" key={index}>
              <img
                src={`/home/gallery-${item}.jpg`}
                alt={`English Club classroom activity ${item}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Server-safe CSS */}
      <style>{`
        .gallery-track {
          display: flex;
          gap: 16px;
          animation: scrollGallery 22s linear infinite;
          will-change: transform;
        }

        .gallery-item {
          min-width: 220px;
          height: 140px;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f4f6;
          flex-shrink: 0;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @keyframes scrollGallery {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        /* Mobile optimisation */
        @media (max-width: 768px) {
          .gallery-track {
            animation-duration: 10s;
          }
        }
      `}</style>
    </section>
  );
}
