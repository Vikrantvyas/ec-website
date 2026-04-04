"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ChatBot from "@/app/components/landing/ChatBot";
import StepForm from "@/app/components/landing/StepForm";

export default function EnglishOnlinePage() {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [mode, setMode] = useState<"chat" | "form">("chat");

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

    const { data, error } = await supabase
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
    if (error) console.error("Lead insert error:", error);
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
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">

      {/* HERO */}
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold text-blue-600">
          Learn Spoken English Online
        </h1>
        <p className="text-sm text-gray-600">
          Start your demo class today 🚀
        </p>
      </div>

      {/* MODE SWITCH */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setMode("chat")}
          className={`px-3 py-1 rounded ${
            mode === "chat" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Chat Mode
        </button>

        <button
          onClick={() => setMode("form")}
          className={`px-3 py-1 rounded ${
            mode === "form" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Quick Form
        </button>
      </div>

      {/* CONTENT */}
      <div className="bg-white p-3 rounded shadow-sm">
        {mode === "chat" ? (
          <ChatBot leadId={leadId} />
        ) : (
          <StepForm leadId={leadId} />
        )}
      </div>

      {/* FAQ */}
      <div className="bg-white p-3 rounded shadow-sm space-y-2 text-sm">
        <p className="font-medium">FAQs</p>

        <details onClick={() => trackFAQ("Free Demo Class Timing")}>
          <summary>Free Demo Class Timing?</summary>
          <p className="whitespace-pre-line text-gray-600">
            Daily 12 PM & 7 PM
            {"\n"}Zoom Link:
            {"\n"}https://us06web.zoom.us/j/87344889114?pwd=m2AMsx6OgvFphUZfQPu3JghNciw1Vv.1
          </p>
        </details>

        <details onClick={() => trackFAQ("Regular Batches Timing")}>
          <summary>Regular Batches Timing?</summary>
          <p className="whitespace-pre-line text-gray-600">
            3 PM — Women
            {"\n"}6 PM — School Students
            {"\n"}8 PM — Mixed Batch
          </p>
        </details>

        <details onClick={() => trackFAQ("New Batches")}>
          <summary>New Upcoming Batches?</summary>
          <p className="whitespace-pre-line text-gray-600">
            8 AM — Mixed
            {"\n"}1 PM — Women
            {"\n"}2 PM — Women
            {"\n"}4 PM — Mixed
          </p>
        </details>

        <details onClick={() => trackFAQ("Course Details")}>
          <summary>Course Duration & Class Time?</summary>
          <p className="whitespace-pre-line text-gray-600">
            Duration: 3 Months
            {"\n"}Class: 1 Hour
            {"\n"}Days: Monday to Friday
          </p>
        </details>

        <details onClick={() => trackFAQ("Fees Details")}>
          <summary>Fees Details?</summary>
          <p className="whitespace-pre-line text-gray-600">
            ₹1000/month
            {"\n"}₹2000 full payment (₹1000 discount)
            {"\n"}Offline: ₹5000
          </p>
        </details>

        <details onClick={() => trackFAQ("Reviews")}>
          <summary>Student Reviews?</summary>
          <p className="text-blue-600">
            https://share.google/GFCU0sp1FV1kyXufk
          </p>
        </details>
      </div>
    </div>
  );
}