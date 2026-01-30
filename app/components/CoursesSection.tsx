export default function CoursesSection() {
  return (
    <section className="py-6 px-4 bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-4">
        Courses We Offer
      </h2>

      <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-3">
        {/* Spoken English */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h3 className="text-lg font-semibold mb-2">
            Spoken English
          </h3>
          <ul className="space-y-1 text-gray-700">
            <li>• Basic to Advanced Levels</li>
            <li>• Grammar with Speaking Practice</li>
            <li>• Interview & Job Preparation</li>
            <li>• Personality & Confidence Building</li>
          </ul>
        </div>

        {/* Computer Courses */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h3 className="text-lg font-semibold mb-2">
            Computer Courses
          </h3>
          <ul className="space-y-1 text-gray-700">
            <li>• Basic Computer Course</li>
            <li>• Advanced Excel</li>
            <li>• Tally (ERP 9 & Prime)</li>
            <li>• CPCT Preparation</li>
          </ul>
        </div>

        {/* Designing */}
        <div className="bg-white rounded-xl p-5 shadow">
          <h3 className="text-lg font-semibold mb-2">
            Designing
          </h3>
          <ul className="space-y-1 text-gray-700">
            <li>• Graphic Designing (Basics)</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
