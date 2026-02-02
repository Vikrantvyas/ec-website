export default function GallerySection() {
  return (
    <section style={{ padding: "40px 0", background: "#ffffff" }}>
      <h2 style={{ textAlign: "center" }}>Gallery</h2>
      <p style={{ textAlign: "center", marginBottom: "20px", color: "#555" }}>
        Classroom activities & institute moments
      </p>

      <div
        style={{
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "16px",
            animation: "scrollGallery 30s linear infinite",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((item, index) => (
            <div
              key={index}
              style={{
                minWidth: "220px",
                height: "140px",
                borderRadius: "8px",
                overflow: "hidden",
                background: "#f3f4f6",
                flexShrink: 0,
              }}
            >
              <img
                src={`/home/gallery-${item}.jpg`}
                alt={`English Club classroom activity ${item}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Global animation (Server-safe) */}
      <style>{`
        @keyframes scrollGallery {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
