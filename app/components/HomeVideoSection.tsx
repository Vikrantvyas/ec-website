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
    <section className="px-4 py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto">

        <h2 className="text-2xl md:text-3xl font-bold text-center text-blue-700 mb-4">
          {title}
        </h2>

        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
          {description}
        </p>

        <div className="relative w-full aspect-video rounded-2xl overflow-hidden border shadow-lg">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/q-ThaUZcuSs"
            allowFullScreen
          ></iframe>
        </div>

      </div>
    </section>
  );
}