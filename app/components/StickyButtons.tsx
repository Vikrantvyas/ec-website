"use client";

export default function StickyButtons() {
  return (
    <>
      {/* Call Button */}
      <a
        href="tel:9713014234"
        className="fixed z-[9999] bottom-20 left-4
                   flex items-center gap-2
                   bg-blue-600 text-white px-4 py-3
                   rounded-full shadow-lg
                   text-sm"
      >
        📞 Call
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919713014234"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed z-[9999] bottom-20 right-4
                   flex items-center gap-2
                   bg-green-600 text-white px-4 py-3
                   rounded-full shadow-lg
                   text-sm"
      >
        💬 WhatsApp
      </a>
    </>
  );
}
