"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StepForm from "@/app/components/landing/StepForm";
import Image from "next/image";

import HomeVideoSection from "@/app/components/HomeVideoSection";
import HomeVideoReviewsSection from "@/app/components/HomeVideoReviewsSection";
import BranchesSection from "@/app/components/BranchesSection";

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
          remark: "Landing Page",
          enquired_by: "website",
          department: "english",
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
    <div className="landing-page min-h-screen bg-gray-50 p-4 space-y-6">

      {/* HERO */}
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

      {/* ❓ FAQ (TOP TRUST BLOCK) */}
      <div className="bg-white p-4 rounded shadow-sm space-y-3 text-sm">
        <p className="font-semibold text-lg text-center">FAQs</p>

        <details onClick={() => trackFAQ("Demo")}>
          <summary>फ्री डेमो क्लास कब होती है?</summary>
          <p>Daily 12 PM & 7 PM</p>
        </details>

        <details onClick={() => trackFAQ("Fees")}>
          <summary>फीस कितनी है?</summary>
          <p>₹1000/month (discount available)</p>
        </details>

        <details onClick={() => trackFAQ("Duration")}>
          <summary>कोर्स कितने दिनों का है?</summary>
          <p>3 Months (daily practice)</p>
        </details>

        <details onClick={() => trackFAQ("Online Offline")}>
          <summary>ऑनलाइन और ऑफलाइन में क्या फर्क है?</summary>
          <p>Online: Zoom | Offline: Classroom + lab</p>
        </details>

        <details onClick={() => trackFAQ("Practice")}>
          <summary>क्या रोज प्रैक्टिस होती है?</summary>
          <p>Yes, speaking + listening + reading daily</p>
        </details>

        <details onClick={() => trackFAQ("Job")}>
          <summary>क्या जॉब में मदद मिलेगी?</summary>
          <p>Interview practice कराया जाता है</p>
        </details>

        <details onClick={() => trackFAQ("Timing")}>
          <summary>कौन-कौन से बैच उपलब्ध हैं?</summary>
          <p>Morning, Afternoon & Evening</p>
        </details>

        <details onClick={() => trackFAQ("Beginner")}>
          <summary>अगर मुझे बिल्कुल English नहीं आती?</summary>
          <p>Basic से शुरू कराया जाता है</p>
        </details>

        <details onClick={() => trackFAQ("Age")}>
          <summary>क्या उम्र की कोई limit है?</summary>
          <p>No, anyone can join</p>
        </details>

        <details onClick={() => trackFAQ("Result")}>
          <summary>क्या सच में English बोलना आ जाएगा?</summary>
          <p>Yes, daily practice से confidence build होता है</p>
        </details>
      </div>

      {/* VIDEO */}
      <HomeVideoSection />

      {/* REVIEWS */}
      <HomeVideoReviewsSection />

      {/* BRANCH */}
      <BranchesSection />

      {/* 🔥 POPUP FORM */}
      <StepForm leadId={leadId} />

      {/* 🔥 FLOATING BUTTONS */}
      <div className="fixed bottom-4 left-4 z-50">
        <a
          href="tel:9893XXXXXX"
          className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg"
        >
          📞 Call
        </a>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <a
          href="https://wa.me/919893XXXXXX"
          target="_blank"
          className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          💬 WhatsApp
        </a>
      </div>

    </div>
  );
}