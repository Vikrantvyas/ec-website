import ComputerGCoursesSection from "../components/ComputerGCoursesSection";
import Footer from "../components/Footer";

export const metadata = {
  title: "Computer-G Indore | Best Computer Courses in Nanda Nagar",
  description:
    "Computer-G Indore offers job-oriented computer courses like Basic Computer, Excel, Tally & CPCT at Nanda Nagar campus. Practical training since 2010.",
};

export default function ComputerGPage() {
  return (
    <>
      {/* ================= HERO ================= */}
      <section className="px-4 pt-16 pb-14 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-4">
          Computer-G Computer Training Institute
        </h1>

        <p className="text-gray-700 max-w-3xl mx-auto">
          Learn practical computer skills at <strong>Nanda Nagar, Indore</strong>.
          Job-oriented computer courses designed for students, job seekers
          and beginners — trusted since 2010.
        </p>
      </section>

   {/* ================= COURSES ================= */}
      <section className="bg-gray-50">
        <ComputerGCoursesSection />
      </section>

      {/* ================= WHY COMPUTER-G ================= */}
      <section className="px-4 py-14 bg-white">
        <h2 className="text-2xl font-bold text-center mb-10 text-blue-700">
          Why Choose Computer-G?
        </h2>

        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-4 text-center">
          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            💻
            <p className="font-semibold mt-2">Practical Lab Training</p>
            <p className="text-sm text-gray-600 mt-1">
              Learn by doing, not just theory
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            📄
            <p className="font-semibold mt-2">Office & Job Skills</p>
            <p className="text-sm text-gray-600 mt-1">
              Skills used in real offices
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            🧠
            <p className="font-semibold mt-2">Beginner Friendly</p>
            <p className="text-sm text-gray-600 mt-1">
              No prior computer knowledge required
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
            🎯
            <p className="font-semibold mt-2">Job Oriented Courses</p>
            <p className="text-sm text-gray-600 mt-1">
              Focus on employment & confidence
            </p>
          </div>
        </div>
      </section>

         {/* ================= TRUST STRIP ================= */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-6xl mx-auto grid gap-6 grid-cols-2 md:grid-cols-4 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-700">15+</p>
            <p className="text-sm text-gray-600">Years Experience</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-700">1000+</p>
            <p className="text-sm text-gray-600">Students Trained</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-700">500+</p>
            <p className="text-sm text-gray-600">Job Placements</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-blue-700">Since 2010</p>
            <p className="text-sm text-gray-600">Trusted Institute</p>
          </div>
        </div>
      </section>

      {/* ================= SINGLE CTA (FINAL) ================= */}
      <section className="px-4 py-14 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-semibold mb-3">
          Want to Join Computer Courses at Computer-G?
        </h2>

        <p className="text-blue-100 mb-6">
          Call or WhatsApp us to know fees, batches & demo classes.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="tel:9713014234"
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            📞 Call Now
          </a>

          <a
            href="https://wa.me/919713014234"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            💬 WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
