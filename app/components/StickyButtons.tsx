"use client";

export default function StickyButtons() {
  return (
    <>
      {/* Call Button */}
      <a
        href="tel:9713014234"
        className="fixed bottom-4 left-4 z-50
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
        className="fixed bottom-4 z-50
                   bg-green-500 text-white px-5 py-3 rounded-full
                   shadow-lg flex items-center gap-2"
        style={{ right: "12px" }}   // 👈 EXTRA LEFT SHIFT (important)
      >
        💬 WhatsApp
      </a>
    </>
  );
}
