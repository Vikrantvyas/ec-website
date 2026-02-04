"use client";

import { useState } from "react";
import ContactSection from "../../components/ContactSection";
import Footer from "../../components/Footer";

const curriculum = [
  {
    title: "Week 1 – Windows & Internet",
    topics: [
      "Computer Fundamentals",
      "Windows Interface & Settings",
      "File & Folder Management",
      "Control Panel & System Tools",
      "Internet Basics",
      "Browser Usage (Chrome)",
      "Email Creation & Usage",
    ],
  },
  {
    title: "Week 2 & 3 – MS Word",
    topics: [
      "MS Word Interface",
      "Typing Practice",
      "Font & Paragraph Formatting",
      "Page Setup & Printing",
      "Tables, Images & Shapes",
      "Resume & Letter Creation",
      "Practical Assignments",
    ],
  },
  {
    title: "Week 4 – MS PowerPoint",
    topics: [
      "Presentation Basics",
      "Slide Design & Layouts",
      "Animations & Transitions",
      "Charts & Images",
      "Professional Presentation Making",
    ],
  },
  {
    title: "Week 5 – Basic Excel",
    topics: [
      "Excel Interface",
      "Rows, Columns & Cells",
      "Basic Formulas",
      "SUM, AVERAGE Functions",
      "Formatting & Printing",
    ],
  },
  {
    title: "Week 6, 7 & 8 – Advanced Excel",
    topics: [
      "IF Function",
      "VLOOKUP / XLOOKUP",
      "Pivot Tables",
      "Charts & Data Analysis",
      "Practical Excel Projects",
    ],
  },
  {
    title: "Week 9 & 10 – Google Workspace",
    topics: [
      "Gmail Advanced Usage",
      "Google Docs",
      "Google Sheets",
      "Google Slides",
      "Google Drive & Sharing",
      "Online Collaboration",
    ],
  },
  {
    title: "Week 11 & 12 – Basic Designing",
    topics: [
      "Designing Fundamentals",
      "Canva Introduction",
      "Poster & Banner Design",
      "Social Media Post Design",
      "Basic Image Editing",
    ],
  },
];

export default function BasicComputerPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      {/* HERO */}
      <section className="px-4 pt-16 pb-12 bg-gradient-to-b from-blue-50 to-white text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 mb-3">
          Basic Computer Course
        </h1>
        <p className="text-gray-700 mb-2">
          Duration: <strong>3 Months</strong>
        </p>
        <p className="max-w-2xl mx-auto text-gray-600">
          Job-oriented basic computer training with practical approach.
          Conducted at Computer-G (Nanda Nagar Campus).
        </p>
      </section>

      {/* WEEK-WISE CURRICULUM */}
      <section className="px-4 py-16 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
          Week-Wise Course Plan
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {curriculum.map((week, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow"
              >
                {/* HEADER */}
                <button
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-semibold text-gray-800">
                    {week.title}
                  </span>

                  {/* Arrow */}
                  <span
                    className={`text-xl text-blue-600 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ˅
                  </span>
                </button>

                {/* CONTENT */}
                {isOpen && (
                  <div className="px-6 pb-4 border-t animate-fadeUp">
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 mt-3">
                      {week.topics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>

                    {/* NOTES PLACEHOLDER */}
                    <div className="mt-4">
                      <button className="text-sm font-medium text-green-600 hover:underline">
                        📄 Download Notes (PDF)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Want to Join Basic Computer Course?
        </h3>
        <p className="text-blue-100 mb-6">
          Call or WhatsApp us for fees, batches & demo class.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <a
            href="tel:9713014234"
            className="bg-white text-blue-700 px-6 py-3 rounded-lg font-medium"
          >
            📞 Call Now
          </a>
          <a
            href="https://wa.me/919713014234"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            💬 WhatsApp
          </a>
        </div>
      </section>

      <ContactSection />
      <Footer />
    </>
  );
}
