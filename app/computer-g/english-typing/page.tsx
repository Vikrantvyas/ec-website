"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= DAY 1–15 : WORD PRACTICE ================= */

const wordDays = Array.from({ length: 15 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  text: "add gas ask ass fall fad flag all dash flash glass sad hall half flask shall shah kaka",
}));

/* ================= DAY 16–30 : PARAGRAPH PRACTICE ================= */

const paragraphDays = Array.from({ length: 15 }).map((_, i) => ({
  day: `Day ${i + 16}`,
  paragraph:
    "Typing speed and accuracy are essential skills for examinations and office work. Regular practice improves confidence and helps students type efficiently without looking at the keyboard.",
}));

const days = [...wordDays, ...paragraphDays];

export default function EnglishTypingPage() {
  const [activeDay, setActiveDay] = useState(0);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isParagraphMode = activeDay >= 15;
  const currentParagraph = isParagraphMode
    ? paragraphDays[activeDay - 15].paragraph
    : "";

  const paragraphWords = useMemo(
    () => (isParagraphMode ? currentParagraph.split(" ") : []),
    [currentParagraph, isParagraphMode]
  );

  /* Disable backspace */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
    }
  };

  /* Handle typing */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startTime) setStartTime(Date.now());

    const value = e.target.value;
    setInput(value);

    if (!isParagraphMode) return;

    const words = value.trim().split(/\s+/);
    const lastWord = words[words.length - 1];

    if (value.endsWith(" ")) {
      const expected = paragraphWords[currentIndex];
      setTypedWords((prev) => [
        ...prev,
        lastWord === expected ? lastWord : `❌${lastWord}`,
      ]);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  /* Speed calculation */
  const minutes =
    startTime !== null ? (Date.now() - startTime) / 60000 : 0;

  const grossWPM =
    minutes > 0 ? Math.round(typedWords.length / minutes) : 0;

  const correctWords = typedWords.filter((w) => !w.startsWith("❌")).length;

  const netWPM = minutes > 0 ? Math.round(correctWords / minutes) : 0;

  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-16 pb-10 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">
          English Typing Practice
        </h1>
        <p className="text-gray-600">
          30 Days structured typing practice program
        </p>
      </section>

      {/* DAY TABS (2 ROWS AUTO) */}
      <section className="px-4 py-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveDay(i);
                setInput("");
                setTypedWords([]);
                setCurrentIndex(0);
                setStartTime(null);
              }}
              className={`px-3 py-2 rounded-lg text-sm ${
                activeDay === i
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-4 py-10 bg-white">
        <div className="max-w-5xl mx-auto">
          {/* WORD / PARAGRAPH DISPLAY */}
          <div
            className="border p-4 mb-4 text-lg leading-relaxed max-h-[4.5em] overflow-y-auto"
          >
            {isParagraphMode ? (
              paragraphWords.map((w, i) => {
                let color = "text-gray-800";
                if (i < typedWords.length) {
                  color = typedWords[i].startsWith("❌")
                    ? "text-red-600"
                    : "text-green-600";
                }
                return (
                  <span key={i} className={`${color} mr-1`}>
                    {w}
                  </span>
                );
              })
            ) : (
              <span>{days[activeDay].text}</span>
            )}
          </div>

          {/* TEXTAREA */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={(e) => e.preventDefault()}
            placeholder="Start typing here..."
            className="w-full border rounded-lg p-4 text-base focus:outline-none focus:ring"
            style={{ height: "200px" }}
          />

          {/* SPEED (DAY 16–30 ONLY) */}
          {isParagraphMode && (
            <div className="mt-4 flex justify-center gap-6 text-lg font-semibold">
              <div>⚡ Gross WPM: {grossWPM}</div>
              <div>🎯 Net WPM: {netWPM}</div>
            </div>
          )}
        </div>
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

      <Footer />
    </>
  );
}
