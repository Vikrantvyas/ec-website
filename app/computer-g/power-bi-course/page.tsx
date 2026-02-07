"use client";

import { useState } from "react";
import Image from "next/image";

/* 🔁 Reused HOME components */
import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= POWER BI CURRICULUM ================= */

const curriculum = {
  month1: [
    {
      title: "Week 1 – Power BI & Data Basics",
      icon: "/logos/powerbi.png",
      topics: [
        "What is Power BI?",
        "Power BI Desktop Installation",
        "Types of Data (Excel, CSV)",
        "Understanding Rows & Columns",
        "Importing Data into Power BI",
      ],
    },
    {
      title: "Week 2 – Power Query (Data Cleaning)",
      icon: "/logos/powerbi.png",
      topics: [
        "Power Query Editor",
        "Remove Duplicates & Errors",
        "Split / Merge Columns",
        "Change Data Types",
        "Practical Data Cleaning Tasks",
      ],
    },
    {
      title: "Week 3 – Data Model & Relationships",
      icon: "/logos/powerbi.png",
      topics: [
        "Data Modeling Basics",
        "Relationships (One-to-Many)",
        "Why Relationships Matter",
        "Model View Practice",
      ],
    },
  ],

  month2: [
    {
      title: "Week 4 – DAX Basics",
      icon: "/logos/powerbi.png",
      topics: [
        "Calculated Columns",
        "Measures",
        "SUM, COUNT, AVERAGE",
        "Basic DAX Logic",
      ],
    },
    {
      title: "Week 5 – Visualizations & Dashboards",
      icon: "/logos/powerbi.png",
      topics: [
        "Tables, Cards & Charts",
        "Slicers & Filters",
        "Interactive Dashboards",
        "Design Best Practices",
      ],
    },
    {
      title: "Week 6 – Projects & Job Preparation",
      icon: "/logos/powerbi.png",
      topics: [
        "Sales Dashboard Project",
        "MIS / Reporting Dashboard",
        "Export & Share Reports",
        "Interview-Oriented Questions",
      ],
    },
  ],
};

export default function PowerBICoursePage() {
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
          Power BI Course (Data Analytics Basics)
        </h1>
        <p className="text-gray-700 mb-2">
          Duration: <strong>1.5 Months</strong> | Offline Classes
        </p>
        <p className="max-w-2xl mx-auto text-gray-600">
          Learn professional data analysis & dashboard creation using Power BI at
          Computer-G, Nanda Nagar.
        </p>
      </section>

      {/* OVERVIEW */}
      <section className="px-4 py-12 bg-white text-center">
        <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          This course is designed for students and professionals who want to
          learn data analysis and reporting using Power BI. Focus is on practical
          dashboards, real Excel data and job-oriented skills.
        </p>
      </section>

      {/* HIGHLIGHTS */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-4 text-center">
          <div className="bg-white p-5 rounded-xl shadow">📊 Real Dashboards</div>
          <div className="bg-white p-5 rounded-xl shadow">🧹 Data Cleaning</div>
          <div className="bg-white p-5 rounded-xl shadow">📈 MIS Reporting</div>
          <div className="bg-white p-5 rounded-xl shadow">🎯 Job Oriented</div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="px-4 py-16 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
          Power BI Course Plan
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderMonth("Month 1", curriculum.month1, "m1")}
          {renderMonth("Month 2", curriculum.month2, "m2")}
        </div>
      </section>

      {/* TRAINER */}
      <section className="px-4 py-14 bg-white text-center">
        <h2 className="text-2xl font-bold mb-6">Power BI Trainer</h2>
        <Image
          src="/home/trainer.jpg"
          alt="Power BI Trainer"
          width={120}
          height={120}
          className="mx-auto rounded-full mb-4"
        />
        <p className="font-semibold text-gray-800">
          Experienced Data & MIS Trainer
        </p>
        <p className="text-gray-600 text-sm">
          Industry-oriented Power BI & Excel reporting experience
        </p>
      </section>

      {/* PRACTICE */}
      <section className="px-4 py-12 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-6">
          Practical Training & Projects
        </h2>
        <ul className="max-w-3xl mx-auto list-disc pl-6 text-gray-700 space-y-2">
          <li>Excel to Power BI data handling</li>
          <li>Sales & MIS dashboards</li>
          <li>Real office-style reporting</li>
          <li>Interview preparation tasks</li>
        </ul>
      </section>

      {/* MEDIA */}
      <HomeVideoSection
        title="How Power BI Classes Work"
        description="See how students learn dashboard creation and data analysis practically."
      />

      <GallerySection
        title="Power BI Practice Lab"
        subtitle="Students creating real dashboards"
        basePath="/computer-g/power-bi"
      />

      <HomeVideoReviewsSection
        title="Power BI Student Video Reviews"
        subtitle="Students sharing their Power BI learning experience"
        courseLabel="Power BI Course"
      />

      <TestimonialsSection heading="What our Power BI Students Say" />

      {/* CTA */}
      <section className="px-4 py-14 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Ready to Join Power BI Course?
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
