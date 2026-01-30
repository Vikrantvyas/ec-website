"use client";

import { instituteData } from "../data/institute";

export default function HeroSection() {
  return (
    <section className="text-center px-4 pt-12 pb-8 bg-gradient-to-b from-white to-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        {instituteData.name}
      </h1>

      <p className="text-lg text-gray-700 mb-3">
        {instituteData.tagline}
      </p>

      <p className="text-gray-600 max-w-xl mx-auto">
        Helping students speak English confidently since{" "}
        <strong>{instituteData.since}</strong> through practical training,
        daily speaking practice, and personal guidance.
      </p>

      {/* Desktop CTA only */}
      <div className="hidden md:flex justify-center gap-4 mt-6">
        <a
          href={`tel:${instituteData.phone}`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          📞 Call Now
        </a>

        <a
          href={`https://wa.me/91${instituteData.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          💬 WhatsApp
        </a>
      </div>
    </section>
  );
}
