export const metadata = {
  title: "English Club Nanda Nagar | Spoken English & Computer Institute",
  description:
    "English Club Nanda Nagar offers Spoken English, Computer Courses, Tally & CPCT coaching. Trusted institute in Indore since 2010.",
};

export default function NandaNagarPage() {
  return (
    <main style={{ padding: "40px 20px" }}>
      <h1>English Club – Nanda Nagar</h1>
      <p>
        Spoken English & Computer Training Institute<br />
        Classes running successfully since <strong>2010</strong>
      </p>

      <h2>Courses Available</h2>
      <ul>
        <li>Spoken English (Online & Offline)</li>
        <li>Computer Courses</li>
        <li>Advanced Excel</li>
        <li>Tally & CPCT Preparation</li>
      </ul>

      <p>
        📞 Call / WhatsApp:
        <a href="tel:9713014234"> 9713014234</a>
      </p>

      <h3>Location</h3>
      <iframe
        src="https://www.google.com/maps?q=English%20Club%20Nanda%20Nagar%20Indore&output=embed"
        width="100%"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
      ></iframe>
    </main>
  );
}
