export default function GallerySection() {
  return (
    <section style={{ padding: "40px 20px", background: "#ffffff" }}>
      <h2 style={{ textAlign: "center" }}>Gallery</h2>
      <p style={{ textAlign: "center", marginBottom: "20px" }}>
        Classroom activities & institute moments
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "15px",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* Placeholder cards – Phase-1 */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            style={{
              height: "120px",
              background: "#e5e7eb",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              color: "#555",
            }}
          >
            Photo Coming Soon
          </div>
        ))}
      </div>
    </section>
  );
}
