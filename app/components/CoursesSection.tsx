export default function CoursesSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
        Courses We Offer
      </h2>

      <div className="max-w-6xl mx-auto grid gap-8 md:grid-cols-3">
        {/* Spoken English */}
        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-4">
            Spoken English
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Basic to Advanced Levels</li>
            <li>• Grammar with Speaking Practice</li>
            <li>• Interview & Job Preparation</li>
            <li>• Personality & Confidence Building</li>
          </ul>
        </div>

        {/* Computer Courses */}
        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-4">
            Computer Courses
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Basic Computer Course</li>
            <li>• Advanced Excel</li>
            <li>• Tally (ERP 9 & Prime)</li>
            <li>• CPCT Preparation</li>
          </ul>
        </div>

        {/* Designing */}
        <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition">
          <h3 className="text-xl font-semibold mb-4">
            Designing
          </h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Graphic Designing (Basics)</li>
          </ul>
        </div>
      </div>

      <p className="text-center text-gray-600 mt-12 text-base">
        Course structure, batches, and timings are explained at each branch.
      </p>
    </section>
  );
}
