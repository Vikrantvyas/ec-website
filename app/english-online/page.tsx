"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StepForm from "@/app/components/landing/StepForm";
import Image from "next/image";

import HomeVideoSection from "@/app/components/HomeVideoSection";
import HomeVideoReviewsSection from "@/app/components/HomeVideoReviewsSection";
import BranchesSection from "@/app/components/BranchesSection";

export const metadata = {
  title: "Spoken English Course - English Club Indore",
  description: "3 महीने में English बोलना सीखें | Daily Practice | Expert Trainers",

  openGraph: {
    title: "Spoken English Course - English Club",
    description: "3 महीने में English बोलना सीखें",
    url: "https://ecindore.com/english-online",
    siteName: "English Club",
    images: [
      {
        url: "https://ecindore.com/og-image.jpg", // 👈 important
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

export default function EnglishOnlinePage() {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ✅ Visitor ID (mobile safe)
  useEffect(() => {
    let visitorId = localStorage.getItem("visitor_id");

    if (!visitorId) {
      visitorId =
        Date.now().toString() + Math.random().toString(36).substring(2);
      localStorage.setItem("visitor_id", visitorId);
    }
  }, []);

  async function trackFAQ(question: string) {
    if (!leadId) return;

    await supabase.from("lead_followups").insert([
      {
        lead_id: leadId,
        result: "faq_click",
        remark: question,
      },
    ]);
  }

  // ✅ CTA BUTTON (auto shake ALWAYS)
  const CTA = () => (
    <div className="text-center">
      <button
        onClick={() => setShowForm(true)}
        className="mt-3 px-6 py-3 rounded-full text-white font-semibold shadow-lg 
        bg-gradient-to-r from-blue-600 to-indigo-600 shake-btn"
      >
        🎯 Free Demo Book करें
      </button>
    </div>
  );

  return (
    <div className="landing-page bg-gray-50 p-4 space-y-6">

      {/* 🔥 GLOBAL STYLE (NO DELAY) */}
      <style>
        {`
          .shake-btn {
            animation: shakeX 1s infinite;
          }

          @keyframes shakeX {
            0% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            50% { transform: translateX(4px); }
            75% { transform: translateX(-4px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>

      {/* HERO (NO BUTTON HERE) */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-blue-600">
          Speak English Confidently in 3 Months
        </h1>
        <p className="text-sm text-gray-600">
          Daily Practice + Expert Trainers + Real Speaking
        </p>
      </div>

      {/* TEACHER */}
      <div className="bg-white p-4 rounded shadow text-center space-y-3">
        <Image
          src="/nanda-nagar/teacher.jpg"
          alt="Trainer"
          width={120}
          height={120}
          className="mx-auto rounded-full"
        />
        <p className="font-semibold">Vikrant Vyas</p>
        <p className="text-sm text-gray-600">
          10+ years experience
        </p>
      </div>

      <CTA />

      {/* FAQ */}
      <div className="bg-white p-4 rounded shadow-sm space-y-3 text-sm">
        <p className="font-semibold text-lg text-center">FAQs</p>

        <details onClick={() => trackFAQ("Demo")}>
          <summary>फ्री डेमो क्लास कब होती है?</summary>
          <p>Daily 12 PM & 7 PM</p>
        </details>

        <details onClick={() => trackFAQ("Fees")}>
          <summary>फीस कितनी है?</summary>
          <p>₹1000/month</p>
        </details>

        <details onClick={() => trackFAQ("Duration")}>
          <summary>कोर्स कितने दिनों का है?</summary>
          <p>3 Months</p>
        </details>
      </div>

      <CTA />

      {/* VIDEO */}
      <HomeVideoSection />
      <CTA />

      {/* REVIEWS */}
      <HomeVideoReviewsSection />
      <CTA />

      {/* BRANCH */}
      <BranchesSection />
      <CTA />

      {/* STEP FORM */}
      {showForm && (
        <StepForm
          leadId={leadId}
          onClose={() => setShowForm(false)}
        />
      )}

    </div>
  );
}