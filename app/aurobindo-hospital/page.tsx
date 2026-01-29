import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Spoken English Classes near Aurobindo Hospital Indore | English Club",
  description:
    "English Club offers spoken English classes near Aurobindo Hospital, Indore. Ideal for students, professionals and job-seekers. Since 2010. Call 9713014234.",
};

export default function AurobindoHospitalPage() {
  return (
    <main className="px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Spoken English Classes near Aurobindo Hospital, Indore
      </h1>

      <p className="text-gray-700 mb-6">
        English Club is a trusted spoken English institute near Aurobindo
        Hospital, Indore. Our practical and speaking-focused training helps
        students, job-seekers and working professionals improve their English
        fluency, confidence and communication skills. Classes running
        successfully since 2010.
      </p>

      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-6">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar with Daily Speaking Practice</li>
        <li>Interview & Job Preparation</li>
        <li>Personality Development</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Why Choose English Club near Aurobindo Hospital?
      </h2>
      <ul className="list-disc ml-6 mb-6">
        <li>Convenient location near hospital area</li>
        <li>Experienced and supportive trainers</li>
        <li>Small batches with personal attention</li>
        <li>Affordable course fees</li>
        <li>Trusted institute since 2010</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Visit Our Aurobindo Hospital Area Branch
      </h2>
      <p className="mb-4">
        📍 Near Aurobindo Hospital, Indore <br />
        📞{" "}
        <a href="tel:9713014234" className="text-blue-600 font-medium">
          9713014234
        </a>{" "}
        <br />
        💬 WhatsApp Available
      </p>

      {/* Google Map */}
      <iframe
        src="https://www.google.com/maps?q=Aurobindo+Hospital+Indore&output=embed"
        width="100%"
        height="300"
        loading="lazy"
        className="rounded-lg mb-6"
      ></iframe>

      {/* Call to Action */}
      <div className="flex gap-4">
        <a
          href="tel:9713014234"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-center"
        >
          Call Now
        </a>

        <a
          href="https://wa.me/919713014234"
          className="bg-green-600 text-white px-6 py-3 rounded-lg text-center"
        >
          WhatsApp Now
        </a>
      </div>
    </main>
  );
}
