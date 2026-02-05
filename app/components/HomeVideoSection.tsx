"use client";

type Props = {
  title?: string;
  description?: string;
};

export default function HomeVideoSection({
  title = "Watch How English Club Works",
  description =
    "This short video will help you understand our teaching method, classroom environment, online classes, and how we help students speak English confidently.",
}: Props) {
  return (
    <section className="px-4 py-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto">

        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 mb-4 animate-fadeUp">
          {title}
        </h2>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10 animate-fadeUp delay-100">
          {description}
        </p>

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-lg hover-lift animate-fadeUp delay-200">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/q-ThaUZcuSs"
            title="Course Introduction Video"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mt-12">
          <div className="bg-white rounded-xl p-5 border shadow-sm hover-lift">
            <p className="font-semibold mb-1">Practical Teaching</p>
            <p className="text-sm text-gray-600">
              Hands-on computer lab practice.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm hover-lift">
            <p className="font-semibold mb-1">Offline Classes</p>
            <p className="text-sm text-gray-600">
              Instructor-led classroom learning.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm hover-lift">
            <p className="font-semibold mb-1">Trusted Since 2010</p>
            <p className="text-sm text-gray-600">
              Thousands of students trained.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
