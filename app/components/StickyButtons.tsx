"use client";

export default function StickyButtons() {
  return (
    <>
      {/* Call Button */}
      <a
        href="tel:9713014234"
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2
                   bg-blue-600 text-white px-4 py-3 rounded-full
                   shadow-lg text-sm md:text-base"
      >
        📞 <span className="hidden sm:inline">Call</span>
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919713014234"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2
                   bg-green-600 text-white px-4 py-3 rounded-full
                   shadow-lg text-sm md:text-base"
        style={{ right: "16px" }}  // 👈 mobile safe shift
      >
        💬 <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </>
  );
}
