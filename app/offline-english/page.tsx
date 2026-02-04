import Link from "next/link";

export const metadata = {
  title: "Spoken English Classes in Indore | Offline English | English Club",
  description:
    "Join Offline Spoken English classes at English Club Indore. Classroom training, daily speaking practice, and experienced trainers since 2010. Available at Nanda Nagar and Bapat Square.",
};

export default function OfflineEnglishPage() {
  return (
    <main className="bg-white">

      {/* HERO */}
      <section className="bg-gradient-to-br from-green-50 to-white px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Spoken English Classes (Offline)
        </h1>

        <p className="text-gray-600 max-w-xl mx-auto">
          Learn spoken English through classroom-based training with daily
          speaking practice and personal guidance at{" "}
          <strong>English Club Indore</strong>. Trusted since 2010.
        </p>

        <div className="flex justify-center gap-4 mt-6 flex-wrap">
          <a
            href="tel:9713014234"
            className="px-6 py-3 rounded-full bg-green-600 text-white font-medium"
          >
            Call Now
          </a>

          <a
            href="https://wa.me/919713014234"
            className="px-6 py-3 rounded-full border border-green-600 text-green-600 font-medium"
          >
            WhatsApp
          </a>
        </div>
      </section>

      {/* WHY OFFLINE */}
      <section className="px-4 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Why Choose Offline Spoken English?
        </h2>

        <ul className="space-y-3 text-gray-600">
          <li>✔ Face-to-face classroom interaction</li>
          <li>✔ Daily speaking practice with trainer</li>
          <li>✔ Immediate correction & feedback</li>
          <li>✔ Confidence building in real environment</li>
          <li>✔ Friendly for Hindi-medium students</li>
        </ul>
      </section>

      {/* WHAT YOU WILL LEARN */}
      <section className="bg-gray-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            What You Will Learn
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold text-gray-800">
                Grammar with Speaking
              </h3>
              <p className="text-sm text-gray-600">
                Learn grammar and use it in real conversations
              </p>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold text-gray-800">
                Daily Speaking Activities
              </h3>
              <p className="text-sm text-gray-600">
                Practice English every day in class
              </p>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold text-gray-800">
                Pronunciation & Fluency
              </h3>
              <p className="text-sm text-gray-600">
                Improve clarity and natural flow
              </p>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold text-gray-800">
                Confidence Building
              </h3>
              <p className="text-sm text-gray-600">
                Speak without fear or hesitation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AVAILABLE BRANCHES */}
      <section className="px-4 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Available at These Branches
        </h2>

        <div className="space-y-4">
          <Link
            href="/nanda-nagar"
            className="block border rounded-xl p-4 hover:bg-gray-50"
          >
            <p className="font-semibold text-gray-800">
              Nanda Nagar Branch
            </p>
            <p className="text-sm text-gray-600">
              Spoken English & Computer Courses
            </p>
          </Link>

          <Link
            href="/bapat-square"
            className="block border rounded-xl p-4 hover:bg-gray-50"
          >
            <p className="font-semibold text-gray-800">
              Bapat Square Branch
            </p>
            <p className="text-sm text-gray-600">
              Spoken English Classes
            </p>
          </Link>
        </div>
      </section>

      {/* OFFLINE VS ONLINE */}
      <section className="bg-gray-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Offline vs Online English
          </h2>

          <p className="text-gray-600 mb-4">
            If you prefer learning from home, you can also join our live
            online English classes.
          </p>

          <Link
            href="/online-english"
            className="inline-block px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium"
          >
            View Online English
          </Link>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-green-600 text-white text-center px-4 py-12">
        <h2 className="text-2xl font-bold mb-4">
          Join Offline Spoken English Classes
        </h2>

        <p className="mb-6">
          Visit your nearest English Club branch and start speaking
          confidently.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="tel:9713014234"
            className="px-6 py-3 rounded-full bg-white text-green-600 font-semibold"
          >
            Call Now
          </a>

          <a
            href="https://wa.me/919713014234"
            className="px-6 py-3 rounded-full border border-white font-semibold"
          >
            WhatsApp
          </a>
        </div>
      </section>

    </main>
  );
}
