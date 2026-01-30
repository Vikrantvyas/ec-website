import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spoken English Classes in Nanda Nagar Indore | English Club",
  description:
    "English Club offers spoken English and personality development classes in Nanda Nagar, Indore. Exact location, daily speaking practice, and experienced trainers. Since 2010. Call 9713014234.",
};

export default function NandaNagarPage() {
  return (
    <main className="px-4 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Spoken English Classes in Nanda Nagar, Indore
      </h1>

      <p className="text-gray-700 mb-6">
        English Club is a trusted spoken English institute located in
        Nanda Nagar, Indore. We help students, job-seekers, and professionals
        improve their English fluency, confidence, and communication skills
        through practical training and daily speaking practice. Serving
        students since 2010.
      </p>

      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-6 text-gray-700">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar & Sentence Practice</li>
        <li>Interview & Job Preparation</li>
        <li>Personality Development</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Visit Our Nanda Nagar Branch
      </h2>
      <p className="mb-4 text-gray-700">
        📍 Nanda Nagar, Indore  
        <br />
        📞{" "}
        <a href="tel:9713014234" className="text-blue-600 font-medium">
          9713014234
        </a>
      </p>

      {/* Fixed Branch Location Map */}
      <iframe
        src="https://www.google.com/maps?q=English+Club+Nanda+Nagar+Indore&output=embed"
        width="100%"
        height="320"
        loading="lazy"
        className="rounded-xl mb-4"
      ></iframe>

      <a
        href="https://www.google.com/maps/dir/?api=1&destination=English+Club+Nanda+Nagar+Indore"
        target="_blank"
        className="inline-block mb-6 bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        📍 Get Directions from your location
      </a>

      <div className="flex gap-4">
        <a
          href="tel:9713014234"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Call Now
        </a>
        <a
          href="https://wa.me/919713014234"
          className="bg-green-600 text-white px-6 py-3 rounded-xl"
        >
          WhatsApp Now
        </a>
      </div>
    </main>
  );
}
