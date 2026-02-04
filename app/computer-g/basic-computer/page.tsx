"use client";

import { useState } from "react";
import Image from "next/image";
import ContactSection from "../../components/ContactSection";
import Footer from "../../components/Footer";

const curriculum = {
  month1: [
    {
      title: "Week 1 – Windows & Internet",
      icon: "/logos/internet.png",
      topics: [
        "Computer Fundamentals",
        "Windows Interface & Settings",
        "File & Folder Management",
        "Control Panel & System Tools",
        "Internet Basics",
        "Browser Usage",
        "Email Creation & Usage",
      ],
    },
    {
      title: "Week 2 & 3 – MS Word",
      icon: "/logos/word.png",
      topics: [
        "MS Word Interface",
        "Typing Practice",
        "Font & Paragraph Formatting",
        "Page Setup & Printing",
        "Tables, Images & Shapes",
        "Resume & Letter Creation",
      ],
    },
    {
      title: "Week 4 – MS PowerPoint",
      icon: "/logos/powerpoint.png",
      topics: [
        "Presentation Basics",
        "Slide Design & Layouts",
        "Animations & Transitions",
        "Charts & Images",
        "Professional Presentation Making",
      ],
    },
  ],

  month2: [
    {
      title: "Week 5 – Basic Excel",
      icon: "/logos/excel.png",
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
      icon: "/logos/excel.png",
      topics: [
        "IF Function",
        "VLOOKUP / XLOOKUP",
        "Pivot Tables",
        "Charts & Data Analysis",
        "Practical Excel Projects",
      ],
    },
  ],

  month3: [
    {
      title: "Week 9 & 10 – Google Workspace",
      icon: "/logos/google.png",
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
      icon: "/logos/design.png",
      topics: [
        "Designing Fundamentals",
        "Canva Introduction",
        "Poster & Banner Design",
        "Social Media Post Design",
        "Basic Image Editing",
      ],
    },
  ],
};

export default function BasicComputerPage() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const renderMonth = (
    monthTitle: string,
    items: { title: string; icon: string; topics: string[] }[],
    prefix: string
  ) => (
    <div>
      <h3 className="text-xl font-semibold text-center mb-4 text-green-600">
        {monthTitle}
      </h3>

      <div className="space-y-4">
        {items.map((week, index) => {
          const key = `${prefix}-${index}`;
          const isOpen = openKey === key;

          return (
            <div key={key} className="bg-white rounded-xl shadow">
              <button
                onClick={() => setOpenKey(isOpen ? null : key)}
                className="w-full flex justify-between items-center px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={week.icon}
                    alt={week.title}
                    width={28}
                    height={28}
                    className="flex-shrink-0"
                  />
                  <span className="font-semibold text-gray-800">
                    {week.title}
                  </span>
                </div>

                <span
                  className={`text-xl text-blue-600 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                >
                  ˅
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 border-t animate-fadeUp">
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 mt-3">
                    {week.topics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

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
          Job-oriented basic computer training with practical approach
          at Computer-G (Nanda Nagar Campus).
        </p>
      </section>

      {/* CURRICULUM */}
      <section className="px-4 py-16 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
          Month-Wise Course Plan
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMonth("Month 1", curriculum.month1, "m1")}
          {renderMonth("Month 2", curriculum.month2, "m2")}
          {renderMonth("Month 3", curriculum.month3, "m3")}
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
