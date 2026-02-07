"use client";

import { useState } from "react";
import Image from "next/image";

/* 🔁 Reused HOME components */
import HomeVideoSection from "../../components/HomeVideoSection";
import HomeVideoReviewsSection from "../../components/HomeVideoReviewsSection";
import GallerySection from "../../components/GallerySection";
import TestimonialsSection from "../../components/TestimonialsSection";
import Footer from "../../components/Footer";

/* ================= TALLY CURRICULUM DATA ================= */

const curriculum = {
  month1: [
    {
      title: "Week 1 – Accounting Fundamentals",
      icon: "/logos/tally.png",
      topics: [
        "Introduction to Accounting",
        "Types of Accounts",
        "Golden Rules of Accounting",
        "Journal Entries",
        "Practical Accounting Examples",
      ],
    },
    {
      title: "Week 2 – Company Creation & Masters",
      icon: "/logos/tally.png",
      topics: [
        "Company Creation in Tally",
        "Ledger Creation",
        "Group Creation",
        "Voucher Types",
        "Practical Company Setup",
      ],
    },
    {
      title: "Week 3–4 – Day Book & Vouchers",
      icon: "/logos/tally.png",
      topics: [
        "Accounting Vouchers",
        "Contra, Payment, Receipt",
        "Sales & Purchase Vouchers",
        "Debit / Credit Notes",
        "Day Book Practice",
      ],
    },
  ],

  month2: [
    {
      title: "Week 5–6 – GST Basics & Configuration",
      icon: "/logos/gst.png",
      topics: [
        "GST Introduction",
        "Types of GST",
        "GST Registration Concept",
        "GST Configuration in Tally",
        "GST Ledgers Creation",
      ],
    },
    {
      title: "Week 7–8 – GST Transactions",
      icon: "/logos/gst.png",
      topics: [
        "GST Sales & Purchase Entries",
        "Input & Output GST",
        "GST Returns (GSTR-1, GSTR-3B)",
        "Practical GST Examples",
      ],
    },
  ],

  month3: [
    {
      title: "Week 9–10 – Tally ERP 9 + Tally Prime",
      icon: "/logos/tally.png",
      topics: [
        "Difference: ERP 9 vs Prime",
        "Navigation & Shortcuts",
        "Reports & Analysis",
        "Backup & Restore",
      ],
    },
    {
      title: "Week 11–12 – Final Accounts & Payroll",
      icon: "/logos/tally.png",
      topics: [
        "Trading & Profit Loss Account",
        "Balance Sheet",
        "Outstanding Reports",
        "Payroll Basics",
        "Final Practical Project",
      ],
    },
  ],
};

export default function TallyCoursePage() {
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
          Tally Course (ERP 9 + Tally Prime)
        </h1>
        <p className="text-gray-700 mb-2">
          Duration: <strong>3 Months</strong> | Offline Classes
        </p>
        <p className="max-w-2xl mx-auto text-gray-600">
          Integrated practical Tally training with GST at Computer-G, Nanda Nagar.
          Ideal for accounting jobs & commerce students.
        </p>
      </section>

      {/* OVERVIEW */}
      <section className="px-4 py-12 bg-white text-center">
        <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
        <p className="max-w-3xl mx-auto text-gray-600">
          This integrated Tally course covers both <strong>Tally ERP 9</strong> and
          <strong> Tally Prime</strong> with GST, focusing on real-world accounting
          practices and job-oriented skills.
        </p>
      </section>

      {/* HIGHLIGHTS */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-4 text-center">
          <div className="bg-white p-5 rounded-xl shadow">📊 Practical Accounting</div>
          <div className="bg-white p-5 rounded-xl shadow">🧾 GST with Returns</div>
          <div className="bg-white p-5 rounded-xl shadow">💼 Job Oriented</div>
          <div className="bg-white p-5 rounded-xl shadow">🧠 Beginner Friendly</div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="px-4 py-16 bg-gray-50">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-700">
          Month-Wise Tally Course Plan
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderMonth("Month 1", curriculum.month1, "m1")}
          {renderMonth("Month 2", curriculum.month2, "m2")}
          {renderMonth("Month 3", curriculum.month3, "m3")}
        </div>
      </section>

      {/* TRAINER */}
      <section className="px-4 py-14 bg-white text-center">
        <h2 className="text-2xl font-bold mb-6">Tally Trainer</h2>
        <Image
          src="/home/trainer.jpg"
          alt="Tally Trainer"
          width={120}
          height={120}
          className="mx-auto rounded-full mb-4"
        />
        <p className="font-semibold text-gray-800">
          Experienced Accounting Faculty
        </p>
        <p className="text-gray-600 text-sm">
          10+ years experience in Tally & GST training
        </p>
      </section>

      {/* PRACTICE */}
      <section className="px-4 py-12 bg-gray-50">
        <h2 className="text-2xl font-bold text-center mb-6">
          Practical Training & Tasks
        </h2>
        <ul className="max-w-3xl mx-auto list-disc pl-6 text-gray-700 space-y-2">
          <li>Live accounting entries practice</li>
          <li>GST returns & reports</li>
          <li>Company-based practical projects</li>
          <li>Final accounts preparation</li>
        </ul>
      </section>

      {/* MEDIA */}
      <HomeVideoSection
        title="How Tally Classes Work"
        description="See how students learn practical accounting & GST in our lab."
      />

      <GallerySection
        title="Tally Practical Lab"
        subtitle="Students practicing real accounting work"
        basePath="/computer-g/tally"
      />

      <HomeVideoReviewsSection
        title="Tally Student Video Reviews"
        subtitle="Students sharing their Tally learning experience"
        courseLabel="Tally Course"
      />

      <TestimonialsSection heading="What our Tally Students Say" />

      {/* CTA */}
      <section className="px-4 py-14 bg-blue-600 text-white text-center">
        <h3 className="text-2xl font-semibold mb-3">
          Ready to Join Tally Course?
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
