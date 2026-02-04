"use client";

import { useState } from "react";

const testimonials = [
  {
    name: "Riya",
    branch: "Nanda Nagar Branch",
    image: "/home/review-1.jpg",
    text:
      "English Club helped me gain confidence in spoken English. Daily speaking practice made a big difference.",
  },
  {
    name: "Ankit",
    branch: "Bapat Square Branch",
    image: "/home/review-2.jpg",
    text:
      "Very practical teaching method. My communication skills improved a lot after joining English Club.",
  },
  {
    name: "Neha",
    branch: "Aurobindo Hospital Branch",
    image: "/home/review-3.jpg",
    text:
      "Best environment for beginners. Teachers are friendly and very supportive.",
  },
];

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);

  const prev = () =>
    setIndex((index - 1 + testimonials.length) % testimonials.length);

  const next = () =>
    setIndex((index + 1) % testimonials.length);

  return (
    <section className="py-16 px-4 bg-gray-50 overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
        What Our Students Say
      </h2>

      <div className="relative max-w-5xl mx-auto flex items-center justify-center">

        {/* LEFT ARROW – DESKTOP ONLY */}
        <button
          onClick={prev}
          className="hidden md:flex absolute left-0 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
        >
          ‹
        </button>

        {/* TESTIMONIAL CARDS */}
        <div className="relative w-full h-[300px] flex items-center justify-center">

          {testimonials.map((t, i) => {
            let position = "hidden";

            if (i === index) position = "center";
            else if (i === (index - 1 + testimonials.length) % testimonials.length)
              position = "left";
            else if (i === (index + 1) % testimonials.length)
              position = "right";

            return (
              <div
                key={i}
                className={`
                  absolute transition-all duration-500 ease-in-out
                  ${
                    position === "center"
                      ? "scale-100 opacity-100 z-20"
                      : position === "left"
                      ? "-translate-x-56 scale-90 opacity-40 z-10"
                      : position === "right"
                      ? "translate-x-56 scale-90 opacity-40 z-10"
                      : "opacity-0"
                  }
                `}
              >
                <div className="bg-white rounded-3xl p-6 shadow-lg w-[320px]">

                  {/* OLD TRUSTED LAYOUT */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {t.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t.branch}
                      </p>
                    </div>
                  </div>

                  <p className="text-yellow-500 text-sm mb-2">
                    ⭐⭐⭐⭐⭐
                  </p>

                  <p className="text-gray-700 text-sm leading-relaxed">
                    {t.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT ARROW – DESKTOP ONLY */}
        <button
          onClick={next}
          className="hidden md:flex absolute right-0 z-10 w-10 h-10 items-center justify-center rounded-full bg-white shadow hover:bg-gray-100"
        >
          ›
        </button>
      </div>
    </section>
  );
}
