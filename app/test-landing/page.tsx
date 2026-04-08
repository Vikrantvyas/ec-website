"use client";

import { useState } from "react";
import Image from "next/image";

import HomeVideoSection from "@/app/components/HomeVideoSection";
import HomeVideoReviewsSection from "@/app/components/HomeVideoReviewsSection";
import BranchesSection from "@/app/components/BranchesSection";
import StepForm from "@/app/components/landing/StepForm";

export default function TestLanding() {
  const [leadId] = useState<string | null>(null);

  return (
    <div className="landing-page bg-gray-50 p-4 space-y-6">

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

      {/* FAQ */}
      <div className="bg-white p-4 rounded shadow-sm space-y-3 text-sm">
        <p className="font-semibold text-lg text-center">FAQs</p>

        <details>
          <summary>फ्री डेमो क्लास कब होती है?</summary>
          <p>Daily 12 PM & 7 PM</p>
        </details>

        <details>
          <summary>फीस कितनी है?</summary>
          <p>₹1000/month</p>
        </details>
      </div>

      {/* VIDEO */}
      <HomeVideoSection />

      {/* REVIEWS */}
      <HomeVideoReviewsSection />

      {/* BRANCH */}
      <BranchesSection />

      {/* STEP FORM */}
      <StepForm leadId={leadId} />

      
    </div>
  );
}