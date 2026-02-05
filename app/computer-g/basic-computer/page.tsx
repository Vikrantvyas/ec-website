"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ContactSection from "../../components/ContactSection";
import Footer from "../../components/Footer";

/* =========================
   CURRICULUM DATA
========================= */
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
                <div className="px-5 pb-4 border-t">
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
          Basic Computer Course in Indore
        </h1>
        <p className="text-gray-700 mb-2">
          Duration: <strong>3 Months</strong> | Offline Classes
        </p>
        <p className="max-w-2xl mx-auto text-gray-600">
          Learn computer fundamentals, MS Office, Excel, Internet & designing
          through practical lab-based training at Computer-G (Nanda Nagar).
        </p>
      </section>

      {/* OVERVIEW */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">
            Course Overview
          </h2>
          <p className="text-gray-700 leading-relaxed">
            This Basic Computer Course is designed for beginners who want to
            build confidence in computer usage for office work, studies, and
            daily digital tasks. The course focuses on hands-on practice rather
            than theory.
          </p>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3 text-center">
          <div className="bg-white p-6 rounded-xl shadow">
            💻 Practical Lab Training
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            👨‍🏫 Experienced Trainers
          </div>
          <div className="bg-white p-6 rounded-xl shadow">
            🕒 Flexible Batch Timings
          </div>
        </div>
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

      {/* TRAINER */}
      <section className="px-4 py-12 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">
            Course Trainer
          </h2>
          <Image
            src="/home/trainer.jpg"
            alt="Computer Trainer"
            width={120}
            height={120}
            className="mx-auto rounded-full mb-4"
          />
          <p className="font-semibold">Experienced Computer Faculty</p>
          <p className="text-gray-600 text-sm">
            10+ years experience in computer & office software training
          </p>
        </div>
      </section>

      {/* STUDENT TASKS */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-blue-700">
            Student Practice & Tasks
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Daily typing & document creation</li>
            <li>Excel calculation & reports</li>
            <li>Email & internet-based tasks</li>
            <li>Mini projects & assignments</li>
          </ul>
        </div>
      </section>

      {/* NAVIGATION */}
      <section className="px-4 py-10 bg-white text-center">
        <Link
          href="/computer-g"
          className="text-blue-600 font-medium hover:underline"
        >
          ← Back to All Computer Courses
        </Link>
      </section>

      {/* CTA */}
      <section className="px-4 py-12 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Ready to Join Basic Computer Course?
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
