import Link from "next/link";

export default function CoursesSection() {
  return (
    <section className="py-8 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-6">
        Courses We Offer
      </h2>

      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-2">

        {/* SPOKEN ENGLISH */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Spoken English
          </h3>

          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="font-medium">• Online English</li>
            <li className="ml-4 text-gray-600">
              – Live Zoom Classes
            </li>

            <li className="font-medium mt-3">
              • Offline English Classes
            </li>
            <li className="ml-4 text-gray-600">
              – Nanda Nagar
            </li>
            <li className="ml-4 text-gray-600">
              – Bapat Square
            </li>
          </ul>

          <div className="mt-5 flex gap-3 flex-wrap">
            <Link
              href="/online-english"
              className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium"
            >
              Online English
            </Link>

            <Link
              href="/nanda-nagar"
              className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 text-sm font-medium"
            >
              Offline English
            </Link>
          </div>
        </div>

        {/* COMPUTER COURSES */}
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Computer Courses
          </h3>

          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="font-medium">
              • Offline Computer Classes
            </li>
            <li className="ml-4 text-gray-600">
              – Nanda Nagar (Computer G)
            </li>
            <li className="ml-4 text-gray-600">
              – Aurobindo Hospital
            </li>
          </ul>

          <div className="mt-5 flex gap-3 flex-wrap">
            <Link
              href="/computer-g"
              className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium"
            >
              Computer G (Nanda Nagar)
            </Link>

            <Link
              href="/aurobindo-hospital"
              className="px-4 py-2 rounded-full border border-blue-600 text-blue-600 text-sm font-medium"
            >
              Aurobindo Branch
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
