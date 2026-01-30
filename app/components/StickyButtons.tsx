"use client";

import { instituteData } from "../data/institute";

export default function StickyButtons() {
  return (
    <>
      {/* Call Button */}
      <a
        href={`tel:${instituteData.phone}`}
        className="fixed bottom-5 left-5 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-3 rounded-full shadow-lg text-sm font-medium"
      >
        📞 Call
      </a>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/91${instituteData.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-green-600 hover:bg-green-700 transition text-white px-4 py-3 rounded-full shadow-lg text-sm font-medium"
      >
        💬 WhatsApp
      </a>
    </>
  );
}
