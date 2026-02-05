"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= WORD DATA ================= */

const days = [
  {
    day: "Day 1",
    words:
      "add gas ask ass fall fad flag all dash flash glass sad hall half flask shall shah kaka",
  },
  {
    day: "Day 2",
    words:
      "to tie too toy tri tree true tour rope row rat out pity porter poor port upper trip towel worry root repute power peep yellow quiet",
  },
  {
    day: "Day 3",
    words:
      "go hate hot leg kill jug pastry skipper peru good hydro wood hair joy was",
  },
  {
    day: "Day 4",
    words:
      "van mam can bat fox zoo wax cat sun vat new zip cozy zeal maze zone zebra zmas vain elbow come aunt zero model visit",
  },
  {
    day: "Day 5",
    words:
      "Add Gas Ask Ass Fall Fad Flag All Dash Flash Glass Sad Hall Half Flask Shall Kaka",
  },
  {
    day: "Day 6",
    words:
      "To Tie Too Toy Tri Tree True Tour Rope Row Rat Out Pity Porter Poor Port Upper Trip Towel Worry Root Repute Power Quiet",
  },
  {
    day: "Day 7",
    words:
      "Go Hate Hot Leg Kill Jug Pastry Skipper Peru Good Hydro Wood Hair Joy Was",
  },
  {
    day: "Day 8",
    words:
      "Van Mam Can Bat Fox Zoo Wax Cat Sun Vat New Zip Cozy Zeal Maze Zone Zebra Zmas Vain Elbow Come Aunt Zero Model Visit",
  },
  {
    day: "Day 9",
    words:
      "Volume Bombay Zoology Vulture Victoria Quaint Grumble Frequent Question Grammarian Query Flavour Baldrick Auzillary Industrial Knives Quietly",
  },
  {
    day: "Day 10",
    words:
      "Graduate Aeroplane Zoological Thumb Credits Absolute Celling Defamation Election Labourer Knowledge Obediently Indigo Boycott Quotient",
  },
  {
    day: "Day 11",
    words:
      "Zylograph Resolution Raging Horizen Judicial Zoography Typewriter Cheque Maximum Electric Sentiment Stenograph",
  },
  {
    day: "Day 12",
    words:
      "Typing Practice Computer Skills Office Work Data Entry Keyboard Accuracy Speed Control Typing Speed Practice",
  },
  {
    day: "Day 13",
    words:
      "Professional Communication Business Writing Technical Knowledge Practical Training Daily Practice Improvement",
  },
  {
    day: "Day 14",
    words:
      "Examination Preparation Speed Accuracy Consistency Confidence Improvement Continuous Practice Evaluation",
  },
  {
    day: "Day 15",
    words:
      "Final Typing Challenge Maintain Rhythm Improve Speed Achieve Accuracy Professional Performance",
  },
];

export default function EnglishTypingPage() {
  const [activeDay, setActiveDay] = useState(0);
  const [input, setInput] = useState("");
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
            English Typing Practice works only on desktop or laptop.
          </p>
        </div>
      </section>
    );
  }

  /* ---------- WORD PAIR COLOR LOGIC ---------- */
  const words = useMemo(
    () => days[activeDay].words.split(" "),
    [activeDay]
  );

  /* ---------- LINE COUNT (VISUAL) ---------- */
  const approxCharsPerLine = 45;
  const linesTyped = Math.max(
    1,
    Math.ceil(input.length / approxCharsPerLine)
  );

  /* ---------- TYPING COLOR (3 LINES BLOCK) ---------- */
  const typingColor =
    Math.floor((linesTyped - 1) / 3) % 2 === 0
      ? "text-blue-600"
      : "text-green-600";

  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-16 pb-12 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
          English Typing Practice
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          15 Days structured English typing practice system
        </p>
      </section>

      {/* DAY TABS */}
      <section className="px-4 py-10 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {days.map((d, i) => (
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

          {/* WORDS (PAIR COLOR) */}
          <div className="max-w-5xl mx-auto text-lg leading-relaxed mb-2">
            {words.map((word, i) => {
              const pairIndex = Math.floor(i / 2);
              const color =
                pairIndex % 2 === 0 ? "text-blue-600" : "text-green-600";
              return (
                <span key={i} className={color}>
                  {word}{" "}
                </span>
              );
            })}
          </div>

          {/* INSTRUCTION */}
          <p className="text-center text-red-600 mb-4">
            Type each word pair in three lines
          </p>

          {/* TEXTAREA */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            placeholder="Start typing here..."
            className={`w-full max-w-5xl mx-auto block border rounded-lg p-4 text-base focus:outline-none focus:ring ${typingColor}`}
            style={{ height: "240px" }}
          />

          {/* LINE COUNTER (BELOW TEXTAREA) */}
          <div className="text-center mt-4">
            <span className="inline-block bg-black text-white px-5 py-2 rounded-full text-lg font-bold">
              Lines typed: {linesTyped}
            </span>
          </div>
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
        <p className="text-gray-800">
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

      <Footer />
    </>
  );
}
