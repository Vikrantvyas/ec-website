import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spoken English Classes in Nanda Nagar Indore | English Club",
  description:
    "English Club offers spoken English and personality development classes in Nanda Nagar, Indore. Since 2010. Call 9713014234.",
};

export default function NandaNagarPage() {
  return (
    <main className="px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        Spoken English Classes in Nanda Nagar, Indore
      </h1>

      <p className="text-gray-700 mb-6">
        English Club is a trusted spoken English institute in Nanda Nagar,
        Indore, helping students improve communication skills, confidence,
        and fluency since 2010.
      </p>

      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-6">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar & Sentence Practice</li>
        <li>Interview Preparation</li>
        <li>Personality Development</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Visit Our Nanda Nagar Branch</h2>
      <p className="mb-4">
        📍 Nanda Nagar, Indore  
        <br />
        📞 <a href="tel:9713014234" className="text-blue-600">9713014234</a>
      </p>

      {/* Google Map */}
      <iframe
        src="https://www.google.com/maps?q=Nanda+Nagar+Indore&output=embed"
        width="100%"
        height="300"
        loading="lazy"
        className="rounded-lg"
      ></iframe>

      <div className="mt-6">
        <a
          href="https://wa.me/919713014234"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          WhatsApp Now
        </a>
      </div>
    </main>
  );
}
