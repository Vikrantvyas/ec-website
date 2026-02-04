import Link from "next/link";

export const metadata = {
  title: "Computer Training Institute in Indore | Computer G",
  description:
    "Computer G is a computer training institute in Indore offering Basic Computer, Tally, MS Office, Graphic Design and AI basics. Practical training since 2010.",
};

export default function ComputerGPage() {
  return (
    <main className="bg-white">

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-blue-50 to-white px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Computer Training Institute in Indore
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Learn practical computer skills at <strong>Computer G</strong> –
          the computer training division of English Club. Trusted since 2010.
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <a
            href="tel:9713014234"
            className="px-6 py-3 rounded-full bg-blue-600 text-white font-medium"
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

      {/* ABOUT */}
      <section className="px-4 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          About Computer G
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Computer G is a dedicated computer training institute located at
          Nanda Nagar, Indore. We focus on hands-on, practical learning for
          students, job seekers, and beginners who want real computer skills
          for work and daily use.
        </p>
      </section>

      {/* COURSES */}
      <section className="bg-gray-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Computer Courses Offered
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="border rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-800">
                Basic Computer Course
              </h3>
              <p className="text-sm text-gray-600">
                Windows, Internet, MS Office
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-800">
                Tally with GST
              </h3>
              <p className="text-sm text-gray-600">
                Accounting & billing basics
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-800">
                Graphic Design (Basic)
              </h3>
              <p className="text-sm text-gray-600">
                Design fundamentals & tools
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-800">
                AI & Computer Basics
              </h3>
              <p className="text-sm text-gray-600">
                Introduction to modern tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="px-4 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Why Choose Computer G?
        </h2>

        <ul className="space-y-3 text-gray-600">
          <li>✔ Practical, hands-on computer training</li>
          <li>✔ Individual attention to students</li>
          <li>✔ Job-oriented learning approach</li>
          <li>✔ Experienced trainers</li>
          <li>✔ Training institute since 2010</li>
        </ul>
      </section>

      {/* BATCH TIMINGS */}
      <section className="bg-gray-50 px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Batch Timings
          </h2>
          <p className="text-gray-600">
            Morning and evening batches available. Flexible timings for
            students and working professionals.
          </p>
        </div>
      </section>

      {/* LOCATION */}
      <section className="px-4 py-10 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Our Location
        </h2>
        <p className="text-gray-600 mb-4">
          Nanda Nagar, Indore (Same campus as English Club)
        </p>

        <a
          href="https://www.google.com/maps"
          target="_blank"
          className="inline-block px-6 py-3 rounded-full bg-blue-600 text-white font-medium"
        >
          Get Directions
        </a>
      </section>

      {/* FINAL CTA */}
      <section className="bg-blue-600 text-white text-center px-4 py-12">
        <h2 className="text-2xl font-bold mb-4">
          Join Computer G Today
        </h2>
        <p className="mb-6">
          Learn practical computer skills and grow your career.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="tel:9713014234"
            className="px-6 py-3 rounded-full bg-white text-blue-600 font-semibold"
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
