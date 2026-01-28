export default function Home() {
  return (
    <main style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>

      {/* HERO SECTION */}
      <section style={{ padding: "60px 20px", textAlign: "center", background: "#f5f7fb" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>English Club</h1>
        <h2 style={{ fontSize: "22px", color: "#555" }}>
          Spoken English & Computer Training Institute
        </h2>

        <p style={{ marginTop: "20px", fontSize: "18px" }}>
          Classes running successfully since <strong>2010</strong> <br />
          Trusted training institute in <strong>Indore</strong>
        </p>

        <p style={{ marginTop: "10px", fontWeight: "bold" }}>
          3 Branches in Indore
        </p>
      </section>

      {/* ENGLISH COURSES */}
      <section style={{ padding: "40px 20px" }}>
        <h2>📘 English Courses</h2>
        <ul>
          <li>Online Classes</li>
          <li>Offline Classes</li>
          <li>Batches for Kids</li>
          <li>Batches for Women</li>
          <li>Batches for Working Professionals</li>
          <li>Interview Preparation</li>
          <li>Group Discussion (GD) Classes</li>
        </ul>
      </section>

      {/* COMPUTER COURSES */}
      <section style={{ padding: "40px 20px", background: "#f9f9f9" }}>
        <h2>💻 Computer Courses</h2>
        <ul>
          <li>Basic Computer</li>
          <li>Advanced Excel</li>
          <li>Tally ERP.9 & Tally Prime</li>
          <li>CPCT Preparation</li>
        </ul>
      </section>

      {/* DESIGNING COURSES */}
      <section style={{ padding: "40px 20px" }}>
        <h2>🎨 Designing Courses</h2>
        <ul>
          <li>Graphic Designing Basics</li>
          <li>Practical Designing Skills</li>
        </ul>
      </section>

      {/* WHY CHOOSE US */}
      <section style={{ padding: "40px 20px", background: "#eef2ff" }}>
        <h2>⭐ Why Choose English Club?</h2>
        <ul>
          <li>Classes running successfully since 2010</li>
          <li>English & Computer courses under one roof</li>
          <li>Practical and student-friendly teaching</li>
          <li>Separate batches for kids, women & professionals</li>
        </ul>
      </section>

      {/* BRANCHES */}
      <section style={{ padding: "40px 20px" }}>
        <h2>📍 Our Branches in Indore</h2>
        <ul>
          <li>Nanda Nagar</li>
          <li>Bapat Square</li>
          <li>Aurobindo Hospital Area</li>
        </ul>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "30px", textAlign: "center", background: "#222", color: "#fff" }}>
        <p><strong>English Club</strong></p>
        <p>Spoken English & Computer Training Institute</p>
        <p>Indore | Since 2010</p>
      </footer>

    </main>
  );
}
