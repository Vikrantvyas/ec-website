"use client";

type Props = {
  title?: string;
  subtitle?: string;
  courseLabel?: string;
};

export default function HomeVideoReviewsSection({
  title = "Student Video Reviews",
  subtitle =
    "Real students. Real stories. Swipe to watch their journey with English Club.",
  courseLabel = "Spoken English",
}: Props) {
  return (
    <section className="px-4 py-16 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-6xl mx-auto">

        {/* HEADING */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-700 mb-4 animate-fadeUp">
          {title}
        </h2>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 animate-fadeUp delay-100">
          {subtitle}
        </p>

        {/* REELS */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="
                snap-start
                flex-shrink-0
                w-[220px] md:w-[240px]
                bg-white
                rounded-2xl
                shadow-md
                hover-lift
                animate-fadeUp
              "
            >
              <div className="relative w-full h-[390px] rounded-2xl overflow-hidden">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/q-ThaUZcuSs"
                  title={`Student Video Review ${i}`}
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="p-3 text-center">
                <p className="font-semibold text-gray-800">
                  Student Name
                </p>
                <p className="text-xs text-gray-600">
                  {courseLabel}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
