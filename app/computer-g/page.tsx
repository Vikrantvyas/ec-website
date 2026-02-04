import ComputerGCoursesSection from "../components/ComputerGCoursesSection";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

export const metadata = {
  title: "Computer-G Indore | Computer Courses at Nanda Nagar",
  description:
    "Computer-G offers Basic Computer, Advanced Excel, Tally with GST and CPCT preparation courses at Nanda Nagar, Indore.",
};

export default function ComputerGPage() {
  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-16 pb-12 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
          Computer-G Training Center
        </h1>

        <p className="text-gray-700 max-w-2xl mx-auto">
          Practical computer training with job-oriented syllabus.
          Classes running at Nanda Nagar campus since 2010.
        </p>
      </section>

      {/* COURSES + CURRICULUM SYSTEM */}
      <ComputerGCoursesSection />

      {/* CTA STRIP */}
      <section className="px-4 py-12 bg-blue-600 text-white text-center">
        <h2 className="text-2xl font-semibold mb-3">
          Ready to Start Your Computer Course?
        </h2>
        <p className="mb-6 text-blue-100">
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

      {/* CONTACT + FOOTER */}
      <ContactSection />
      <Footer />
    </>
  );
}
