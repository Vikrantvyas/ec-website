import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spoken English Classes in Bapat Square Indore | English Club",
  description:
    "English Club offers spoken English classes in Bapat Square, Indore. Improve fluency, confidence and communication skills. Since 2010. Call 9713014234.",
};

export default function BapatSquarePage() {
  return (
    <main className="px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Spoken English Classes in Bapat Square, Indore
      </h1>

      <p className="text-gray-700 mb-6">
        English Club is a trusted spoken English institute near Bapat Square,
        Indore. We help students, job-seekers, teachers and working professionals
        speak English confidently through daily speaking practice and practical
        training. Classes running successfully since 2010.
      </p>

      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-6">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar with Speaking Practice</li>
        <li>Interview & Job Preparation</li>
        <li>Personality Development</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Why Choose English Club – Bapat Square?
      </h2>
      <ul className="list-disc ml-6 mb-6">
        <li>Experienced and supportive trainers</li>
        <li>Daily speaking & confidence-building activities</li>
        <li>Small batches with personal attention</li>
        <li>Affordable fees</li>
        <li>Trusted institute since 2010</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Visit Our Bapat Square Branch
      </h2>
      <p className="mb-4">
        📍 Near Bapat Square, Indore <br />
        📞{" "}
        <a href="tel:9713014234" className="text-blue-600 font-medium">
          9713014234
        </a>{" "}
        <br />
        💬 WhatsApp Available
      </p>

      <iframe
        src="https://www.google.com/maps?q=Bapat+Square+Indore&output=embed"
        width="100%"
        height="300"
        loading="lazy"
        className="rounded-lg mb-6"
      />

      <div className="flex gap-4">
        <a
          href="tel:9713014234"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Call Now
        </a>
        <a
          href="https://wa.me/919713014234"
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          WhatsApp Now
        </a>
      </div>
    </main>
  );
}
