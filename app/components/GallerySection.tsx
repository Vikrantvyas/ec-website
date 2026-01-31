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
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            style={{
              height: "120px",
              borderRadius: "6px",
              overflow: "hidden",
              background: "#f3f4f6",
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
    </section>
  );
}
