import Link from "next/link";

export default function CoursesSection() {
  return (
    <section className="py-8 px-4 bg-gradient-to-b from-gray-50 to-white">
      <h2 className="text-2xl font-bold text-center mb-6">
        Courses We Offer
      </h2>

      <div className="max-w-4xl mx-auto space-y-4">

        {/* Spoken English Offline */}
        <div className="relative bg-white rounded-2xl border shadow-sm p-5 overflow-hidden">
          {/* Accent */}
          <span className="absolute left-0 top-0 h-full w-1.5 bg-green-600" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Spoken English (Offline)
              </p>
              <p className="text-sm text-gray-600">
                Classroom training with daily speaking practice
              </p>
            </div>

            <Link
              href="/offline-english"
              className="shrink-0 text-sm px-4 py-2 rounded-full bg-green-600 text-white font-medium"
            >
              View
            </Link>
          </div>
        </div>

        {/* Spoken English Online */}
        <div className="relative bg-white rounded-2xl border shadow-sm p-5 overflow-hidden">
          {/* Accent */}
          <span className="absolute left-0 top-0 h-full w-1.5 bg-blue-600" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Spoken English (Online)
              </p>
              <p className="text-sm text-gray-600">
                Live Zoom classes from the comfort of home
              </p>
            </div>

            <Link
              href="/online-english"
              className="shrink-0 text-sm px-4 py-2 rounded-full bg-blue-600 text-white font-medium"
            >
              View
            </Link>
          </div>
        </div>

        {/* Computer Courses */}
        <div className="relative bg-white rounded-2xl border shadow-sm p-5 overflow-hidden">
          {/* Accent */}
          <span className="absolute left-0 top-0 h-full w-1.5 bg-indigo-600" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-800">
                Computer Courses
              </p>
              <p className="text-sm text-gray-600">
                Practical computer training at Computer G
              </p>
            </div>

            <Link
              href="/computer-g"
              className="shrink-0 text-sm px-4 py-2 rounded-full bg-indigo-600 text-white font-medium"
            >
              View
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
