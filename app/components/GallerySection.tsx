export default function GallerySection() {
  return (
    <section style={{ padding: "40px 0", background: "#ffffff" }}>
      <h2 style={{ textAlign: "center" }}>Gallery</h2>
      <p style={{ textAlign: "center", marginBottom: "20px", color: "#555" }}>
        Classroom activities & institute moments
      </p>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <div className="gallery-track">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div className="gallery-item" key={item}>
              <img
                src={`/home/gallery-${item}.jpg`}
                alt={`English Club classroom activity ${item}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* ===== COMMON ===== */
        .gallery-track {
          display: flex;
          gap: 16px;
        }

        .gallery-item {
          min-width: 220px;
          height: 140px;
          border-radius: 10px;
          overflow: hidden;
          background: #f3f4f6;
          flex-shrink: 0;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* ===== DESKTOP: AUTO MOVE ===== */
        @media (min-width: 769px) {
          .gallery-track {
            animation: scrollGallery 22s linear infinite;
            will-change: transform;
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

        /* ===== MOBILE: FACEBOOK STORIES STYLE ===== */
        @media (max-width: 768px) {
          .gallery-track {
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 10px;
          }

          .gallery-item {
            scroll-snap-align: start;
            min-width: 80%;
          }

          /* Hide scrollbar */
          .gallery-track::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
