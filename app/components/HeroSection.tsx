"use client";

import { instituteData } from "../data/institute";

export default function HeroSection() {
  return (
    <section className="relative text-center py-24 px-4 bg-gradient-to-b from-white to-gray-100">
      {/* Soft background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
        {instituteData.name}
      </h1>

      <p className="text-lg md:text-xl text-gray-700 mb-6">
        {instituteData.tagline}
      </p>

      <p className="text-gray-600 max-w-2xl mx-auto mb-10 text-base md:text-lg">
        Helping students speak English confidently since{" "}
        <strong>{instituteData.since}</strong> through practical training,
        daily speaking practice, and personal guidance.
      </p>

      <div className="flex justify-center gap-5 flex-wrap">
        <a
          href={`tel:${instituteData.phone}`}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-8 py-3 rounded-xl text-base font-medium shadow-sm"
        >
          📞 Call Now
        </a>

        <a
          href={`https://wa.me/91${instituteData.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 transition text-white px-8 py-3 rounded-xl text-base font-medium shadow-sm"
        >
          💬 WhatsApp
        </a>
      </div>
    </section>
  );
}
