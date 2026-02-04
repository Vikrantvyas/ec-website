import Link from "next/link";

export default function CoursesSection() {
  return (
    <section className="py-8 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-6">
        Courses We Offer
      </h2>

      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">

        {/* Spoken English Offline */}
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Spoken English (Offline)
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Classroom-based spoken English training at our Indore branches
          </p>

          <button
            disabled
            className="px-4 py-2 rounded-full bg-gray-300 text-gray-600 text-sm cursor-not-allowed"
          >
            View
          </button>
        </div>

        {/* Spoken English Online */}
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Spoken English (Online)
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Live Zoom classes with daily speaking practice
          </p>

          <Link
            href="/online-english"
            className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium"
          >
            View
          </Link>
        </div>

        {/* Computer Courses */}
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Computer Courses
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            Practical computer training at Computer G
          </p>

          <Link
            href="/computer-g"
            className="inline-block px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium"
          >
            View
          </Link>
        </div>

      </div>
    </section>
  );
}
