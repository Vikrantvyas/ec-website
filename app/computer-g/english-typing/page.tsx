"use client";

import { useEffect, useMemo, useState } from "react";
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
  /* ---------- DAY 1–15 : WORD PRACTICE ---------- */
  {
    day: "Day 1",
    type: "words",
    content:
      "add gas ask ass fall fad flag all dash flash glass sad hall half flask shall shah kaka",
  },
  {
    day: "Day 2",
    type: "words",
    content:
      "to tie too toy tri tree true tour rope row rat out pity porter poor port upper trip towel worry root repute power peep yellow quiet",
  },
  {
    day: "Day 3",
    type: "words",
    content:
      "go hate hot leg kill jug pastry skipper peru good hydro wood hair joy was",
  },
  {
    day: "Day 4",
    type: "words",
    content:
      "van mam can bat fox zoo wax cat sun vat new zip cozy zeal maze zone zebra zmas vain elbow come aunt zero model visit",
  },
  {
    day: "Day 5",
    type: "words",
    content:
      "Add Gas Ask Ass Fall Fad Flag All Dash Flash Glass Sad Hall Half Flask Shall Kaka",
  },
  {
    day: "Day 6",
    type: "words",
    content:
      "To Tie Too Toy Tri Tree True Tour Rope Row Rat Out Pity Porter Poor Port Upper Trip Towel Worry Root Repute Power Quiet",
  },
  {
    day: "Day 7",
    type: "words",
    content:
      "Go Hate Hot Leg Kill Jug Pastry Skipper Peru Good Hydro Wood Hair Joy Was",
  },
  {
    day: "Day 8",
    type: "words",
    content:
      "Van Mam Can Bat Fox Zoo Wax Cat Sun Vat New Zip Cozy Zeal Maze Zone Zebra Zmas Vain Elbow Come Aunt Zero Model Visit",
  },
  {
    day: "Day 9",
    type: "words",
    content:
      "Volume Bombay Zoology Vulture Victoria Quaint Grumble Frequent Question Grammarian Query Flavour Baldrick Auzillary Industrial Knives Quietly",
  },
  {
    day: "Day 10",
    type: "words",
    content:
      "Graduate Aeroplane Zoological Thumb Credits Absolute Celling Defamation Election Labourer Knowledge Obediently Indigo Boycott Quotient",
  },
  {
    day: "Day 11",
    type: "words",
    content:
      "Zylograph Resolution Raging Horizen Judicial Zoography Typewriter Cheque Maximum Electric Sentiment Stenograph",
  },
  {
    day: "Day 12",
    type: "words",
    content:
      "Typing Practice Computer Skills Office Work Data Entry Keyboard Accuracy Speed Control Typing Speed Practice",
  },
  {
    day: "Day 13",
    type: "words",
    content:
      "Professional Communication Business Writing Technical Knowledge Practical Training Daily Practice Improvement",
  },
  {
    day: "Day 14",
    type: "words",
    content:
      "Examination Preparation Speed Accuracy Consistency Confidence Improvement Continuous Practice Evaluation",
  },
  {
    day: "Day 15",
    type: "words",
    content:
      "Final Typing Challenge Maintain Rhythm Improve Speed Achieve Accuracy Professional Performance",
  },

  /* ---------- DAY 16–30 : PARAGRAPH PRACTICE ---------- */
  ...Array.from({ length: 15 }).map((_, i) => ({
    day: `Day ${i + 16}`,
    type: "paragraph" as const,
    content:
      "Typing speed and accuracy are essential skills for examinations and office work. Regular practice helps students develop confidence, improve focus, and type efficiently without looking at the keyboard.",
  })),
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

  const currentDay = days[activeDay];

  const words = useMemo(
    () =>
      currentDay.type === "words"
        ? currentDay.content.split(" ")
        : [],
    [currentDay]
  );

  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-16 pb-12 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
          English Typing Practice
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          30 Days structured English typing practice program
        </p>
      </section>

      {/* DAY TABS (30 DAYS) */}
      <section className="px-4 py-10 bg-white">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 justify-center mb-6">
          {days.map((d, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveDay(i);
                setInput("");
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                activeDay === i
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {d.day}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto">
          {currentDay.type === "words" ? (
            <>
              {/* WORDS DISPLAY */}
              <div className="text-lg leading-relaxed mb-2">
                {words.map((word, i) => {
                  const pairIndex = Math.floor(i / 2);
                  const color =
                    pairIndex % 2 === 0
                      ? "text-blue-600"
                      : "text-green-600";
                  return (
                    <span key={i} className={color}>
                      {word}{" "}
                    </span>
                  );
                })}
              </div>

              <p className="text-center text-red-600 mb-4">
                Type each word pair in three lines
              </p>
            </>
          ) : (
            <>
              {/* PARAGRAPH DISPLAY */}
              <div className="border p-4 mb-4 max-h-[4.5em] overflow-y-auto text-lg leading-relaxed">
                {currentDay.content}
              </div>
              <p className="text-center text-gray-600 mb-4">
                Type the paragraph shown above
              </p>
            </>
          )}

          {/* TYPING BOX */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            placeholder="Start typing here..."
            className="w-full border rounded-lg p-4 text-base focus:outline-none focus:ring"
            style={{ height: "220px" }}
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
