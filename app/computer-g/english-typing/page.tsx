"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

/* 🔁 Reused HOME components */
import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= PRACTICE TEXTS ================= */

const practiceTexts = [
  "Typing regularly helps you improve speed and accuracy. Focus on correct fingers and maintain a steady rhythm while typing each word carefully.",
  "Computer skills are essential in today’s world. Practicing typing daily will increase your confidence and efficiency in office work.",
  "Consistency is the key to success. Spend at least fifteen minutes every day on typing practice to see visible improvement."
];

export default function EnglishTypingPage() {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  const text = useMemo(() => practiceTexts[textIndex], [textIndex]);

  /* Desktop only check */
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsDesktop(false);
    }
  }, []);

  /* Typing logic */
  useEffect(() => {
    if (!started || completed) return;

    if (input.length === text.length) {
      const end = Date.now();
      setTimeTaken(Math.floor((end - (startTime || end)) / 1000));
      setCompleted(true);
      setStarted(false);
    }
  }, [input, started, completed, text, startTime]);

  const handleStart = () => {
    setInput("");
    setCompleted(false);
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleReset = () => {
    setStarted(false);
    setCompleted(false);
    setInput("");
    setTimeTaken(0);
    setStartTime(null);
    setTextIndex((prev) => (prev + 1) % practiceTexts.length);
  };

  const mistakes = input.split("").filter((c, i) => c !== text[i]).length;
  const wordsTyped = input.trim().split(/\s+/).length;
  const minutes = timeTaken / 60 || 1 / 60;
  const wpm = Math.round(wordsTyped / minutes);
  const accuracy = input.length
    ? Math.max(0, Math.round(((input.length - mistakes) / input.length) * 100))
    : 100;

  if (!isDesktop) {
    return (
      <section className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-md bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-3 text-red-600">
            Desktop Required
          </h2>
          <p className="text-gray-600">
            English Typing Practice works only on desktop or laptop for best
            accuracy and learning experience.
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
          Improve your typing speed and accuracy with daily English typing
          practice at Computer-G.
        </p>
      </section>

      {/* ⭐ Google Reviews Trust Badge */}
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

      {/* OVERVIEW */}
      <section className="px-4 py-12 bg-white text-center">
        <h2 className="text-2xl font-bold mb-4">
          Practice English Typing Daily
        </h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          This typing practice system is designed for beginners to improve
          typing speed, accuracy and confidence for exams, office work and
          daily computer use.
        </p>
      </section>

      {/* TYPING PRACTICE SYSTEM */}
      <section className="px-4 py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">
          <p className="mb-4 text-gray-700 font-medium">
            Type the following text:
          </p>

          <div className="mb-6 p-4 border rounded text-gray-800 leading-relaxed">
            {text.split("").map((char, i) => {
              let color = "";
              if (i < input.length) {
                color =
                  input[i] === char ? "text-green-600" : "text-red-600";
              }
              return (
                <span key={i} className={color}>
                  {char}
                </span>
              );
            })}
          </div>

          <textarea
            value={input}
            disabled={!started}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border rounded p-3 h-28 focus:outline-none focus:ring"
            placeholder="Click Start and begin typing here..."
            onPaste={(e) => e.preventDefault()}
          />

          <div className="flex flex-wrap gap-4 justify-between mt-6 text-sm text-gray-700">
            <div>⏱ Time: {timeTaken}s</div>
            <div>⚡ Speed: {completed ? wpm : 0} WPM</div>
            <div>🎯 Accuracy: {completed ? accuracy : 100}%</div>
            <div>❌ Mistakes: {mistakes}</div>
          </div>

          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={handleStart}
              disabled={started}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              ▶ Start
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-200 px-6 py-2 rounded-lg"
            >
              🔄 Reset
            </button>
          </div>

          {completed && (
            <p className="text-center mt-6 font-semibold text-green-600">
              Great job! Practice daily to improve your speed 🚀
            </p>
          )}
        </div>
      </section>

      {/* TRAINER */}
      <section className="px-4 py-14 bg-white text-center">
        <h2 className="text-2xl font-bold mb-6">English Typing Trainer</h2>
        <Image
          src="/home/trainer.jpg"
          alt="English Typing Trainer"
          width={120}
          height={120}
          className="mx-auto rounded-full mb-4"
        />
        <p className="font-semibold text-gray-800">
          Experienced English & Computer Faculty
        </p>
        <p className="text-gray-600 text-sm">
          Helping students improve typing speed and accuracy for exams and jobs
        </p>
      </section>

      {/* MEDIA */}
      <HomeVideoSection
        title="How English Typing Practice Works"
        description="See how students practice typing daily to improve speed and accuracy."
      />

      <GallerySection
        title="Typing Practice Lab"
        subtitle="Students practicing English typing at Computer-G"
        basePath="/english-typing"
      />

      <HomeVideoReviewsSection
        title="Typing Practice Student Reviews"
        subtitle="Students sharing their typing improvement experience"
        courseLabel="English Typing Practice"
      />

      <TestimonialsSection
        heading="What our Typing Practice Students Say"
      />

      {/* CTA */}
      <section className="px-4 py-14 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Want to Improve Your Typing Faster?
        </h3>
        <p className="text-blue-100 mb-6">
          Join our Computer or Spoken English courses at Computer-G.
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
