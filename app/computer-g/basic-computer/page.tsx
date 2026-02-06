"use client";

import { useState } from "react";
import Image from "next/image";

/* 🔁 Reused HOME components (course-specific props ke sath) */
import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= CURRICULUM DATA ================= */

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
      title: "Week 4 – PowerPoint",
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
      title: "Week 6–8 – Advanced Excel",
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
      title: "Week 9–10 – Google Workspace",
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
      title: "Week 11–12 – Basic Designing",
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

  const renderMonth = (title: string, items: any[], prefix: string) => (
    <div>
      <h3 className="text-xl font-semibold text-center mb-4 text-green-600">
        {title}
      </h3>

      <div className="space-y-4">
        {items.map((week, i) => {
          const key = `${prefix}-${i}`;
          const open = openKey === key;

          return (
            <div key={key} className="bg-white rounded-xl shadow">
              <button
                onClick={() => setOpenKey(open ? null : key)}
                className="w-full flex justify-between items-center px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <Image src={week.icon} alt="" width={28} height={28} />
                  <span className="font-semibold text-gray-800">
                    {week.title}
                  </span>
                </div>
                <span
                  className={`text-xl text-blue-600 transition-transform ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ˅
                </span>
              </button>

              {open && (
                <div className="px-5 pb-4 border-t">
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 mt-3">
                    {week.topics.map((t: string, j: number) => (
                      <li key={j}>{t}</li>
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
          Duration: <strong>3 Months</strong> | Offline Classes
        </p>
        <p className="max-w-2xl mx-auto text-gray-600">
          Practical computer training at Computer-G, Nanda Nagar – ideal for
          beginners, students & job seekers.
        </p>
      </section>

      {/* OVERVIEW */}
      <section className="px-4 py-12 bg-white text-center">
        <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          This course focuses on hands-on computer skills required for office
          work, studies and everyday digital tasks. No prior computer knowledge
          required.
        </p>
      </section>

      {/* HIGHLIGHTS */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-4 text-center">
          <div className="bg-white p-5 rounded-xl shadow">💻 Practical Lab</div>
          <div className="bg-white p-5 rounded-xl shadow">📄 Office Skills</div>
          <div className="bg-white p-5 rounded-xl shadow">🧠 Beginner Friendly</div>
          <div className="bg-white p-5 rounded-xl shadow">🎯 Job Oriented</div>
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
      <section className="px-4 py-14 bg-white text-center">
        <h2 className="text-2xl font-bold mb-6">
          Basic Computer Trainer
        </h2>
        <Image
          src="/home/trainer.jpg"
          alt="Basic Computer Trainer"
          width={120}
          height={120}
          className="mx-auto rounded-full mb-4"
        />
        <p className="font-semibold text-gray-800">
          Experienced Computer Faculty
        </p>
        <p className="text-gray-600 text-sm">
          10+ years experience in computer & office software training
        </p>
      </section>

      {/* PRACTICE */}
      <section className="px-4 py-12 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-6">
          Student Practice & Tasks
        </h2>
        <ul className="max-w-3xl mx-auto list-disc pl-6 text-gray-700 space-y-2">
          <li>Daily typing & document practice</li>
          <li>Excel calculations & reports</li>
          <li>Email & internet-based tasks</li>
          <li>Mini projects for confidence</li>
        </ul>
      </section>

      {/* COURSE-SPECIFIC MEDIA (HOME STYLE) */}
      <HomeVideoSection
        title="How Basic Computer Classes Work"
        description="See how students learn computers practically in our lab with real assignments."
      />

      <GallerySection
        title="Basic Computer Lab Gallery"
        subtitle="Real classroom & lab practice moments"
        basePath="/computer-g/basic"
      />

      <HomeVideoReviewsSection
        title="Basic Computer Student Video Reviews"
        subtitle="Real students sharing their computer learning experience"
        courseLabel="Basic Computer Course"
      />

      <TestimonialsSection
        heading="What our Basic Computer Students Say"
      />

      {/* SINGLE CTA */}
      <section className="px-4 py-14 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Ready to Join Basic Computer Course?
        </h3>
        <p className="text-blue-100 mb-6">
          Call or WhatsApp us for fees, batches & demo class.
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
