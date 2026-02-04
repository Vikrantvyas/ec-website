"use client";

export default function HomeVideoSection() {
  return (
    <section className="px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto">

        {/* Heading */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 mb-4 animate-fadeUp">
          Watch How English Club Works
        </h2>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 animate-fadeUp delay-100">
          This short video will help you understand our teaching method,
          classroom environment, online classes, and how we help students
          speak English confidently.
        </p>

        {/* Video */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-lg hover-lift animate-fadeUp delay-200">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/q-ThaUZcuSs?si=inbujz5i6ZPsFJtG"
            title="English Club Introduction Video"
            frameBorder="0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>

        {/* Points */}
        <div className="grid gap-6 md:grid-cols-3 mt-12">
          <div className="bg-white rounded-xl p-5 border shadow-sm hover-lift animate-fadeUp">
            <p className="font-semibold text-gray-800 mb-1">
              Practical Teaching
            </p>
            <p className="text-sm text-gray-600">
              Learn grammar and speaking through real-life practice.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm hover-lift animate-fadeUp delay-100">
            <p className="font-semibold text-gray-800 mb-1">
              Offline & Online Classes
            </p>
            <p className="text-sm text-gray-600">
              Classroom learning and live Zoom classes from home.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm hover-lift animate-fadeUp delay-200">
            <p className="font-semibold text-gray-800 mb-1">
              Trusted Since 2010
            </p>
            <p className="text-sm text-gray-600">
              Years of experience with thousands of students trained.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
