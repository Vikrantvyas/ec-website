export default function ContactSection() {
  return (
    <section
      style={{
        padding: "40px 20px",
        textAlign: "center",
        background: "#ffffff",
      }}
    >
      <h2>Contact Us</h2>
      <p>Call or WhatsApp us for enquiry & admission</p>

      <div style={{ marginTop: "20px" }}>
        <a
          href="tel:9713014234"
          style={{
            display: "inline-block",
            margin: "10px",
            padding: "12px 20px",
            background: "#0d6efd",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          📞 Call Now
        </a>

        <a
          href="https://wa.me/919713014234"
          target="_blank"
          style={{
            display: "inline-block",
            margin: "10px",
            padding: "12px 20px",
            background: "#25D366",
            color: "#fff",
            borderRadius: "6px",
            textDecoration: "none",
          }}
        >
          💬 WhatsApp
        </a>
      </div>
    </section>
  );
}
