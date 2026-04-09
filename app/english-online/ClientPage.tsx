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
                {openSub === "q1" && <p className="pl-4 text-gray-600">ऑनलाइन घर से मोबाईल पर जॉईन कर सकते हैं, ऑफलाइन क्‍लास के लिए हमारे सेंटर पर आना होता है ।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q2"); trackFAQ("online_process")}} className="cursor-pointer">
                  👉 क्या ऑनलाइन क्लास लाइव होती है?
                </p>
                {openSub === "q2" && <p className="pl-4 text-gray-600">हाँ, यह क्लास लाइव होती हैं, टीचर और स्‍टूडेन्‍ट्स की वीडियो क्‍लास हाेती है, आपस में बातचीत होती है । आप इसका नीचे वीडियो भी देख सकते हैं ।</p>}
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
                {openSub === "q3" && <p className="pl-4 text-gray-600">यह 3 महीनों का कोर्स है ।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q4"); trackFAQ("daily_time")}} className="cursor-pointer">
                  👉 रोज कितनी देर की क्लास होती है?
                </p>
                {openSub === "q4" && <p className="pl-4 text-gray-600">क्‍लास रोज 1 घंटे की होती है ।।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q5"); trackFAQ("weekly_days")}} className="cursor-pointer">
                  👉 क्लास सप्ताह में कितने दिन होती है?
                </p>
                {openSub === "q5" && <p className="pl-4 text-gray-600">क्‍लास सोमवार से शुक्रवार प्रतिदिन होती है, शनिवार की क्‍लास की जगह रविवार को सुबह 10 बजे क्‍लास होती है ।</p>}
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
                {openSub === "q6" && <p className="pl-4 text-gray-600">आमतौर पर 10 से 15।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q7"); trackFAQ("separate_batches")}} className="cursor-pointer">
                  👉 क्या सब तरह के लोगों की एक ही बैच होती हैं?
                </p>
                {openSub === "q7" && <p className="pl-4 text-gray-600">नहीं, महिलाओं, बच्‍चों, स्‍कूल स्‍टूडेन्‍ट्स, जॉब वाले लोग सभी की अलग - अलग बैच होती है, कुछ बैचेस मिक्‍स भी हाेती हैं ।।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q8"); trackFAQ("fees")}} className="cursor-pointer">
                  👉 कोर्स की फीस क्या है?
                </p>
                {openSub === "q8" && <p className="pl-4 text-gray-600">कोर्स की कुल फीस 3000.00 रूपये हैं, जिन्‍हें आप 1000.00 रूपये प्रतिमाह जमा कर सकते हैं, यदि आप इकठ्ठा 2000.00 रूपये जमा करते हैं, तो आपको 1000.00 रूपये का डिस्‍काउंट मिल जाता है यानी दो माह का इकठ्ठा जमा करने पर तीसरा माह फ्री ।</p>}
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
                {openSub === "q9" && <p className="pl-4 text-gray-600">हाँ, डेमो क्‍लास बिल्कुल फ्री है ।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q10"); trackFAQ("demo_days")}} className="cursor-pointer">
                  👉 क्‍या डेमो क्लास रोज़ होती है?
                </p>
                {openSub === "q10" && <p className="pl-4 text-gray-600">यह तय न‍हीं है, स्‍टूडेन्‍ट्स की डिमांड और टीचर के अवेलेबल होने पर रोज की डेमो क्‍लास तय होती हैं ।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q11"); trackFAQ("demo_time")}} className="cursor-pointer">
                  👉 डेमो क्‍लास का टाइम क्या है?
                </p>
                {openSub === "q11" && <p className="pl-4 text-gray-600">डेमो क्‍लास का कोई निश्चित समय नहीं होता है, स्‍टूडेन्‍ट्स की सुविधा के अनुसार डेमो क्‍लास का समय निश्चित किया जाता है । अगले डेमो के टाईमिंग की जानकारी आपको डेमो बुक करने पर मिल जाती है ।।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q12"); trackFAQ("app_needed")}} className="cursor-pointer">
                  👉 क्‍या डेमो क्‍लास के लिए मोबाईल में कोई ऐप होना चाहिए?
                </p>
                {openSub === "q12" && <p className="pl-4 text-gray-600">हॉं, हम अपनी क्‍लासेस के लिए Zoom App का उपयोग करते हैं, इसलिए यह आपके मोबाईल में होना चाहिए । नीचे ज़ूम ऐप से जुड़े प्रश्‍नों मे आपको इसके बारे में सारी जानकारी मिल जाएगी ।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q13"); trackFAQ("demo_booking")}} className="cursor-pointer">
                  👉 फ्री क्‍लास डेमो कैसे लें?
                </p>
                {openSub === "q13" && <p className="pl-4 text-gray-600">नीचे "Free Demo Book करें" बटन से डेमो बुक करें।</p>}
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
                {openSub === "q14" && <p className="pl-4 text-gray-600">यह ऑनलाईन क्‍लास के लिए फेमस ऐप है, बहुत-सी क्‍लासेस और स्‍टूडेन्‍ट्स इसका उपयोग करते हैं और यह सुरक्षित वीडियो ऐप है।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q15"); trackFAQ("zoom_free")}} className="cursor-pointer">
                  👉 क्या ज़ूम ऐप फ्री है?
                </p>
                {openSub === "q15" && <p className="pl-4 text-gray-600">हाँ, यह फ्री ऐप है।</p>}
              </div>

              <div>
                <p 
  onClick={() => {toggleSub("q16"); trackFAQ("zoom_download")}} 
  className="cursor-pointer"
>
  👉 ज़ूम ऐप कैसे डाउनलोड करें?
</p>

{openSub === "q16" && (
  <p className="pl-4 text-gray-600">
    Play Store से डाउनलोड करें या इस लिंक का उपयोग करें - 
    <a
      href="https://play.google.com/store/apps/details?id=us.zoom.videomeetings"
      target="_blank"
      className="text-blue-600 underline ml-1"
    >
      Click Here
    </a>
  </p>
)}
                <p onClick={() => {toggleSub("q17"); trackFAQ("zoom_after")}} className="cursor-pointer">
                  👉 डाउनलोड के बाद क्या करें?
                </p>
                {openSub === "q17" && <p className="pl-4 text-gray-600">क्‍लास की लिंक से, क्‍लास के समय पर जॉइन करें।</p>}
              </div>

              <div>
                <p onClick={() => {toggleSub("q18"); trackFAQ("zoom_join")}} className="cursor-pointer">
                  👉 क्‍लास लिंक कैसे मिलेगी?
                </p>
                {openSub === "q18" && <p className="pl-4 text-gray-600">इसके लिए आप नीचे दिए "Free Demo Book करें" बटन को दबाऍं ।</p>}
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