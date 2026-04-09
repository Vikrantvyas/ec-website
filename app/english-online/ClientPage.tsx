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
  const [showForm, setShowForm] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);

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

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
    setOpenSub(null);
  };

  const toggleSub = (key: string) => {
    setOpenSub(openSub === key ? null : key);
  };

  return (
    <div className="landing-page bg-gray-50 p-4 space-y-6">

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

      {/* HERO */}
      <div className="text-center space-y-2">
        <h1 className="text-1x2 font-bold text-blue-600">
          छोड़िये “ता है”, “ती है”, “रहा है”, “रही है”
        </h1>
        <p className="text-sm text-gray-600">
          इंग्लिश को जिएं हँसकर… खेलकर… गाकर… मज़े से
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
        <p className="font-semibold">Vikrant Vyas (Director - English Club)</p>
        <p className="text-sm text-gray-600">
          3 Branches in Indore, 15+ years experience
        </p>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <p className="font-semibold text-lg text-center">FAQ's</p>

        {/* GROUP 1 */}
        <div className="bg-white rounded shadow">
          <button onClick={() => toggle(0)} className="w-full p-4 flex justify-between">
            📱 ऑनलाइन क्लास से जुड़े सवाल
            <span>{openIndex === 0 ? "-" : "+"}</span>
          </button>

          {openIndex === 0 && (
            <div className="px-4 pb-4 space-y-2 text-sm">

              <div>
                <p onClick={() => {toggleSub("q1"); trackFAQ("online_vs_offline")}} className="cursor-pointer">
                  👉 ऑनलाइन और ऑफलाइन क्लास में क्या अंतर है?
                </p>
                {openSub === "q1" && <p className="pl-4 text-gray-600">ऑनलाइन घर से, ऑफलाइन सेंटर पर।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q2"); trackFAQ("online_process")}} className="cursor-pointer">
                  👉 क्या ऑनलाइन क्लास लाइव होती है?
                </p>
                {openSub === "q2" && <p className="pl-4 text-gray-600">हाँ, सभी क्लास लाइव होती हैं।</p>}
              </div>

            </div>
          )}
        </div>

        {/* GROUP 2 */}
        <div className="bg-white rounded shadow">
          <button onClick={() => toggle(1)} className="w-full p-4 flex justify-between">
            ⏱️ कोर्स और टाइमिंग से जुड़े प्रश्न
            <span>{openIndex === 1 ? "-" : "+"}</span>
          </button>

          {openIndex === 1 && (
            <div className="px-4 pb-4 space-y-2 text-sm">

              <div>
                <p onClick={() => {toggleSub("q3"); trackFAQ("duration")}} className="cursor-pointer">
                  👉 यह कोर्स कितने दिनों का है?
                </p>
                {openSub === "q3" && <p className="pl-4 text-gray-600">3 महीने का कोर्स।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q4"); trackFAQ("daily_time")}} className="cursor-pointer">
                  👉 रोज कितनी देर की क्लास होती है?
                </p>
                {openSub === "q4" && <p className="pl-4 text-gray-600">1 घंटे की क्लास।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q5"); trackFAQ("weekly_days")}} className="cursor-pointer">
                  👉 क्लास सप्ताह में कितने दिन होती है?
                </p>
                {openSub === "q5" && <p className="pl-4 text-gray-600">सप्ताह में 5 दिन क्लास।</p>}
              </div>

            </div>
          )}
        </div>

        {/* GROUP 3 */}
        <div className="bg-white rounded shadow">
          <button onClick={() => toggle(2)} className="w-full p-4 flex justify-between">
            👥 बैच और फीस से जुड़े प्रश्न
            <span>{openIndex === 2 ? "-" : "+"}</span>
          </button>

          {openIndex === 2 && (
            <div className="px-4 pb-4 space-y-2 text-sm">

              <div>
                <p onClick={() => {toggleSub("q6"); trackFAQ("batch_size")}} className="cursor-pointer">
                  👉 एक बैच में कितने स्टूडेंट्स होते हैं?
                </p>
                {openSub === "q6" && <p className="pl-4 text-gray-600">छोटे बैच।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q7"); trackFAQ("separate_batches")}} className="cursor-pointer">
                  👉 क्या अलग-अलग बैचेस होती हैं?
                </p>
                {openSub === "q7" && <p className="pl-4 text-gray-600">हाँ, अलग बैचेस।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q8"); trackFAQ("fees")}} className="cursor-pointer">
                  👉 कोर्स की फीस क्या है?
                </p>
                {openSub === "q8" && <p className="pl-4 text-gray-600">₹1000/month</p>}
              </div>

            </div>
          )}
        </div>

        {/* GROUP 4 */}
        <div className="bg-white rounded shadow">
          <button onClick={() => toggle(3)} className="w-full p-4 flex justify-between">
            👥 डेमो क्लास से जुड़े प्रश्न
            <span>{openIndex === 3 ? "-" : "+"}</span>
          </button>

          {openIndex === 3 && (
            <div className="px-4 pb-4 space-y-2 text-sm">

              <div>
                <p onClick={() => {toggleSub("q9"); trackFAQ("demo_free")}} className="cursor-pointer">
                  👉 क्या डेमो क्लास फ्री है?
                </p>
                {openSub === "q9" && <p className="pl-4 text-gray-600">हाँ, बिल्कुल फ्री।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q10"); trackFAQ("demo_days")}} className="cursor-pointer">
                  👉 डेमो क्लास कितने दिन की है?
                </p>
                {openSub === "q10" && <p className="pl-4 text-gray-600">1 दिन।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q11"); trackFAQ("demo_time")}} className="cursor-pointer">
                  👉 डेमो का टाइम क्या है?
                </p>
                {openSub === "q11" && <p className="pl-4 text-gray-600">12 PM और 7 PM।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q12"); trackFAQ("app_needed")}} className="cursor-pointer">
                  👉 क्या ऐप चाहिए?
                </p>
                {openSub === "q12" && <p className="pl-4 text-gray-600">Zoom ऐप चाहिए।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q13"); trackFAQ("demo_booking")}} className="cursor-pointer">
                  👉 फ्री डेमो कैसे लें?
                </p>
                {openSub === "q13" && <p className="pl-4 text-gray-600">नीचे बटन से बुक करें।</p>}
              </div>

            </div>
          )}
        </div>

        {/* GROUP 5 */}
        <div className="bg-white rounded shadow">
          <button onClick={() => toggle(4)} className="w-full p-4 flex justify-between">
            👥 ज़ूम ऐप से जुड़े प्रश्न
            <span>{openIndex === 4 ? "-" : "+"}</span>
          </button>

          {openIndex === 4 && (
            <div className="px-4 pb-4 space-y-2 text-sm">

              <div>
                <p onClick={() => {toggleSub("q14"); trackFAQ("zoom_safe")}} className="cursor-pointer">
                  👉 ज़ूम ऐप क्या है? क्या यह सुरक्षित है?
                </p>
                {openSub === "q14" && <p className="pl-4 text-gray-600">हाँ, यह सुरक्षित वीडियो ऐप है।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q15"); trackFAQ("zoom_free")}} className="cursor-pointer">
                  👉 क्या ज़ूम ऐप फ्री है?
                </p>
                {openSub === "q15" && <p className="pl-4 text-gray-600">हाँ, फ्री है।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q16"); trackFAQ("zoom_download")}} className="cursor-pointer">
                  👉 ज़ूम ऐप कैसे डाउनलोड करें?
                </p>
                {openSub === "q16" && <p className="pl-4 text-gray-600">Play Store से डाउनलोड करें।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q17"); trackFAQ("zoom_after")}} className="cursor-pointer">
                  👉 डाउनलोड के बाद क्या करें?
                </p>
                {openSub === "q17" && <p className="pl-4 text-gray-600">लिंक से जॉइन करें।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q18"); trackFAQ("zoom_join")}} className="cursor-pointer">
                  👉 लिंक पर क्लिक के बाद क्या करें?
                </p>
                {openSub === "q18" && <p className="pl-4 text-gray-600">Join Meeting दबाएं।</p>}
              </div>

            </div>
          )}
        </div>

      </div>

      <CTA />

      <HomeVideoSection />
      <HomeVideoReviewsSection />
      <CTA />

      <BranchesSection />
      <CTA />

      {showForm && (
        <StepForm
          leadId={leadId}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}