export default function MapSection() {
  return (
    <section style={{ padding: "40px 20px", background: "#f5f7fb" }}>
      <h2 style={{ textAlign: "center" }}>Find Us on Google Map</h2>
      <p style={{ textAlign: "center" }}>
        Visit any of our branches in Indore
      </p>

      <div
        style={{
          maxWidth: "800px",
          margin: "30px auto",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <iframe
          src="https://www.google.com/maps?q=English%20Club%20Indore&output=embed"
          width="100%"
          height="350"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      <ul style={{ textAlign: "center", lineHeight: "1.8" }}>
        <li>📍 Nanda Nagar</li>
        <li>📍 Bapat Square</li>
        <li>📍 Near Aurobindo Hospital</li>
      </ul>
    </section>
  );
}
