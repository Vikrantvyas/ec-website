"use client";

export default function HomeVideoReviewsSection() {
  return (
    <section className="px-4 py-16 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-4 animate-fadeUp">
          Real Student Video Reviews
        </h2>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 animate-fadeUp delay-100">
          Watch short video reviews from our students and see how English Club
          helped them gain confidence and practical skills.
        </p>

        {/* Video Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* Video Card 1 */}
          <div className="bg-white rounded-2xl border shadow-sm hover-lift animate-fadeUp">
            <div className="aspect-video rounded-t-2xl overflow-hidden">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/q-ThaUZcuSs"
                title="Student Video Review 1"
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-4">
              <p className="font-semibold text-gray-800">
                Student Name
              </p>
              <p className="text-sm text-gray-600">
                Spoken English Course
              </p>
            </div>
          </div>

          {/* Video Card 2 */}
          <div className="bg-white rounded-2xl border shadow-sm hover-lift animate-fadeUp delay-100">
            <div className="aspect-video rounded-t-2xl overflow-hidden">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/q-ThaUZcuSs"
                title="Student Video Review 2"
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-4">
              <p className="font-semibold text-gray-800">
                Student Name
              </p>
              <p className="text-sm text-gray-600">
                Spoken English Course
              </p>
            </div>
          </div>

          {/* Video Card 3 */}
          <div className="bg-white rounded-2xl border shadow-sm hover-lift animate-fadeUp delay-200">
            <div className="aspect-video rounded-t-2xl overflow-hidden">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/q-ThaUZcuSs"
                title="Student Video Review 3"
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-4">
              <p className="font-semibold text-gray-800">
                Student Name
              </p>
              <p className="text-sm text-gray-600">
                Computer Course
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
