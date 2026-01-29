export default function Footer() {
  return (
    <footer
      style={{
        background: "#1f2937",
        color: "#ffffff",
        padding: "30px 20px",
        textAlign: "center",
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>English Club</h3>

      <p style={{ margin: "5px 0" }}>
        Spoken English & Computer Training Institute
      </p>

      <p style={{ margin: "5px 0" }}>
        Classes running successfully since <strong>2010</strong>
      </p>

      <p style={{ margin: "5px 0" }}>
        📍 Nanda Nagar | Bapat Square | Aurobindo Hospital – Indore
      </p>

      <p style={{ margin: "10px 0" }}>
        📞 <a
          href="tel:9713014234"
          style={{ color: "#ffffff", textDecoration: "underline" }}
        >
          9713014234
        </a>
      </p>

      <p style={{ fontSize: "14px", marginTop: "15px", opacity: 0.8 }}>
        © {new Date().getFullYear()} English Club. All rights reserved.
      </p>
    </footer>
  );
}
