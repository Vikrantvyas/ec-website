"use client";

import { useMemo, useRef, useState } from "react";
import Footer from "../../components/Footer";

/* ================= DATA ================= */

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

const paragraphs = [
  "Typing speed and accuracy are essential skills for examinations and office work. Regular practice improves confidence and helps students type efficiently without looking at the keyboard.",
  "Accuracy matters more than speed in professional typing tests where even a small mistake can reduce the final score.",
  "Office typing requires focus rhythm and correct finger placement to avoid unnecessary errors.",
  "Students should practice typing daily to build muscle memory and confidence.",
  "Typing exams test patience consistency and accuracy under time pressure.",
  "Good typists read the word completely before typing it.",
  "Avoid rushing during typing practice sessions to reduce mistakes.",
  "Correct posture improves typing speed and reduces fatigue.",
  "Typing without backspace improves real exam performance.",
  "Confidence in typing comes from disciplined daily practice.",
  "Typing accuracy improves when distractions are removed.",
  "Professional typing requires calmness and concentration.",
  "Practice difficult words separately to improve accuracy.",
  "Regular evaluation helps in tracking typing improvement.",
  "Consistent effort leads to excellent typing performance.",
];

export default function EnglishTypingPage() {
  const [day, setDay] = useState(0);
  const [input, setInput] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [wrongWordsStore, setWrongWordsStore] = useState<string[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [practiceWrong, setPracticeWrong] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isParagraph = day >= 15 && !practiceWrong;

  const referenceText = practiceWrong
    ? wrongWordsStore.join(" ")
    : isParagraph
    ? paragraphs[day - 15]
    : wordDays[day];

  const referenceWords = useMemo(
    () => referenceText.split(" ").filter(Boolean),
    [referenceText]
  );

  /* -------- backspace rule -------- */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Backspace" && input.endsWith(" ")) {
      e.preventDefault();
    }
  };

  /* -------- typing -------- */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startedAt) setStartedAt(Date.now());

    const value = e.target.value;
    setInput(value);

    if (!value.endsWith(" ")) return;

    const words = value.trim().split(/\s+/);
    const typed = words[words.length - 1];
    const expected = referenceWords[typedWords.length] || "";

    const updated = [
      ...typedWords,
      typed === expected ? typed : `❌${expected}`,
    ];
    setTypedWords(updated);

    if (isParagraph && updated.length === referenceWords.length) {
      const wrongs = updated
        .filter((w) => w.startsWith("❌"))
        .map((w) => w.replace("❌", ""));
      setWrongWordsStore([...new Set(wrongs)]);
      setShowResult(true);
    }
  };

  /* -------- speed (popup only) -------- */
  const minutes =
    startedAt !== null ? (Date.now() - startedAt) / 60000 : 0;

  const grossWPM = minutes ? Math.round(typedWords.length / minutes) : 0;
  const wrongCount = typedWords.filter((w) => w.startsWith("❌")).length;
  const netWPM = minutes
    ? Math.round((typedWords.length - wrongCount) / minutes)
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
              setShowResult(false);
              setPracticeWrong(false);
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
        <div
          className="border p-4 font-mono text-lg leading-7
          overflow-y-auto overflow-x-hidden whitespace-normal"
          style={{
            height: "180px",
            wordBreak: "keep-all",
            overflowWrap: "normal",
          }}
        >
          {referenceWords.length === 0 && practiceWrong ? (
            <span className="text-gray-500">
              No wrong words to practice 🎉
            </span>
          ) : (
            referenceWords.map((w, i) => {
              let cls = "";
              if (isParagraph) {
                if (i === typedWords.length) cls = "bg-yellow-300";
                else if (i < typedWords.length)
                  cls = typedWords[i].startsWith("❌")
                    ? "text-red-600"
                    : "text-green-600";
              } else {
                cls =
                  Math.floor(i / 2) % 2 === 0
                    ? "text-blue-600"
                    : "text-green-600";
              }
              return (
                <span key={i} className={cls}>
                  {w}{" "}
                </span>
              );
            })
          )}
        </div>

        {/* TEXTAREA */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={(e) => e.preventDefault()}
          className="w-full border-2 rounded-lg p-4 font-mono mt-4"
          style={{ height: "220px" }}
          placeholder="Start typing here..."
        />
      </div>

      {/* RESULT MODAL */}
      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Typing Result</h2>
            <p>⚡ Gross WPM: {grossWPM}</p>
            <p>🎯 Net WPM: {netWPM}</p>
            <p>❌ Wrong Words: {wrongCount}</p>

            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => {
                  setShowResult(false);
                  setInput("");
                  setTypedWords([]);
                  setStartedAt(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Repeat
              </button>

              <button
                onClick={() => {
                  setPracticeWrong(true);
                  setShowResult(false);
                  setInput("");
                  setTypedWords([]);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Practice Wrong Words
              </button>

              <button
                onClick={() => {
                  setDay((d) => Math.min(d + 1, 29));
                  setShowResult(false);
                  setInput("");
                  setTypedWords([]);
                }}
                className="px-4 py-2 bg-gray-800 text-white rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
