export default function CoursesSection() {
  return (
    <section style={{ padding: "40px 20px" }}>
      <h2 style={{ textAlign: "center" }}>Our Courses</h2>

      {/* English Courses */}
      <div style={{ marginTop: "30px" }}>
        <h3>English Courses</h3>
        <ul>
          <li>Online Classes</li>
          <li>Offline Classes</li>
          <li>Batches for Kids</li>
          <li>Batches for Women</li>
          <li>Batches for Working Professionals</li>
          <li>Interview Preparation</li>
          <li>Group Discussion (GD) Classes</li>
        </ul>
      </div>

      {/* Computer Courses */}
      <div style={{ marginTop: "30px" }}>
        <h3>Computer Courses</h3>
        <ul>
          <li>Basic Computer</li>
          <li>Advanced Excel</li>
          <li>Tally ERP.9 & Tally Prime</li>
          <li>CPCT Preparation</li>
        </ul>
      </div>

      {/* Designing Courses */}
      <div style={{ marginTop: "30px" }}>
        <h3>Designing Courses</h3>
        <ul>
          <li>Graphic Designing Basics</li>
        </ul>
      </div>
    </section>
  );
}
