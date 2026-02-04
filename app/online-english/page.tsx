import Link from "next/link";

export const metadata = {
  title: "Learn Spoken English Online | English Club",
  description:
    "Join English Club's Online Spoken English classes. Live interactive sessions, Hindi-medium friendly teaching, daily speaking practice. Trusted since 2010.",
};

export default function OnlineEnglishPage() {
  return (
    <main className="bg-white">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-green-50 to-white px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Learn Spoken English Online
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Speak English confidently from your home with{" "}
          <strong>English Club Online</strong>. Live classes, daily speaking
          practice, and simple Hindi explanations. Trusted since 2010.
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <a
            href="https://wa.me/919713014234"
            className="px-6 py-3 rounded-full bg-green-600 text-white font-medium"
          >
            Join Demo Class
          </a>
          <a
            href="tel:9713014234"
            className="px-6 py-3 rounded-full border border-blue-600 text-blue-600 font-medium"
          >
            Call Now
          </a>
        </div>
      </section>

      {/* WHO IS THIS FOR */}
      <section className="px-4 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Who Is This Course For?
        </h2>

        <ul className="grid gap-3 sm:grid-cols-2 text-gray-600">
          <li>✔ School & college students</li>
          <li>✔ Job seekers & interview candidates</li>
          <li>✔ Housewives</li>
          <li>✔ Working professionals</li>
          <li>✔ Teachers preparing for English demos</li>
          <li>✔ Anyone afraid of speaking English</li>
        </ul>
      </section>

      {/* WHAT YOU WILL LEARN */}
      <section className="bg-gray-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            What You Will Learn
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-800">
                Daily Speaking Practice
              </h3>
              <p className="text-sm text-gray-600">
                Speak English daily in live classes
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-800">
                Grammar in Simple Hindi
              </h3>
              <p className="text-sm text-gray-600">
                Easy explanations without confusion
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-800">
                Pronunciation & Confidence
              </h3>
              <p className="text-sm text-gray-600">
                Correct sounds and clear speech
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-800">
                Vocabulary Building
              </h3>
              <p className="text-sm text-gray-600">
                Useful words for daily life
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW ONLINE CLASSES WORK */}
      <section className="px-4 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          How Online Classes Work
        </h2>

        <ol className="space-y-3 text-gray-600 list-decimal list-inside">
          <li>Live classes on Zoom / Google Meet</li>
          <li>Small batch size for better interaction</li>
          <li>Teacher-student speaking practice</li>
          <li>Study material provided</li>
          <li>Friendly environment for Hindi-medium students</li>
        </ol>
      </section>

      {/* COURSE DETAILS */}
      <section className="bg-gray-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Course Duration & Timings
          </h2>
          <p className="text-gray-600">
            Course duration is approximately <strong>3 months</strong>. Multiple
            time slots are available to suit students and working professionals.
          </p>
        </div>
      </section>

      {/* WHY ENGLISH CLUB */}
      <section className="px-4 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Why English Club Online?
        </h2>

        <ul className="space-y-3 text-gray-600">
          <li>✔ Teaching experience since 2010</li>
          <li>✔ Offline + online teaching expertise</li>
          <li>✔ Real teachers, not recorded videos</li>
          <li>✔ Focus on confidence & real speaking</li>
        </ul>
      </section>

      {/* FINAL CTA */}
      <section className="bg-green-600 text-white text-center px-4 py-12">
        <h2 className="text-2xl font-bold mb-4">
          Start Speaking English Confidently
        </h2>
        <p className="mb-6">
          Join English Club Online and improve your English from anywhere.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="https://wa.me/919713014234"
            className="px-6 py-3 rounded-full bg-white text-green-600 font-semibold"
          >
            Join Now
          </a>
          <a
            href="tel:9713014234"
            className="px-6 py-3 rounded-full border border-white font-semibold"
          >
            Call Now
          </a>
        </div>
      </section>

    </main>
  );
}
