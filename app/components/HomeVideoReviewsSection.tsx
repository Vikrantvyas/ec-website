"use client";

type Props = {
  title?: string;
  subtitle?: string;
  courseLabel?: string;
};

/* 👉 YAHAN SIRF VIDEO LINKS CHANGE KARNE HAIN */
const videoEmbeds = [
  "https://www.youtube.com/embed/pVx4whJEUio?si=bks1XzR5dx2f_zV2", // 1st Video
  "https://www.youtube.com/embed/CbkhmXRfuLg?si=F0xwT0ol0NHliYRy", // 2
  "https://www.youtube.com/embed/UzEMlxwli8I?si=3NWVWcOCFqTNGu_O", // 3
  "https://www.youtube.com/embed/daDhuzW5I00?si=8lfErCy8bcibbjOX", // 4
  "https://www.youtube.com/embed/pVx4whJEUio?si=bks1XzR5dx2f_zV2", // 5
  "https://www.youtube.com/embed/q-ThaUZcuSs", // 6
];

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
          {videoEmbeds.map((videoSrc, index) => (
            <div
              key={index}
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
                  src={videoSrc}
                  title={`Student Video Review ${index + 1}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
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
