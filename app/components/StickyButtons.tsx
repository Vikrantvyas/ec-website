"use client";

export default function StickyButtons() {
  return (
    <>
      {/* Call Button */}
      <a
        href="tel:9713014234"
        style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          background: "#0d6efd",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "50px",
          textDecoration: "none",
          fontSize: "16px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          zIndex: 1000,
        }}
      >
        📞 Call
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919713014234"
        target="_blank"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#25D366",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: "50px",
          textDecoration: "none",
          fontSize: "16px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          zIndex: 1000,
        }}
      >
        💬 WhatsApp
      </a>
    </>
  );
}
