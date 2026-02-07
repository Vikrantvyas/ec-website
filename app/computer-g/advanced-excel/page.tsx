"use client";

import { useState } from "react";
import Image from "next/image";

/* 🔁 Reused HOME components */
import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= ADVANCED EXCEL CURRICULUM ================= */

const curriculum = {
  month1: [
    {
      title: "Week 1 – Excel Core Functions",
      icon: "/logos/excel.png",
      topics: [
        "IF, AND, OR Functions",
        "COUNT, COUNTIF, SUMIF",
        "VLOOKUP / XLOOKUP",
        "Absolute & Relative Cell Reference",
        "Practical Formula Practice",
      ],
    },
    {
      title: "Week 2 – Data Handling & Formatting",
      icon: "/logos/excel.png",
      topics: [
        "Sorting & Filtering Data",
        "Conditional Formatting",
        "Data Validation (Dropdowns)",
        "Text Functions (LEFT, RIGHT, MID)",
        "Date & Time Functions",
      ],
    },
    {
      title: "Week 3 – Pivot Tables & Reports",
      icon: "/logos/excel.png",
      topics: [
        "Pivot Table Creation",
        "Pivot Charts",
        "Grouping & Filtering",
        "MIS Report Preparation",
        "Printable Office Reports",
      ],
    },
    {
      title: "Week 4 – Dashboards & Projects",
      icon: "/logos/excel.png",
      topics: [
        "Dashboard Design Basics",
        "Charts & Visual Reports",
        "Linking Multiple Sheets",
        "Real Office-Style Project",
        "Interview-Oriented Tasks",
      ],
    },
  ],
};

export default function AdvancedExcelPage() {
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
          Advanced Excel Course
        </h1>
        <p className="text-gray-700 mb-2">
          Duration: <strong>1 Month</strong> | Offline Classes
        </p>
        <p className="max-w-2xl mx-auto text-gray-600">
          Learn professional Excel skills for office work, MIS reporting and
          job-oriented tasks at Computer-G, Nanda Nagar.
        </p>
      </section>

      {/* OVERVIEW */}
      <section className="px-4 py-12 bg-white text-center">
        <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          This Advanced Excel course focuses on real office data handling,
          formulas, reports and dashboards. Ideal for students, job seekers and
          working professionals.
        </p>
      </section>

      {/* HIGHLIGHTS */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-4 text-center">
          <div className="bg-white p-5 rounded-xl shadow">📊 MIS Reports</div>
          <div className="bg-white p-5 rounded-xl shadow">📈 Dashboards</div>
          <div className="bg-white p-5 rounded-xl shadow">💼 Office Skills</div>
          <div className="bg-white p-5 rounded-xl shadow">🎯 Job Oriented</div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="px-4 py-16 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
          Advanced Excel Course Plan
        </h2>

        <div className="max-w-4xl mx-auto">
          {renderMonth("1 Month Course Plan", curriculum.month1, "m1")}
        </div>
      </section>

      {/* TRAINER */}
      <section className="px-4 py-14 bg-white text-center">
        <h2 className="text-2xl font-bold mb-6">Advanced Excel Trainer</h2>
        <Image
          src="/home/trainer.jpg"
          alt="Advanced Excel Trainer"
          width={120}
          height={120}
          className="mx-auto rounded-full mb-4"
        />
        <p className="font-semibold text-gray-800">
          Experienced Excel & MIS Trainer
        </p>
        <p className="text-gray-600 text-sm">
          Practical office reporting & data handling experience
        </p>
      </section>

      {/* PRACTICE */}
      <section className="px-4 py-12 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-6">
          Practical Training & Tasks
        </h2>
        <ul className="max-w-3xl mx-auto list-disc pl-6 text-gray-700 space-y-2">
          <li>Daily formula practice</li>
          <li>MIS & dashboard projects</li>
          <li>Real office-style Excel sheets</li>
          <li>Interview preparation tasks</li>
        </ul>
      </section>

      {/* MEDIA */}
      <HomeVideoSection
        title="How Advanced Excel Classes Work"
        description="See how students learn Excel practically with real office data."
      />

      <GallerySection
        title="Advanced Excel Practice Lab"
        subtitle="Students working on Excel reports & dashboards"
        basePath="/computer-g/advanced-excel"
      />

      <HomeVideoReviewsSection
        title="Advanced Excel Student Video Reviews"
        subtitle="Students sharing their Excel learning experience"
        courseLabel="Advanced Excel Course"
      />

      <TestimonialsSection heading="What our Advanced Excel Students Say" />

      {/* CTA */}
      <section className="px-4 py-14 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Ready to Join Advanced Excel Course?
        </h3>
        <p className="text-blue-100 mb-6">
          Call or WhatsApp us to know fees, batches & demo class.
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
