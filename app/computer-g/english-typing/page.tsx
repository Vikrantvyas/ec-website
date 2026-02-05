"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= 15 DAYS TYPING PLAN ================= */

const typingPlan = [
  {
    day: "Day 1",
    title: "Home Row Practice",
    pairs: [
      ["as", "df"],
      ["jk", "la"],
      ["sa", "fd"],
      ["al", "kj"],
      ["fa", "js"],
      ["da", "kl"],
      ["sd", "fj"],
      ["lk", "aj"],
      ["aa", "ss"],
      ["dd", "ff"],
    ],
  },
  {
    day: "Day 2",
    title: "Upper Row Practice",
    pairs: [
      ["qw", "er"],
      ["ui", "op"],
      ["ty", "re"],
      ["io", "yu"],
      ["we", "rt"],
      ["qp", "wo"],
      ["ee", "rr"],
      ["tt", "yy"],
      ["uu", "ii"],
      ["oo", "pp"],
    ],
  },
  {
    day: "Day 3",
    title: "Home + Upper Mix",
    pairs: [
      ["as", "we"],
      ["df", "rt"],
      ["jk", "ui"],
      ["kl", "op"],
      ["sa", "er"],
      ["fd", "ty"],
      ["aj", "yu"],
      ["lk", "io"],
      ["qw", "as"],
      ["er", "df"],
    ],
  },
  {
    day: "Day 4",
    title: "Lower Row Practice",
    pairs: [
      ["zx", "cv"],
      ["bn", "nm"],
      ["xc", "vb"],
      ["mn", "cb"],
      ["zz", "xx"],
      ["cc", "vv"],
      ["bb", "nn"],
      ["mm", "zz"],
    ],
  },
  {
    day: "Day 5",
    title: "Home + Lower Mix",
    pairs: [
      ["as", "zx"],
      ["df", "cv"],
      ["jk", "nm"],
      ["kl", "vb"],
      ["sa", "xc"],
      ["fd", "bn"],
      ["aj", "mn"],
      ["lk", "cb"],
    ],
  },
  {
    day: "Day 6",
    title: "Upper + Lower Mix",
    pairs: [
      ["qw", "zx"],
      ["er", "cv"],
      ["ui", "nm"],
      ["op", "vb"],
      ["we", "xc"],
      ["rt", "bn"],
      ["yu", "mn"],
      ["io", "cb"],
    ],
  },
  {
    day: "Day 7",
    title: "All Rows Practice",
    pairs: [
      ["as", "qw"],
      ["zx", "er"],
      ["df", "cv"],
      ["jk", "ui"],
      ["nm", "op"],
      ["la", "we"],
      ["vb", "rt"],
      ["mn", "yu"],
    ],
  },
  {
    day: "Day 8",
    title: "Random Mix",
    pairs: [
      ["qa", "zm"],
      ["we", "xn"],
      ["rt", "cv"],
      ["yu", "bn"],
      ["io", "kl"],
      ["op", "as"],
      ["qw", "mn"],
      ["er", "cb"],
    ],
  },
  {
    day: "Day 9",
    title: "Small English Words",
    pairs: [
      ["in", "on"],
      ["to", "is"],
      ["at", "up"],
      ["we", "go"],
      ["me", "my"],
      ["he", "it"],
    ],
  },
  {
    day: "Day 10",
    title: "Medium Words",
    pairs: [
      ["this", "that"],
      ["have", "will"],
      ["good", "time"],
      ["work", "type"],
      ["fast", "keys"],
    ],
  },
  {
    day: "Day 11",
    title: "Capital Letters (Shift)",
    pairs: [
      ["This", "That"],
      ["Good", "Time"],
      ["Work", "Type"],
      ["Have", "Will"],
    ],
  },
  {
    day: "Day 12",
    title: "Mixed Case Words",
    pairs: [
      ["Typing", "Practice"],
      ["English", "Computer"],
      ["Student", "Keyboard"],
      ["Office", "Skill"],
    ],
  },
  {
    day: "Day 13",
    title: "Double Capital Words",
    pairs: [
      ["Good Job", "New Day"],
      ["Best Work", "Fast Typing"],
      ["Right Hand", "Left Hand"],
    ],
  },
  {
    day: "Day 14",
    title: "Exam Style Words",
    pairs: [
      ["data entry", "office work"],
      ["computer skill", "typing speed"],
    ],
  },
  {
    day: "Day 15",
    title: "Final Challenge",
    pairs: [
      ["Typing Practice", "Computer Skills"],
      ["Office Work", "English Typing"],
    ],
  },
];

export default function EnglishTypingPage() {
  const [activeDay, setActiveDay] = useState(0);
  const [input, setInput] = useState("");

  const currentDay = typingPlan[activeDay];

  /* Desktop only */
  const [isDesktop, setIsDesktop] = useState(true);
  useEffect(() => {
    if (window.innerWidth < 1024) setIsDesktop(false);
  }, []);

  if (!isDesktop) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 text-center">
        <div className="bg-white p-6 rounded-xl shadow max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Desktop Required
          </h2>
          <p className="text-gray-600">
            English Typing Practice works best on desktop or laptop only.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-16 pb-12 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
          English Typing Practice
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          15 Days structured typing practice plan for beginners.
        </p>
      </section>

      {/* ⭐ Google Reviews */}
      <section className="px-4 pt-6">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="flex items-center gap-4 bg-white border rounded-2xl px-5 py-4 shadow-sm">
            <span className="text-xl font-bold leading-none">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </span>
            <div className="text-sm">
              <p className="font-semibold text-gray-800">
                4.9 / 5 <span className="text-yellow-400">★★★★★</span>
              </p>
              <p className="text-gray-500">
                Google Reviews • Trusted by students in Indore
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {typingPlan.map((d, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveDay(i);
                  setInput("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeDay === i
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {d.day}
              </button>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">
            {currentDay.title}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Type each word pair <strong>3 times</strong>. Do not copy or paste.
          </p>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {currentDay.pairs.map((pair, i) => (
              <div
                key={i}
                className="border rounded-lg p-4 text-center text-lg font-semibold"
              >
                <span className="text-blue-600">{pair[0]}</span>{" "}
                <span className="text-red-600">{pair[1]}</span>
              </div>
            ))}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            placeholder="Type here..."
            className="mt-8 w-full max-w-4xl mx-auto block border rounded-lg p-4 h-32 focus:outline-none focus:ring"
          />
        </div>
      </section>

      {/* TRAINER */}
      <section className="px-4 py-14 bg-gray-50 text-center">
        <h2 className="text-2xl font-bold mb-6">English Typing Trainer</h2>
        <Image
          src="/home/trainer.jpg"
          alt="Typing Trainer"
          width={120}
          height={120}
          className="mx-auto rounded-full mb-4"
        />
        <p className="font-semibold text-gray-800">
          Experienced English & Computer Faculty
        </p>
      </section>

      {/* MEDIA */}
      <HomeVideoSection title="How Typing Practice Works" />
      <GallerySection
        title="Typing Practice Lab"
        subtitle="Students practicing typing daily"
        basePath="/english-typing"
      />
      <HomeVideoReviewsSection
        title="Typing Practice Student Reviews"
        courseLabel="English Typing Practice"
      />
      <TestimonialsSection heading="What our Typing Students Say" />

      {/* CTA */}
      <section className="px-4 py-14 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Want to Improve Typing Speed?
        </h3>
        <p className="text-blue-100 mb-6">
          Join our Computer or Spoken English courses.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="tel:9713014234"
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            📞 Call Now
          </a>
          <a
            href="https://wa.me/919713014234"
            className="bg-green-500 px-6 py-3 rounded-lg font-medium"
          >
            💬 WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </>
  );
}
