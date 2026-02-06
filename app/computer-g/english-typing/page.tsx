"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= DAY 1–15 WORD DATA (USER PROVIDED) ================= */

const wordDays = [
  "add gas ask ass fall fad flag all dash flash glass sad hall half flask shall shah kaka",
  "to tie too toy tri tree true tour rope row rat out pity porter poor port upper trip towel worry root repute power peep yellow quiet",
  "go hate hot leg kill jug pastry skipper peru good hydro wood hair joy was",
  "van mam can bat fox zoo wax cat sun vat new zip cozy zeal maze zone zebra zmas vain elbow come aunt zero model visit",
  "Add Gas Ask Ass Fall Fad Flag All Dash Flash Glass Sad Hall Half Flask Shall Kaka",
  "To Tie Too Toy Tri Tree True Tour Rope Row Rat Out Pity Porter Poor Port Upper Trip Towel Worry Root Repute Power Quiet",
  "Go Hate Hot Leg Kill Jug Pastry Skipper Peru Good Hydro Wood Hair Joy Was",
  "Van Mam Can Bat Fox Zoo Wax Cat Sun Vat New Zip Cozy Zeal Maze Zone Zebra Zmas Vain Elbow Come Aunt Zero Model Visit",
  "Volume Bombay Zoology Vulture Victoria Quaint Grumble Frequent Question Grammarian Query Flavour Baldrick Auzillary Industrial Knives Quietly",
  "Graduate Aeroplane Zoological Thumb Credits Absolute Celling Defamation Election Labourer Knowledge Obediently Indigo Boycott Quotient",
  "Zylograph Resolution Raging Horizen Judicial Zoography Typewriter Cheque Maximum Electric Sentiment Stenograph",
  "Typing Practice Computer Skills Office Work Data Entry Keyboard Accuracy Speed Control Typing Speed Practice",
  "Professional Communication Business Writing Technical Knowledge Practical Training Daily Practice Improvement",
  "Examination Preparation Speed Accuracy Consistency Confidence Improvement Continuous Practice Evaluation",
  "Final Typing Challenge Maintain Rhythm Improve Speed Achieve Accuracy Professional Performance",
];

/* ================= DAY 16–30 PARAGRAPHS ================= */

const paragraphs = [
  "Typing speed plays a vital role in competitive examinations. Students who practice daily develop better control and confidence while typing.",
  "Accuracy in typing is more important than speed. A single mistake can reduce the final score in many typing tests.",
  "Office work requires fast and error free typing. Regular keyboard practice improves productivity and efficiency.",
  "Professional typists focus on rhythm and consistency rather than rushing through the text.",
  "Typing without looking at the keyboard is a skill that develops with disciplined practice.",
  "Daily typing exercises help students improve focus and reduce common spelling mistakes.",
  "Correct posture and finger placement are essential for long typing sessions.",
  "Typing tests require patience and calmness to maintain accuracy under time pressure.",
  "Students should avoid unnecessary backspacing during typing examinations.",
  "Practice sessions should gradually increase in difficulty to build confidence.",
  "Typing accuracy improves when students read the word carefully before typing.",
  "Consistent practice helps in mastering keyboard shortcuts and layouts.",
  "Speed typing is a combination of accuracy, rhythm and muscle memory.",
  "Professional exams evaluate both speed and correctness equally.",
  "A calm mind and steady hands lead to better typing performance.",
];

export default function EnglishTypingPage() {
  const [day, setDay] = useState(0);
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isParagraph = day >= 15;
  const referenceText = isParagraph ? paragraphs[day - 15] : wordDays[day];
  const referenceWords = useMemo(
    () => referenceText.split(" "),
    [referenceText]
  );

  /* Disable backspace */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace") e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startedAt) setStartedAt(Date.now());
    const value = e.target.value;
    setInput(value);

    if (!isParagraph || !value.endsWith(" ")) return;

    const words = value.trim().split(/\s+/);
    const typed = words[words.length - 1];
    const expected = referenceWords[typedWords.length] || "";

    setTypedWords((prev) => [
      ...prev,
      typed === expected ? typed : `❌${typed}`,
    ]);
  };

  const minutes =
    startedAt !== null ? (Date.now() - startedAt) / 60000 : 0;
  const grossWPM = minutes ? Math.round(typedWords.length / minutes) : 0;
  const netWPM = minutes
    ? Math.round(
        typedWords.filter((w) => !w.startsWith("❌")).length / minutes
      )
    : 0;

  return (
    <>
      {/* TABS */}
      <div className="px-4 py-6 grid grid-cols-15 gap-2">
        {Array.from({ length: 30 }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDay(i);
              setInput("");
              setTypedWords([]);
              setStartedAt(null);
            }}
            className={`px-3 py-2 rounded text-sm ${
              day === i ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Day {i + 1}
          </button>
        ))}
      </div>

      {/* REFERENCE */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="border p-4 min-h-[6em] leading-relaxed font-mono overflow-y-auto whitespace-normal break-words">
          {referenceWords.map((w, i) => {
            let cls = "";
            if (isParagraph) {
              if (i === typedWords.length) cls = "bg-yellow-300";
              else if (i < typedWords.length)
                cls = typedWords[i].startsWith("❌")
                  ? "text-red-600"
                  : "text-green-600";
            } else {
              cls = Math.floor(i / 2) % 2 === 0 ? "text-blue-600" : "text-green-600";
            }
            return (
              <span key={i} className={`${cls} mr-1 px-1`}>
                {w}
              </span>
            );
          })}
        </div>

        {isParagraph && (
          <div className="flex gap-6 justify-center my-4 font-semibold">
            <span>⚡ Gross WPM: {grossWPM}</span>
            <span>🎯 Net WPM: {netWPM}</span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(e) => e.preventDefault()}
          className="w-full border-2 rounded-lg p-4 font-mono"
          style={{ height: "220px" }}
          placeholder="Start typing here..."
        />
      </div>

      <Footer />
    </>
  );
}
