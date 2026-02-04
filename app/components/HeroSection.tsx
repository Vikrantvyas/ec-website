"use client";

import { instituteData } from "../data/institute";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="text-center px-4 pt-12 pb-10 bg-gradient-to-b from-white to-gray-100">
      {/* Main Heading */}
      <h1 className="text-3xl md:text-4xl font-bold mb-2">
        {instituteData.name}
      </h1>

      <p className="text-lg text-gray-700 mb-3">
        Spoken English & Computer Training in Indore
      </p>

      <p className="text-gray-600 max-w-xl mx-auto">
        Helping students build confidence and practical skills since{" "}
        <strong>{instituteData.since}</strong> through offline classes,
        online live sessions, and personal guidance.
      </p>

      {/* Primary Program CTA (Desktop only) */}
      <div className="hidden md:flex justify-center gap-4 mt-6 flex-wrap">
        <Link
          href="/online-english"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          🌐 Online English (Live Zoom)
        </Link>

        <Link
          href="/computer-g"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          🖥️ Computer Courses
        </Link>
      </div>

      {/* Contact CTA (Desktop only) */}
      <div className="hidden md:flex justify-center gap-4 mt-4">
        <a
          href={`tel:${instituteData.phone}`}
          className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg"
        >
          📞 Call Now
        </a>

        <a
          href={`https://wa.me/91${instituteData.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-green-600 text-green-600 px-6 py-2 rounded-lg"
        >
          💬 WhatsApp
        </a>
      </div>

      {/* TRUST STRIP */}
      <div className="mt-10 bg-white rounded-xl shadow-sm max-w-4xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700 font-medium">
          <div>✔ Since 2010</div>
          <div>✔ 3 Branches</div>
          <div>✔ Online Classes</div>
          <div>✔ Practical Training</div>
        </div>
      </div>
    </section>
  );
}
