"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= 15 DAYS CONTINUOUS TYPING CONTENT ================= */

const typingDays = [
  {
    day: "Day 1",
    title: "Basic Home Row Words",
    text: [
      ["add as", "ha gas"],
      ["hag ask", "ass fall"],
      ["fad flag", "all lad"],
      ["lag dash", "gash jag"],
      ["gag gall", "flash glass"],
      ["sad hall", "hash half"],
      ["flask lash", "shall shah"],
      ["kaka shad", "add as"],
    ],
  },
  {
    day: "Day 2",
    title: "Short Words Practice",
    text: [
      ["to tie", "too tope"],
      ["tot toy", "tri tree"],
      ["true tour", "rope row"],
      ["rat out", "pity porter"],
      ["poor pope", "poppet port"],
    ],
  },
  {
    day: "Day 3",
    title: "Mixed Short Words",
    text: [
      ["fox was", "zoo ooz"],
      ["zip zax", "siz lozy"],
      ["cozy razer", "zeal maze"],
      ["zulum zinky", "zone zebra"],
    ],
  },
  {
    day: "Day 4",
    title: "Word Variety Practice",
    text: [
      ["van xmas", "sun vain"],
      ["elbow come", "aunt zero"],
      ["model visit", "zigzag volume"],
      ["moon bombay", "zoology xerasia"],
    ],
  },
  {
    day: "Day 5",
    title: "Academic Words – Easy",
    text: [
      ["quaint grumble", "frequent question"],
      ["grammarian query", "flavour baldrick"],
      ["auxiliary industrial", "knives quietly"],
      ["graduate aeroplane", "zoological thumb"],
    ],
  },
  {
    day: "Day 6",
    title: "Academic Words – Continued",
    text: [
      ["credits labourer", "knowledge obediently"],
      ["indigo boyco", "quo ent"],
      ["zylograph resolution", "raging horizen"],
      ["judicial zoography", "typewriter cheque"],
    ],
  },

  /* CAPITAL LETTERS START */

  {
    day: "Day 7",
    title: "Capital Letters Introduction",
    text: [
      ["Maximum Electric", "Sentiment Stenograph"],
      ["Absolute Ceiling", "Defamation Election"],
      ["Abstract Censure", "Deficit Budget"],
    ],
  },
  {
    day: "Day 8",
    title: "Office Vocabulary",
    text: [
      ["Emergency Abundant", "Chairman Default"],
      ["Employer Academic", "Chancellor Demotion"],
      ["Enclosure Academy", "Character Deputation"],
    ],
  },
  {
    day: "Day 9",
    title: "Administration Words",
    text: [
      ["Encroachment Access", "Circular Designation"],
      ["Evaluation Factory", "Gallery Hereditary"],
      ["Illegible Faculty", "Gazetted Highway"],
    ],
  },
  {
    day: "Day 10",
    title: "Governance Words",
    text: [
      ["Immediate Family", "General Homage"],
      ["Impartial Federation", "Governor Honorable"],
      ["Feudalism Gratis", "Honorary Implementation"],
    ],
  },
  {
    day: "Day 11",
    title: "Policy & Law",
    text: [
      ["Fictitious Claim", "Gratuity Hostile"],
      ["Imprisonment Gradation", "Incidental Journalism"],
      ["Library Magistrate", "National Journalist"],
    ],
  },
  {
    day: "Day 12",
    title: "Legal Language",
    text: [
      ["Labour Malpractice", "Nationalization Judgment"],
      ["Landmark Maintenance", "Navigation Jubilee"],
      ["Ledger Manifesto", "Nearest Judicial"],
    ],
  },
  {
    day: "Day 13",
    title: "Advanced Legal Terms",
    text: [
      ["Legislative Manipulation", "Necessary Jurisdiction"],
      ["Litigation Manuscript", "Negligence Justice"],
      ["Livelihood Maximum", "Nepotism Sabotage"],
    ],
  },
  {
    day: "Day 14",
    title: "Professional Vocabulary",
    text: [
      ["Technical Unconfirmed", "Vacancy Safeguard"],
      ["Temporary Uncontested", "Vacation Schedule"],
      ["Terminology Undertaking", "Vehicle Scrutiny"],
    ],
  },
  {
    day: "Day 15",
    title: "Final Typing Challenge",
    text: [
      ["Tourism Unified", "Vague Secretariat"],
      ["Transfer Urban", "Area Valid"],
      ["Standard Transmission", "Valuation Suspension"],
      ["Tribunal Underage", "Vacation"],
    ],
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
      <section className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="bg-white p-6 rounded-xl shadow max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Desktop Required
          </h2>
          <p className="text-gray-600">
            English Typing Practice works best on desktop or laptop.
          </p>
        </div>
      </section>
    );
  }

  const current = typingDays[activeDay];

  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-16 pb-12 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
          English Typing Practice
        </h1>
        <p className="max-w-2xl mx-auto text-gray-600">
          15 Days structured English typing practice system.
        </p>
      </section>

      {/* ⭐ GOOGLE REVIEWS */}
      <section className="px-4 pt-6">
        <div className="max-w-4xl mx-auto flex justify-center">
          <div className="flex items-center gap-4 bg-white border rounded-2xl px-5 py-4 shadow-sm">
            <span className="text-xl font-bold">
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

      {/* DAY TABS + CONTENT */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {typingDays.map((d, i) => (
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
            {current.title}
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Type each word pair three times. Do not copy or paste.
          </p>

          <div className="max-w-4xl mx-auto text-lg leading-relaxed mb-8">
            {current.text.map((pair, i) => (
              <span key={i}>
                <span className="text-blue-600 font-semibold">
                  {pair[0]}
                </span>{" "}
                <span className="text-green-600 font-semibold">
                  {pair[1]}
                </span>{" "}
              </span>
            ))}
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            placeholder="Start typing here..."
            className="w-full max-w-4xl mx-auto block border rounded-lg p-4 text-base focus:outline-none focus:ring"
            style={{ height: "220px" }} // ~10–12 lines
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
      <HomeVideoSection title="How English Typing Practice Works" />
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
          Want to Improve Your Typing Speed?
        </h3>
        <p className="text-blue-100 mb-6">
          Join our Computer or Spoken English courses today.
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
