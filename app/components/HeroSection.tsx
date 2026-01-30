"use client";

import { instituteData } from "../data/institute";

export default function HeroSection() {
  return (
    <section className="text-center py-16 px-4 bg-gradient-to-b from-white to-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold mb-3">
        {instituteData.name}
      </h1>

      <p className="text-lg text-gray-700 mb-4">
        {instituteData.tagline}
      </p>

      <p className="text-gray-600 max-w-xl mx-auto mb-6">
        Helping students speak English confidently since{" "}
        <strong>{instituteData.since}</strong> through practical training,
        daily speaking practice, and personal guidance.
      </p>

      {/* Desktop only buttons */}
      <div className="hidden md:flex justify-center gap-4">
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
