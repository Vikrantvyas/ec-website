import Link from "next/link";

export default function CoursesSection() {
  return (
    <section className="py-6 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-4">
        Courses We Offer
      </h2>

      <div className="max-w-4xl mx-auto space-y-3">

        {/* Spoken English Offline */}
        <div className="flex items-center justify-between gap-4 bg-white border rounded-xl p-4">
          <div>
            <p className="text-base font-semibold text-gray-800">
              Spoken English (Offline)
            </p>
            <p className="text-sm text-gray-600">
              Classroom training at Indore branches
            </p>
          </div>

          <Link
            href="/offline-english"
            className="text-sm px-3 py-1.5 rounded-full bg-blue-600 text-white font-medium"
          >
            View
          </Link>
        </div>

        {/* Spoken English Online */}
        <div className="flex items-center justify-between gap-4 bg-white border rounded-xl p-4">
          <div>
            <p className="text-base font-semibold text-gray-800">
              Spoken English (Online)
            </p>
            <p className="text-sm text-gray-600">
              Live Zoom classes from home
            </p>
          </div>

          <Link
            href="/online-english"
            className="text-sm px-3 py-1.5 rounded-full bg-blue-600 text-white font-medium"
          >
            View
          </Link>
        </div>

        {/* Computer Courses */}
        <div className="flex items-center justify-between gap-4 bg-white border rounded-xl p-4">
          <div>
            <p className="text-base font-semibold text-gray-800">
              Computer Courses
            </p>
            <p className="text-sm text-gray-600">
              Practical training at Computer G
            </p>
          </div>

          <Link
            href="/computer-g"
            className="text-sm px-3 py-1.5 rounded-full bg-blue-600 text-white font-medium"
          >
            View
          </Link>
        </div>

      </div>
    </section>
  );
}
