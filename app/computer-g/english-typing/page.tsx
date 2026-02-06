"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= DAY DATA ================= */

type DayItem = {
  day: string;
  type: "words" | "paragraph";
  content: string;
};

const days: DayItem[] = [
  // -------- Day 1–15 (unchanged words practice – short sample here) --------
  ...Array.from({ length: 15 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    type: "words" as const,
    content:
      "add gas ask ass fall fad flag all dash flash glass sad hall half flask shall shah kaka",
  })),

  // -------- Day 16–30 Paragraph Typing --------
  ...Array.from({ length: 15 }).map((_, i) => ({
    day: `Day ${i + 16}`,
    type: "paragraph" as const,
    content:
      "Typing speed and accuracy are essential skills for examinations and office work. Regular practice improves confidence and helps students type efficiently without looking at the keyboard while maintaining consistency and focus.",
  })),
];

export default function EnglishTypingPage() {
  const [activeDay, setActiveDay] = useState(0);
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentDay = days[activeDay];
  const isParagraph = currentDay.type === "paragraph";

  const referenceWords = useMemo(
    () => (isParagraph ? currentDay.content.split(" ") : []),
    [currentDay, isParagraph]
  );

  /* Disable Backspace */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") e.preventDefault();
  };

  /* Typing Handler */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startedAt) setStartedAt(Date.now());

    const value = e.target.value;
    setInput(value);

    if (!isParagraph) return;

    if (!value.endsWith(" ")) return;

    const words = value.trim().split(/\s+/);
    const typed = words[words.length - 1];
    const index = typedWords.length;
    const expected = referenceWords[index] || "";

    setTypedWords((prev) => [
      ...prev,
      typed === expected ? typed : `❌${typed}`,
    ]);
  };

  /* Speed Calculation */
  const minutes =
    startedAt !== null ? (Date.now() - startedAt) / 60000 : 0;

  const grossWPM =
    minutes > 0 ? Math.round(typedWords.length / minutes) : 0;

  const correctWords = typedWords.filter(
    (w) => !w.startsWith("❌")
  ).length;

  const netWPM =
    minutes > 0 ? Math.round(correctWords / minutes) : 0;

  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-16 pb-10 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700">
          English Typing Practice
        </h1>
        <p className="text-gray-600">
          30 Days professional typing practice program
        </p>
      </section>

      {/* TABS – 2 EQUAL ROWS */}
      <section className="px-4 py-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-15 gap-2">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveDay(i);
                setInput("");
                setTypedWords([]);
                setStartedAt(null);
              }}
              className={`px-3 py-2 text-sm rounded ${
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

      {/* PARAGRAPH TYPING */}
      {isParagraph && (
        <section className="px-4 py-10 bg-white">
          <div className="max-w-5xl mx-auto">
            {/* Reference Paragraph */}
            <div className="border p-4 mb-4 max-h-[5.5em] overflow-y-auto font-mono text-lg leading-relaxed bg-gray-50">
              {referenceWords.map((word, i) => {
                let color = "text-gray-800";
                if (i === typedWords.length) color = "bg-yellow-300";
                else if (i < typedWords.length) {
                  color = typedWords[i].startsWith("❌")
                    ? "text-red-600"
                    : "text-green-600";
                }
                return (
                  <span key={i} className={`${color} mr-1 px-1`}>
                    {word}
                  </span>
                );
              })}
            </div>

            {/* Speed */}
            <div className="flex justify-center gap-6 mb-4 text-lg font-semibold">
              <span>⚡ Gross WPM: {grossWPM}</span>
              <span>🎯 Net WPM: {netWPM}</span>
            </div>

            {/* Typing Area */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={(e) => e.preventDefault()}
              placeholder="Start typing here..."
              className="w-full border-2 rounded-lg p-4 text-base font-mono focus:outline-none"
              style={{ height: "200px" }}
            />
          </div>
        </section>
      )}

      {/* MEDIA */}
      <HomeVideoSection title="How Typing Practice Works" />
      <GallerySection
        title="Typing Practice Lab"
        subtitle="Students practicing daily"
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
