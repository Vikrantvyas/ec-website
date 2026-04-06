"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StepForm from "@/app/components/landing/StepForm";
import Image from "next/image";

// ✅ Import sections (home page se)
import HomeVideoSection from "@/app/components/HomeVideoSection";
import HomeVideoReviewsSection from "@/app/components/HomeVideoReviewsSection";
import BranchesSection from "@/app/components/BranchesSection";
import TrustSection from "@/app/components/TrustSection";
import MapSection from "@/app/components/MapSection";
import TestimonialsSection from "@/app/components/TestimonialsSection";
import GallerySection from "@/app/components/GallerySection";
import ContactSection from "@/app/components/ContactSection";
import Footer from "@/app/components/Footer";

export default function EnglishOnlinePage() {
  const [leadId, setLeadId] = useState<string | null>(null);

  useEffect(() => {
    handleLead();
  }, []);

  async function handleLead() {
    const params = new URLSearchParams(window.location.search);
    const mobile = params.get("mobile");

    if (!mobile) return;

    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("mobile_number", mobile)
      .maybeSingle();

    if (existing) {
      setLeadId(existing.id);
      return;
    }

    const now = new Date();

    const { data } = await supabase
      .from("leads")
      .insert([
        {
          mobile_number: mobile,
          channel: "whatsapp",
          method: "online",
          course: "Spoken English",
          enquiry_date: now.toISOString().split("T")[0],
          enquiry_time: now.toLocaleTimeString(),
          lead_stage: "new",
          lead_chances: "hot",
          remark: "Landing Page (English Online)",
          enquired_by: "website",
          department: "english",
          branch_id: null,
        },
      ])
      .select()
      .single();

    if (data) setLeadId(data.id);
  }

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6">

      {/* HERO */}
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-blue-600">
          Learn Spoken English Online
        </h1>
        <p className="text-sm text-gray-600">
          Start your demo class today 🚀
        </p>
      </div>

      {/* ✅ STEP FORM (NO WRAPPER = no white strip) */}
      <StepForm leadId={leadId} />

      {/* TEACHER SECTION */}
      <div className="bg-white p-4 rounded shadow text-center space-y-3">

        <Image
          src="/nanda-nagar/teacher.jpg"
          alt="English Trainer"
          width={120}
          height={120}
          className="mx-auto rounded-full"
        />

        <p className="font-semibold text-gray-800">
          Vikrant Vyas
        </p>

        <p className="text-sm text-gray-600">
          10+ years experience in Spoken English training
        </p>

        
      </div>

      {/* FAQ */}
      <div className="bg-white p-3 rounded shadow-sm space-y-2 text-sm">
        <p className="font-medium">FAQs</p>

        <details onClick={() => trackFAQ("Demo Timing")}>
          <summary>फ्री डेमो क्लास कब होती है?</summary>
          <p>Daily 12 PM & 7 PM</p>
        </details>

        <details onClick={() => trackFAQ("Batch Timing")}>
          <summary>कौन-कौन से बैच उपलब्ध हैं?</summary>
          <p>Morning, Afternoon & Evening batches</p>
        </details>

        <details onClick={() => trackFAQ("Duration")}>
          <summary>कोर्स कितने दिनों का है?</summary>
          <p>3 Months (Mon–Fri, 1 hour daily)</p>
        </details>

        <details onClick={() => trackFAQ("Fees")}>
          <summary>फीस कितनी है?</summary>
          <p>₹1000/month</p>
        </details>

        <details onClick={() => trackFAQ("Online vs Offline")}>
          <summary>ऑनलाइन और ऑफलाइन में क्या अंतर है?</summary>
          <p>Online: Zoom classes | Offline: Classroom</p>
        </details>

        <details onClick={() => trackFAQ("Job Help")}>
          <summary>क्या जॉब में मदद मिलेगी?</summary>
          <p>Yes, interview practice कराया जाता है</p>
        </details>

        <details onClick={() => trackFAQ("Practice")}>
          <summary>क्या प्रैक्टिस भी करवाई जाती है?</summary>
          <p>Daily speaking + listening practice</p>
        </details>
      </div>

      {/* 🎥 HOW IT WORKS */}
      <HomeVideoSection />

      {/* 🎤 STUDENT REVIEWS */}
      <HomeVideoReviewsSection />

      {/* 📍 BRANCHES */}
      <BranchesSection />

      {/* 🔥 TRUST + बाकी content */}
      <TrustSection />
      <MapSection />
      <TestimonialsSection />
      <GallerySection />
      <ContactSection />
      <Footer />

    </div>
  );
}