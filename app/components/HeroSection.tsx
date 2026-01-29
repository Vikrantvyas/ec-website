"use client";

import { instituteData } from "../data/institute";

export default function HeroSection() {
  return (
    <section style={{ textAlign: "center", padding: "40px 20px" }}>
      <h1>{instituteData.name}</h1>
      <p>{instituteData.tagline}</p>
      <p>
        Classes running successfully since <strong>{instituteData.since}</strong><br/>
        Trusted institute in <strong>{instituteData.city}</strong><br/>
        <strong>3 Branches</strong> in the city
      </p>

      <div style={{ marginTop: "20px" }}>
        <a href={`tel:${instituteData.phone}`}>📞 Call Now</a>{" "}
        |{" "}
        <a
          href={`https://wa.me/91${instituteData.whatsapp}`}
          target="_blank"
        >
          💬 WhatsApp
        </a>
      </div>
    </section>
  );
}
