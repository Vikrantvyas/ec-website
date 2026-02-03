"use client";

export default function StickyButtons() {
  return (
    <>
      {/* ❌ MOBILE PAR HIDE, 💻 DESKTOP PAR SHOW */}
      <div className="hidden md:block">
        {/* Call Button */}
        <a
          href="tel:9713014234"
          className="fixed bottom-6 left-6 z-40
                     bg-blue-600 text-white px-5 py-3 rounded-full
                     shadow-lg flex items-center gap-2"
        >
          📞 Call
        </a>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/919713014234"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40
                     bg-green-500 text-white px-5 py-3 rounded-full
                     shadow-lg flex items-center gap-2"
        >
          💬 WhatsApp
        </a>
      </div>
    </>
  );
}
