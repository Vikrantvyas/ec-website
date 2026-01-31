import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Spoken English Classes near Aurobindo Hospital Indore | English Club",
  description:
    "English Club offers spoken English classes near Aurobindo Hospital, Indore. Exact location, daily speaking practice and experienced trainers. Since 2010. Call 9713014234.",
};

export default function AurobindoHospitalPage() {
  return (
    <main className="px-4 py-10 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Spoken English Classes near Aurobindo Hospital, Indore
      </h1>

      <p className="text-gray-700 mb-6">
        English Club is a trusted spoken English institute located near
        Aurobindo Hospital, Indore. Our practical and speaking-focused
        training helps students and professionals improve fluency,
        confidence and communication skills. Serving learners since 2010.
      </p>

      <h2 className="text-xl font-semibold mb-2">Courses Offered</h2>
      <ul className="list-disc ml-6 mb-6 text-gray-700">
        <li>Spoken English (Beginner to Advanced)</li>
        <li>Grammar with Daily Speaking Practice</li>
        <li>Interview & Job Preparation</li>
        <li>Personality Development</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">
        Visit Our Aurobindo Hospital Area Branch
      </h2>
      <p className="mb-4 text-gray-700">
        📍 Near Aurobindo Hospital, Indore
        <br />
        📞{" "}
        <a href="tel:9713014234" className="text-blue-600 font-medium">
          9713014234
        </a>
      </p>

      {/* Fixed Branch Location Map */}
      <iframe
        src="https://www.google.com/maps?q=English+Club+near+Aurobindo+Hospital+Indore&output=embed"
        width="100%"
        height="320"
        loading="lazy"
        className="rounded-xl mb-4"
      ></iframe>

      <a
        href="https://www.google.com/maps/dir/?api=1&destination=English+Club+near+Aurobindo+Hospital+Indore"
        target="_blank"
        className="inline-block mb-10 bg-blue-600 text-white px-6 py-3 rounded-xl"
      >
        📍 Get Directions from your location
      </a>

      {/* ⭐ STUDENT REVIEWS – AUROBINDO HOSPITAL */}
      <section className="py-10">
        <h2 className="text-xl font-bold text-center mb-6">
          What Students Say – Aurobindo Hospital Area
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Review 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/aurobindo-hospital/review-1.jpg"
                alt="Pankaj - Aurobindo Hospital"
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">Pankaj</p>
                <p className="text-sm text-gray-500">
                  Aurobindo Hospital Branch
                </p>
              </div>
            </div>

            <p className="text-yellow-500 text-sm mb-2">⭐⭐⭐⭐⭐</p>

            <p className="text-gray-700 text-sm leading-relaxed">
              Spoken English ke liye best institute hai. Daily speaking
              practice se confidence kaafi improve hua.
            </p>
          </div>

          {/* Review 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/aurobindo-hospital/review-2.jpg"
                alt="Sunita - Aurobindo Hospital"
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">Sunita</p>
                <p className="text-sm text-gray-500">
                  Aurobindo Hospital Branch
                </p>
              </div>
            </div>

            <p className="text-yellow-500 text-sm mb-2">⭐⭐⭐⭐⭐</p>

            <p className="text-gray-700 text-sm leading-relaxed">
              Teachers bahut patient aur supportive hain. Beginners ke
              liye perfect jagah.
            </p>
          </div>

          {/* Review 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <img
                src="/aurobindo-hospital/review-3.jpg"
                alt="Rahul - Aurobindo Hospital"
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-800">Rahul</p>
                <p className="text-sm text-gray-500">
                  Aurobindo Hospital Branch
                </p>
              </div>
            </div>

            <p className="text-yellow-500 text-sm mb-2">⭐⭐⭐⭐⭐</p>

            <p className="text-gray-700 text-sm leading-relaxed">
              Interview preparation ke liye join kiya tha. Kaafi help
              mili. Highly recommended.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Buttons */}
      <div className="flex gap-4 mt-6">
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
